import MOU from '../models/MOU.js';
import { MOUS } from '../data/seedData.js';

export async function seedMous(admin) {
  const existing = await MOU.countDocuments();
  if (existing > 0) {
    console.log(`${existing} MOUs already exist - skipping MOU seeding.`);
    return;
  }

  const docs = MOUS.map((m) => ({
    ...m,
    status: 'published',
    images: m.images || [],
    sections: m.sections || [],
    createdBy: admin ? admin._id : null,
    updatedBy: admin ? admin._id : null,
  }));

  await MOU.insertMany(docs);
  console.log(`Seeded ${docs.length} MOUs.`);
}
