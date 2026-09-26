/**
 * Fail-fast checks for the environment so a misconfigured production deploy
 * refuses to start instead of silently serving insecure cookies, locking CORS
 * to localhost, or writing to the wrong database.
 */

const LOCAL_DB = 'mongodb://127.0.0.1:27017/qaroo_cms';

const validateEnv = () => {
  const errors = [];
  const warnings = [];

  const { NODE_ENV, JWT_SECRET, CLIENT_URL, MONGODB_URI } = process.env;

  if (!JWT_SECRET) {
    errors.push('JWT_SECRET is required. Set a long random value (>= 32 characters).');
  } else if (String(JWT_SECRET).length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long.');
  }

  if (!NODE_ENV) {
    warnings.push(
      'NODE_ENV is not set. In production this disables Secure cookies and leaks 5xx error details.'
    );
  }

  if (NODE_ENV === 'production') {
    if (!CLIENT_URL || /^https?:\/\/localhost(?::\d+)?$/.test(CLIENT_URL)) {
      errors.push('CLIENT_URL must point at the real frontend origin in production.');
    }
    if (!MONGODB_URI || MONGODB_URI === LOCAL_DB) {
      errors.push('MONGODB_URI must point at a real database in production.');
    }
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      warnings.push(
        'Cloudinary is not configured. Uploaded resumes and CMS images are stored on the ' +
          'local disk and will be lost on the next redeploy (see .env.production.example).'
      );
    }
  }

  return { errors, warnings };
};

export default validateEnv;