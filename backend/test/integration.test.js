/**
 * In-process integration tests for authentication, authorization and CMS CRUD.
 *
 * This does NOT start the application server. It builds a throwaway Express app
 * from the same routers and middleware server.js mounts, listens on an ephemeral
 * port, and talks to an isolated database that is dropped when the run finishes.
 * The existing api.test.js needs a server already running on :5000; this one
 * needs nothing, so it can run in CI or on a clean checkout.
 *
 *   node --test test/integration.test.js     (or: npm test)
 *
 * Safety: the database name must contain "test" or the run aborts, so a
 * mistyped TEST_MONGODB_URI can never drop real data.
 */

import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import Admin from '../models/Admin.js';
import LearningProgram from '../models/LearningProgram.js';
import ContactMessage from '../models/ContactMessage.js';
import { ALL_PERMISSIONS } from '../utils/permissions.js';
import { notFound, errorHandler } from '../middleware/errorMiddleware.js';

import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import learningRoutes from '../routes/learningRoutes.js';
import contactRoutes from '../routes/contactRoutes.js';

const URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/qaroo_cms_test';
if (!/test/i.test(new URL(URI.replace('mongodb://', 'http://')).pathname)) {
  throw new Error(`Refusing to run: test database name must contain "test" (got ${URI})`);
}

process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-secret-at-least-32-chars-long';
process.env.NODE_ENV = 'test';

let server;
let base;

const SUPER = { email: 'super@test.local', password: 'Sup3rPass!23' };
const LIMITED = { email: 'limited@test.local', password: 'L1mitedPass!23' };
const NOPERMS = { email: 'noperms@test.local', password: 'N0Perms!23456' };

before(async () => {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 8000 });
  await mongoose.connection.dropDatabase();

  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  app.use('/api/admins', adminRoutes);
  app.use('/api/learning', learningRoutes);
  app.use('/api/contact', contactRoutes);
  app.use(notFound);
  app.use(errorHandler);

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;

  // Accounts are created straight through the model so the tests do not depend
  // on the email-verification flow, which needs SMTP.
  await Admin.create({
    name: 'Super', email: SUPER.email, password: SUPER.password,
    role: 'superadmin', permissions: ALL_PERMISSIONS,
    isEmailVerified: true, isApproved: true,
  });
  await Admin.create({
    name: 'Limited', email: LIMITED.email, password: LIMITED.password,
    role: 'admin', permissions: ['learning.read', 'learning.create', 'learning.update', 'contact.read', 'contact.update'],
    isEmailVerified: true, isApproved: true,
  });
  await Admin.create({
    name: 'NoPerms', email: NOPERMS.email, password: NOPERMS.password,
    role: 'admin', permissions: [],
    isEmailVerified: true, isApproved: true,
  });
});

after(async () => {
  // Always tear down, so no port is left bound and no test data survives.
  try { await mongoose.connection.dropDatabase(); } catch { /* already gone */ }
  await mongoose.disconnect();
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
});

/** fetch that keeps a cookie jar, the way a browser would. */
function client() {
  let jar = '';
  return async (method, path, body) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(jar ? { Cookie: jar } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      redirect: 'manual',
    });
    const set = res.headers.getSetCookie?.() || [];
    if (set.length) {
      const pairs = new Map(jar ? jar.split('; ').map((c) => [c.split('=')[0], c]) : []);
      for (const c of set) {
        const first = c.split(';')[0];
        const name = first.split('=')[0];
        if (/=;|=$/.test(first)) pairs.delete(name);
        else pairs.set(name, first);
      }
      jar = [...pairs.values()].join('; ');
    }
    let data = null;
    const text = await res.text();
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { status: res.status, data, jar };
  };
}

const loginAs = async (who) => {
  const c = client();
  const res = await c('POST', '/api/auth/login', { email: who.email, password: who.password });
  assert.equal(res.status, 200, `login failed for ${who.email}: ${JSON.stringify(res.data)}`);
  return c;
};

// ---------------------------------------------------------------- auth ------

