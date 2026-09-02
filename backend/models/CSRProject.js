import mongoose from 'mongoose';

const csrProjectSchema = new mongoose.Schema(
  {
    year: { type: String, required: [true, 'Year is required'], trim: true },
    tag: { type: String, default: '', trim: true },
    title: { type: String, required: [true, 'Project title is required'], trim: true },
    desc: { type: String, default: '' },
    partner: { type: String, default: '' },
    location: { type: String, default: '' },
    beneficiaries: { type: String, default: '' },
    image: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('CSRProject', csrProjectSchema);
