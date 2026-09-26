import PageContent from '../models/PageContent.js';
import { PAGE_CONTENT } from '../data/seedData.js';

export async function seedContent(admin) {
  for (const [page, data] of Object.entries(PAGE_CONTENT)) {
    const existing = await PageContent.findOne({ page });
    if (existing) {
      console.log(`Page content "${page}" already exists - skipping.`);
      continue;
    }
    await PageContent.create({
      page,
      data,
      updatedBy: admin ? admin._id : null,
    });
    console.log(`Seeded page content "${page}".`);
  }
}