test('login rejects an empty body', async () => {
  const c = client();
  const res = await c('POST', '/api/auth/login', {});
  assert.ok(res.status === 400 || res.status === 401, `expected 400/401, got ${res.status}`);
});

test('login rejects a wrong password', async () => {
  const c = client();
  const res = await c('POST', '/api/auth/login', { email: SUPER.email, password: 'wrong-password' });
  assert.equal(res.status, 401);
});

test('login rejects an unknown email', async () => {
  const c = client();
  const res = await c('POST', '/api/auth/login', { email: 'nobody@test.local', password: 'whatever123' });
  assert.equal(res.status, 401);
});

test('login succeeds and sets an httpOnly cookie', async () => {
  const c = client();
  const res = await c('POST', '/api/auth/login', SUPER);
  assert.equal(res.status, 200);
  assert.ok(/accessToken=/.test(res.jar), 'no accessToken cookie was set');
});

test('login never returns the password hash', async () => {
  const c = client();
  const res = await c('POST', '/api/auth/login', SUPER);
  assert.ok(!JSON.stringify(res.data).includes('$2'), 'a bcrypt hash appeared in the login response');
});

test('protected route rejects an absent token', async () => {
  const c = client();
  const res = await c('GET', '/api/auth/me');
  assert.equal(res.status, 401);
});

test('protected route rejects a malformed token', async () => {
  const res = await fetch(`${base}/api/auth/me`, { headers: { Authorization: 'Bearer not.a.jwt' } });
  assert.equal(res.status, 401);
});

test('protected route accepts a valid session', async () => {
  const c = await loginAs(SUPER);
  const res = await c('GET', '/api/auth/me');
  assert.equal(res.status, 200);
  assert.equal(res.data.data.admin.email, SUPER.email);
});

test('logout ends the session', async () => {
  const c = await loginAs(SUPER);
  assert.equal((await c('GET', '/api/auth/me')).status, 200);
  await c('POST', '/api/auth/logout');
  assert.equal((await c('GET', '/api/auth/me')).status, 401);
});

test('a disabled account cannot use a valid token', async () => {
  const c = await loginAs(NOPERMS);
  await Admin.updateOne({ email: NOPERMS.email }, { isDisabled: true });
  const res = await c('GET', '/api/auth/me');
  assert.equal(res.status, 403);
  await Admin.updateOne({ email: NOPERMS.email }, { isDisabled: false });
});

// ------------------------------------------------------- authorization -----

test('creating content without the permission is refused', async () => {
  const c = await loginAs(NOPERMS);
  const res = await c('POST', '/api/learning', { title: 'Should not be created' });
  assert.equal(res.status, 403);
});

test('creating content with the permission is allowed', async () => {
  const c = await loginAs(LIMITED);
  const res = await c('POST', '/api/learning', { title: 'Permitted Program' });
  assert.equal(res.status, 201, JSON.stringify(res.data));
  await LearningProgram.deleteOne({ _id: res.data.data.program._id });
});

test('deleting is refused when only create/update were granted', async () => {
  const sup = await loginAs(SUPER);
  const made = await sup('POST', '/api/learning', { title: 'Delete Me Please' });
  const id = made.data.data.program._id;

  const limited = await loginAs(LIMITED);
  const res = await limited('DELETE', `/api/learning/${id}`);
  assert.equal(res.status, 403, 'an admin without learning.delete was allowed to delete');

  await LearningProgram.deleteOne({ _id: id });
});

test('admin management is Super Admin only', async () => {
  const c = await loginAs(LIMITED);
  const res = await c('GET', '/api/admins');
  assert.equal(res.status, 403);
});

test('Super Admin can list admins', async () => {
  const c = await loginAs(SUPER);
  const res = await c('GET', '/api/admins');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.data.data.admins));
});

