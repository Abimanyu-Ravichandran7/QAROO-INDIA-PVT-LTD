import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    // Lengths are capped here as well as in the controller: this model is written
    // from a public endpoint, and a schema limit holds even if a future caller
    // skips the controller's own slicing.
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true, maxlength: 200 },
    phone: { type: String, default: '', maxlength: 40 },
    interest: { type: String, default: '', maxlength: 120 },
    subject: { type: String, default: '', maxlength: 200 },
    message: { type: String, default: '', maxlength: 5000 },
    status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
    // Private notes for the team, kept out of the public-facing record.
    remarks: { type: String, default: '', maxlength: 5000 },
    // Where the enquiry came from. Brochure downloads are captured through the
    // same pipeline as the contact form - same inbox, same read/resolve
    // workflow - but stay filterable, because the two are read differently:
    // one is a question to answer, the other a lead who took a document.
    source: { type: String, enum: ['contact', 'brochure'], default: 'contact', index: true },
    // For a brochure lead, which programme was taken.
    resource: { type: String, default: '', maxlength: 160 },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
