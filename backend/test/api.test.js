// End-to-end API test - boots server, exercises the full auth/permissions/CRUD flow.
import '../server.js';
import Admin from '../models/Admin.js';

const BASE = 'http://localhost:5000/api';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Login tests authenticate as the seeded Super Admin, whose credentials now
// come from the environment (the seed fails if ADMIN_EMAIL/ADMIN_PASSWORD are
// unset, so defaults are intentionally NOT hardcoded here).
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

let passed = 0;
let failed = 0;
function check(name, cond, extra = '') {
  if (cond) {
    passed++;
    console.log(`  PASS: ${name}`);
  } else {
    failed++;
    console.log(`  FAIL: ${name} ${extra}`);
  }
}

async function req(method, url, { token, body, cookie } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(BASE + url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON response */ }
  return { status: res.status, json, headers: res.headers };
}

async function main() {
  await wait(1500);

  console.log('\n== Health ==');
  const health = await req('GET', '/health');
  check('health endpoint', health.status === 200);

  console.log('\n== Login (super admin) ==');
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('  SKIP: set ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env to run login tests.');
    process.exit(1);
  }
  const login = await req('POST', '/auth/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  check('super admin login', login.status === 200, JSON.stringify(login.json));
  const superToken = login.json?.data?.accessToken;
  check('super admin has token', !!superToken);
  check('super admin is superadmin', login.json?.data?.admin?.role === 'superadmin');

  console.log('\n== Login failure cases ==');
  const badLogin = await req('POST', '/auth/login', { body: { email: ADMIN_EMAIL, password: 'wrongpass' } });
  check('wrong password rejected', badLogin.status === 401);
  const noLogin = await req('POST', '/auth/login', { body: { email: 'nobody@qaroo.in', password: 'something' } });
  check('nonexistent user rejected', noLogin.status === 401);

  console.log('\n== Register a normal admin ==');
  const regEmail = 'editor' + Date.now() + '@qaroo.in';
  const reg = await req('POST', '/auth/register', {
    body: { name: 'Editor User', email: regEmail, password: 'EditorPass123' },
  });
  check('register returns 201', reg.status === 201, JSON.stringify(reg.json));
  check('new admin is a normal admin', reg.json?.data?.admin?.role === 'admin');
  check('new admin not approved', reg.json?.data?.admin?.isApproved === false);
  check('new admin not verified', reg.json?.data?.admin?.isEmailVerified === false);

  const registeredAdmin = reg.json?.data?.admin;
  const registeredId = registeredAdmin?._id;

  console.log('\n== Unverified/unapproved login blocked ==');
  const unverifiedLogin = await req('POST', '/auth/login', { body: { email: regEmail, password: 'EditorPass123' } });
  check('unverified login blocked', unverifiedLogin.status === 403);

  console.log('\n== Email verification (via token from DB) ==');
  const freshAdmin = await Admin.findById(registeredId);
  const vt = freshAdmin.verificationToken;
  const verify = await req('GET', `/auth/verify-email/${vt}`);
  check('verify email succeeds', verify.status === 200, JSON.stringify(verify.json));

  const approvedOnlyLogin = await req('POST', '/auth/login', { body: { email: regEmail, password: 'EditorPass123' } });
  check('verified but unapproved login blocked', approvedOnlyLogin.status === 403);

  console.log('\n== Super Admin approves ==');
  const approve = await req('POST', `/admins/${registeredId}/approve`, { token: superToken });
  check('approve succeeds', approve.status === 200);

  console.log('\n== Permission enforcement on MOU create (approved but no perm) ==');
  let editorLogin = await req('POST', '/auth/login', { body: { email: regEmail, password: 'EditorPass123' } });
  const editorToken = editorLogin.json?.data?.accessToken;
  const mouCreate = await req('POST', '/mous', { token: editorToken, body: { tag: 'Test', name: 'Denied MOU' } });
  check('admin without permission cannot create MOU', mouCreate.status === 403, JSON.stringify(mouCreate.json));

  console.log('\n== Grant permissions ==');
  const perms = await req('PUT', `/admins/${registeredId}/permissions`, {
    token: superToken,
    body: { permissions: ['mou.create', 'mou.read', 'mou.update', 'dashboard.view'] },
  });
  check('set permissions succeeds', perms.status === 200, JSON.stringify(perms.json));

  editorLogin = await req('POST', '/auth/login', { body: { email: regEmail, password: 'EditorPass123' } });
  const editorToken2 = editorLogin.json?.data?.accessToken;
  check('approved+permissioned admin can login', editorLogin.status === 200);

  console.log('\n== MOU CRUD (editor) ==');
  const createMou = await req('POST', '/mous', { token: editorToken2, body: { tag: 'Skill Development', name: 'Test MOU 1', blurb: 'A test MOU', status: 'draft' } });
  check('create MOU succeeds', createMou.status === 201, JSON.stringify(createMou.json));
  const mouId = createMou.json?.data?.mou?._id;
  check('created MOU id present', !!mouId);

  const updateMou = await req('PUT', `/mous/${mouId}`, { token: editorToken2, body: { blurb: 'Updated blurb', status: 'published' } });
  check('update MOU succeeds', updateMou.status === 200, JSON.stringify(updateMou.json));

  const listPublic = await req('GET', '/mous');
  check('public lists published MOUs', listPublic.status === 200 && listPublic.json?.count > 0);
  check('public MOU count >= 15 (14 seed + 1 created)', listPublic.json?.count >= 15, String(listPublic.json?.count));

  console.log('\n== Delete permission denied for editor ==');
  const denyDelete = await req('DELETE', `/mous/${mouId}`, { token: editorToken2 });
  check('delete without permission denied', denyDelete.status === 403, JSON.stringify(denyDelete.json));

  console.log('\n== Super admin can delete ==');
  const superDelete = await req('DELETE', `/mous/${mouId}`, { token: superToken });
  check('super admin delete succeeds', superDelete.status === 200, JSON.stringify(superDelete.json));

  console.log('\n== CSR and Learning reads ==');
  const csr = await req('GET', '/csr');
  check('public CSR read', csr.status === 200 && csr.json?.count >= 12, String(csr.json?.count));
  const learning = await req('GET', '/learning');
  check('public learning read', learning.status === 200 && learning.json?.count >= 7, String(learning.json?.count));

  console.log('\n== Content ==');
  const home = await req('GET', '/content/home');
  check('home content read', home.status === 200);

  console.log('\n== Contact form ==');
  const contact = await req('POST', '/contact', { body: { name: 'Test User', email: 'test@example.com', message: 'Hello Qaroo', interest: 'business' } });
  check('contact submit succeeds', contact.status === 201, JSON.stringify(contact.json));

  console.log('\n== Admins list (super only) ==');
  const adminsList = await req('GET', '/admins', { token: superToken });
  check('super can list admins', adminsList.status === 200 && adminsList.json?.data?.admins?.length >= 2);

  const editorAdmins = await req('GET', '/admins', { token: editorToken2 });
  check('normal admin cannot list admins', editorAdmins.status === 403, JSON.stringify(editorAdmins.json));

  console.log('\n== Logout ==');
  const logout = await req('POST', '/auth/logout', { token: superToken });
  check('logout succeeds', logout.status === 200);

  console.log(`\n==== RESULT: ${passed} passed, ${failed} failed ====`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error('TEST ERROR', e);
  process.exit(1);
});
