import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      enum: ['home', 'about', 'business', 'learning', 'csr', 'contact', 'mou'],
      unique: true,
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('PageContent', contentSchema);
