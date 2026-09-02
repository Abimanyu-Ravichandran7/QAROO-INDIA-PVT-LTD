import mongoose from 'mongoose';

const clientErrorSchema = new mongoose.Schema(
  {
    message: { type: String, default: '' },
    stack: { type: String, default: '' },
    url: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    extra: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

clientErrorSchema.index({ createdAt: -1 });

export default mongoose.model('ClientError', clientErrorSchema);