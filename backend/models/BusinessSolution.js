import mongoose from 'mongoose';

const businessSolutionSchema = new mongoose.Schema(
  {
    // Basic
    title: { type: String, required: [true, 'Solution title is required'], trim: true },
    slug: { type: String, trim: true, lowercase: true, unique: true, index: true },
    pageName: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    fullDescription: { type: String, default: '' },
    image: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    displayOrder: { type: Number, default: 0 },

    // Solution content
    services: [{ type: String }],
    features: [{ type: String }],
    benefits: [{ type: String }],
    useCases: [{ type: String }],
    audience: [{ type: String }],
    problems: [{ type: String }],
    solutions: [{ type: String }],
    techniques: [{ type: String }],
    process: [
      { _id: false, title: { type: String, default: '' }, items: [{ type: String }] },
    ],
    industries: [{ type: String }],
    whyChoose: [{ type: String }],
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

export default mongoose.model('BusinessSolution', businessSolutionSchema);
