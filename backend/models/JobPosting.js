import mongoose from 'mongoose';

const jobPostingSchema = new mongoose.Schema(
  {
    // Basic
    title: { type: String, required: [true, 'Job title is required'], trim: true },
    slug: { type: String, trim: true, lowercase: true, unique: true, index: true },
    pageName: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    displayOrder: { type: Number, default: 0 },

    // Role summary
    jobType: { type: String, default: '' },          // "Full-Time | Entry Level"
    experience: { type: String, default: '' },       // "0-1 Year / Freshers"
    department: { type: String, default: '' },       // groups the listing page
    location: { type: String, default: '' },
    // schema.org JobPosting vocabulary, so the structured data stays valid
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'OTHER'],
      default: 'FULL_TIME',
    },
    overview: { type: String, default: '' },

    // Job description blocks. Every list is optional - a role renders only the
    // blocks it actually fills, the way BusinessSolution already works.
    responsibilities: [{ type: String }],
    techStack: [
      { _id: false, title: { type: String, default: '' }, items: [{ type: String }] },
    ],
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    qualifications: [{ type: String }],
    trainingAreas: [{ type: String }],
    idealCandidate: [{ type: String }],
    benefits: [{ type: String }],
    knowledgeAreas: [{ type: String }],
    note: { type: String, default: '' },

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

export default mongoose.model('JobPosting', jobPostingSchema);
