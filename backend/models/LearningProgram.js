import mongoose from 'mongoose';

const learningProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Program title is required'], trim: true },
    desc: { type: String, default: '' },
    skills: [{ type: String }],
    category: { type: String, default: '' },
    image: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('LearningProgram', learningProgramSchema);
