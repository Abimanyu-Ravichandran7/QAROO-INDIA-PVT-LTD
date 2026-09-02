import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: '' },
    paragraphs: [{ type: String }],
    list: [{ type: String }],
    pathway: [{ type: String }],
    note: { type: String, default: '' },
  },
  { _id: false }
);

const mouSchema = new mongoose.Schema(
  {
    tag: { type: String, required: [true, 'Category/Tag is required'], trim: true },
    name: { type: String, required: [true, 'MOU name is required'], trim: true },
    blurb: { type: String, default: '' },
    logo: { type: String, default: '' },
    images: [{ type: String }],
    sections: { type: [sectionSchema], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('MOU', mouSchema);
