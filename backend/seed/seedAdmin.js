import Admin from '../models/Admin.js';
import { ALL_PERMISSIONS } from '../utils/permissions.js';

export async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@qaroo.in').toLowerCase();
  const name = process.env.ADMIN_NAME || 'Qaroo Super Admin';
  const password = process.env.ADMIN_PASSWORD || 'QarooAdmin@123';

  let admin = await Admin.findOne({ email });

  if (admin) {
    console.log(`Super Admin "${email}" already exists — skipping.`);
    return admin;
  }

  const totalAdmins = await Admin.countDocuments();

  if (totalAdmins > 0) {
    console.log(
      `Admins already exist and "${email}" is not among them — skipping Super Admin creation. ` +
      `Either set ADMIN_EMAIL/ADMIN_PASSWORD to the existing super admin, or use the first registration.`
    );
    return null;
  }

  admin = await Admin.create({
    name,
    email,
    password,
    role: 'superadmin',
    permissions: ALL_PERMISSIONS,
    isEmailVerified: true,
    isApproved: true,
  });

  console.log(`Super Admin created: ${email}`);
  return admin;
}
