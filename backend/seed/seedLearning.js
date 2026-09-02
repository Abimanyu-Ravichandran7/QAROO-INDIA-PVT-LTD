import LearningProgram from '../models/LearningProgram.js';
import { LEARNING_PROGRAMS } from '../data/seedData.js';

export async function seedLearning(admin) {
  const existing = await LearningProgram.countDocuments();
  if (existing > 0) {
    console.log(`${existing} learning programs already exist — skipping learning seeding.`);
    return;
  }

  const docs = LEARNING_PROGRAMS.map((p) => ({
    ...p,
    status: 'published',
    createdBy: admin ? admin._id : null,
    updatedBy: admin ? admin._id : null,
  }));

  await LearningProgram.insertMany(docs);
  console.log(`Seeded ${docs.length} learning programs.`);
}