test('contact.update is grantable (regression: was missing from the catalogue)', async () => {
  const sup = await loginAs(SUPER);
  const limited = await Admin.findOne({ email: LIMITED.email });
  const res = await sup('PUT', `/api/admins/${limited._id}/permissions`, {
    permissions: ['contact.read', 'contact.update'],
  });
  assert.equal(res.status, 200);
  assert.ok(
    res.data.data.admin.permissions.includes('contact.update'),
    'contact.update was filtered out on save - it is not in ALL_PERMISSIONS'
  );
  // Restore the fixture's permissions for the remaining tests.
  await Admin.updateOne(
    { email: LIMITED.email },
    { permissions: ['learning.read', 'learning.create', 'learning.update', 'contact.read', 'contact.update'] }
  );
});

// -------------------------------------------------- draft disclosure -------

test('an unpublished program is not readable by id without authentication', async () => {
  const sup = await loginAs(SUPER);
  const made = await sup('POST', '/api/learning', { title: 'Secret Draft', status: 'draft' });
  const id = made.data.data.program._id;
  await LearningProgram.updateOne({ _id: id }, { status: 'draft' });

  const anon = client();
  const res = await anon('GET', `/api/learning/${id}`);
  assert.equal(res.status, 404, 'an unauthenticated caller read an unpublished program by id');

  await LearningProgram.deleteOne({ _id: id });
});

test('an unpublished program is not listed for an admin without the read permission', async () => {
  const sup = await loginAs(SUPER);
  const made = await sup('POST', '/api/learning', { title: 'Draft For Listing' });
  const id = made.data.data.program._id;
  await LearningProgram.updateOne({ _id: id }, { status: 'draft' });

  const noperms = await loginAs(NOPERMS);
  const res = await noperms('GET', '/api/learning');
  assert.equal(res.status, 200);
  const ids = res.data.data.programs.map((p) => String(p._id));
  assert.ok(!ids.includes(String(id)), 'a draft was listed for an admin with no learning.read');

  await LearningProgram.deleteOne({ _id: id });
});

test('an admin with the read permission does see drafts', async () => {
  const sup = await loginAs(SUPER);
  const made = await sup('POST', '/api/learning', { title: 'Visible Draft' });
  const id = made.data.data.program._id;
  await LearningProgram.updateOne({ _id: id }, { status: 'draft' });

  const limited = await loginAs(LIMITED);
  const res = await limited('GET', '/api/learning');
  const ids = res.data.data.programs.map((p) => String(p._id));
  assert.ok(ids.includes(String(id)), 'an admin holding learning.read could not see a draft');

  await LearningProgram.deleteOne({ _id: id });
});

// --------------------------------------------------------- CMS CRUD --------

test('full CRUD lifecycle on a learning program', async () => {
  const c = await loginAs(SUPER);

  const created = await c('POST', '/api/learning', { title: 'Lifecycle Program', desc: 'first' });
  assert.equal(created.status, 201);
  const id = created.data.data.program._id;
  assert.ok(created.data.data.program.slug, 'no slug was generated');

  const read = await c('GET', `/api/learning/${id}`);
  assert.equal(read.status, 200);
  assert.equal(read.data.data.program.title, 'Lifecycle Program');

  const updated = await c('PUT', `/api/learning/${id}`, { title: 'Lifecycle Program v2' });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.data.program.title, 'Lifecycle Program v2');

  // New content starts as a draft (normalizeProgram forces it), so the public
  // slug route must refuse it until it is published. /publish is a toggle.
  //
  // The slug is read back from the update response, not the create response:
  // updateProgram recomputes it from the title whenever the body carries no
  // explicit slug, so renaming a record changes its public URL.
  const slug = updated.data.data.program.slug;
  assert.equal(created.data.data.program.status, 'draft', 'new content should start as a draft');

  const whileDraft = await c('GET', `/api/learning/by-slug/${slug}`);
  assert.equal(whileDraft.status, 404, 'a draft was served by the public slug route');

  const published = await c('POST', `/api/learning/${id}/publish`);
  assert.equal(published.status, 200);
  assert.equal(published.data.data.program.status, 'published');

  const bySlug = await c('GET', `/api/learning/by-slug/${slug}`);
  assert.equal(bySlug.status, 200, 'a published program was not reachable by slug');

  // Toggling again takes it back out of the public site.
  const unpublished = await c('POST', `/api/learning/${id}/publish`);
  assert.equal(unpublished.data.data.program.status, 'draft');
  assert.equal((await c('GET', `/api/learning/by-slug/${slug}`)).status, 404);

  const removed = await c('DELETE', `/api/learning/${id}`);
  assert.equal(removed.status, 200);

  const gone = await c('GET', `/api/learning/${id}`);
  assert.equal(gone.status, 404);
});

