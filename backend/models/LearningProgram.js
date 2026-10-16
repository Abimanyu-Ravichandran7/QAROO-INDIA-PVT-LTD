import mongoose from 'mongoose';

const learningProgramSchema = new mongoose.Schema(
  {
    // Basic
    title: { type: String, required: [true, 'Program title is required'], trim: true },
    slug: { type: String, trim: true, lowercase: true, unique: true, index: true },
    desc: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    fullDescription: { type: String, default: '' },
    skills: [{ type: String }],
    category: { type: String, default: '' },
    image: { type: String, default: '' },
    // Path to the published brochure, so the download is driven by the record
    // rather than by a filename convention the frontend has to guess. Relative
    // to the site root (e.g. /brochures/learning/<slug>.pdf); left empty when
    // no document has been published, and the UI then falls back to the
    // brochure it generates from this record's own content.
    brochure: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    displayOrder: { type: Number, default: 0 },

    // Course content
    highlights: [{ type: String }],
    learn: [{ type: String }],
    tools: [{ type: String }],
    modules: [
      { _id: false, title: { type: String, default: '' }, items: [{ type: String }] },
    ],
    careers: [{ type: String }],
    audience: [{ type: String }],
    benefits: [{ type: String }],
    certification: { type: String, default: '' },
    placement: { type: String, default: '' },
    modes: [{ type: String }],
    faq: [{ _id: false, q: { type: String, default: '' }, a: { type: String, default: '' } }],
    cta: { type: String, default: '' },

    // SEO
    keyword: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: [{ type: String }],
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('LearningProgram', learningProgramSchema);
