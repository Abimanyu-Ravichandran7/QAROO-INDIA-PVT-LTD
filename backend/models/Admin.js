import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: [8, 'Password must be at least 8 characters'] },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    permissions: { type: [String], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpires: { type: Date, default: null },
    verificationOTP: { type: String, default: null },
    verificationOTPExpires: { type: Date, default: null },
    // Temporary plaintext credential used for the first-login confirmation email.
    // Cleared as soon as the confirmation email is sent; never exposed via the API.
    initialPassword: { type: String, default: '', select: false },
    passwordOTP: { type: String, default: null, select: false },
    passwordOTPExpires: { type: Date, default: null, select: false },
    // The OTP is the only factor protecting a password change, so guessing has
    // to be bounded per code rather than only per IP: a 6-digit code is a
    // million combinations, which an IP-based limit alone would eventually let
    // through across windows. The code is discarded once this runs out.
    passwordOTPAttempts: { type: Number, default: 0, select: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    // Sparse-unique bootstrap marker: at most ONE admin can ever hold it, which
    // atomically decides the "first registrant" even under concurrent races.
    // The holder is promoted to Super Admin once they verify their email.
    // Deliberately has NO default: a sparse index only skips documents where the
    // path is absent, not ones holding an explicit null. With `default: null`
    // every ordinary admin wrote a null and the unique index would reject the
    // second one - which never showed up only because the index was declared
    // twice (here and below) and so never applied as unique. The marker is set
    // to `true` for the first registrant and left off everyone else.
    bootstrap: { type: Boolean },
  },
  { timestamps: true }
);

adminSchema.index({ bootstrap: 1 }, { unique: true, sparse: true });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.verificationOTP;
  delete obj.initialPassword;
  delete obj.passwordOTP;
  delete obj.passwordOTPExpires;
  delete obj.passwordOTPAttempts;
  return obj;
};

export default mongoose.model('Admin', adminSchema);
