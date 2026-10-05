import mongoose from 'mongoose';

const clientErrorSchema = new mongoose.Schema(
  {
    // The controller already slices these; the schema states the same bounds.
    message: { type: String, default: '', maxlength: 2000 },
    stack: { type: String, default: '', maxlength: 8000 },
    url: { type: String, default: '', maxlength: 2000 },
    userAgent: { type: String, default: '', maxlength: 500 },
    extra: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

clientErrorSchema.index({ createdAt: -1 });

export default mongoose.model('ClientError', clientErrorSchema);