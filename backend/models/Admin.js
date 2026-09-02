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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

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
  return obj;
};

export default mongoose.model('Admin', adminSchema);
