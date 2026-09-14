import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Attaches req.admin if a valid token is present, but never rejects.
export async function optionalAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    if (!token && req.cookies && req.cookies.accessToken) token = req.cookies.accessToken;

    if (!token) return next();

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next();
    }
    const admin = await Admin.findById(decoded.id);
    if (admin && !admin.isDisabled) req.admin = admin;
    next();
  } catch {
    next();
  }
}

export async function protect(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Not authorized, admin not found' });
    }

    if (admin.isDisabled) {
      return res.status(403).json({ success: false, message: 'Your account has been disabled' });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
}