test('an invalid id is handled, not crashed on', async () => {
  const c = await loginAs(SUPER);
  const res = await c('GET', '/api/learning/not-a-valid-object-id');
  assert.ok(res.status === 404 || res.status === 400, `expected 404/400, got ${res.status}`);
});

// ----------------------------------------------------------- bounds --------

test('a list reports total and honours ?limit', async () => {
  const c = await loginAs(SUPER);
  const ids = [];
  for (const n of [1, 2, 3]) {
    const r = await c('POST', '/api/learning', { title: `Bounded ${n}` });
    ids.push(r.data.data.program._id);
  }

  const all = await c('GET', '/api/learning');
  assert.equal(typeof all.data.total, 'number', 'total was not returned');
  assert.ok(all.data.total >= 3);

  const one = await c('GET', '/api/learning?limit=1');
  assert.equal(one.data.data.programs.length, 1, '?limit was not applied');
  assert.equal(one.data.count, 1);
  assert.ok(one.data.total >= 3, 'total should count every match, not the page');

  for (const id of ids) await LearningProgram.deleteOne({ _id: id });
});

test('a public contact submission is stored bounded', async () => {
  const anon = client();
  const res = await anon('POST', '/api/contact', {
    name: 'A'.repeat(500),
    email: 'flood@test.local',
    message: 'M'.repeat(50000),
  });
  assert.equal(res.status, 201);
  const saved = await ContactMessage.findOne({ email: 'flood@test.local' });
  assert.ok(saved.name.length <= 120, `name stored at ${saved.name.length} chars`);
  assert.ok(saved.message.length <= 5000, `message stored at ${saved.message.length} chars`);
  await ContactMessage.deleteOne({ _id: saved._id });
});

test('a contact submission missing required fields is refused', async () => {
  const anon = client();
  const res = await anon('POST', '/api/contact', { name: 'No Email' });
  assert.equal(res.status, 400);
});

// ------------------------------------------------- bootstrap marker -------

test('many ordinary admins can coexist (regression: unique sparse index on a null default)', async () => {
  // `bootstrap` must be ABSENT on ordinary admins. A sparse index does not skip
  // an explicit null, so a `default: null` made the unique index reject the
  // second admin - hidden only because the index was declared twice and never
  // applied as unique.
  const made = [];
  for (const n of [1, 2, 3, 4]) {
    const a = await Admin.create({
      name: `Bulk ${n}`, email: `bulk${n}@test.local`, password: 'BulkPass!2345',
      role: 'admin', permissions: [], isEmailVerified: true, isApproved: true,
    });
    made.push(a._id);
    assert.equal(a.bootstrap, undefined, 'bootstrap should be absent on an ordinary admin');
  }
  const raw = await Admin.collection.findOne({ email: 'bulk1@test.local' });
  assert.ok(!('bootstrap' in raw), 'bootstrap was written to the document, so sparse cannot skip it');
  for (const id of made) await Admin.deleteOne({ _id: id });
});

test('only one admin can hold the bootstrap marker', async () => {
  const first = await Admin.create({
    name: 'Boot One', email: 'boot1@test.local', password: 'BootPass!2345', bootstrap: true,
  });
  await assert.rejects(
    () => Admin.create({
      name: 'Boot Two', email: 'boot2@test.local', password: 'BootPass!2345', bootstrap: true,
    }),
    (err) => err.code === 11000,
    'a second bootstrap claim was accepted - the unique index is not in force'
  );
  await Admin.deleteOne({ _id: first._id });
});

test('an unknown route returns a 404 payload, not HTML', async () => {
  const c = client();
  const res = await c('GET', '/api/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
});
