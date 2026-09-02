import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true },
    phone: { type: String, default: '' },
    interest: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
