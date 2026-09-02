import LearningProgram from '../models/LearningProgram.js';
import { uploadImage } from '../services/imageService.js';

const normalizeProgram = (b) => ({
  title: b.title || '',
  desc: b.desc || '',
  skills: Array.isArray(b.skills) ? b.skills.filter(Boolean) : [],
  category: b.category || '',
  image: b.image || '',
  status: b.status === 'published' ? 'published' : 'draft',
});

const listPrograms = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (!req.admin) query.status = 'published';
    if (status && status !== 'all' && req.admin) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    const programs = await LearningProgram.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: programs.length, data: { programs } });
  } catch (err) {
    next(err);
  }
};

const getProgram = async (req, res, next) => {
  try {
    const program = await LearningProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
    res.json({ success: true, data: { program } });
  } catch (err) {
    next(err);
  }
};

const createProgram = async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.title) {
      return res.status(400).json({ success: false, message: 'Program title is required' });
    }
    const image = await uploadImage(body.image, 'qaroo/learning');
    const program = await LearningProgram.create({
      ...normalizeProgram(body),
      image,
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });
    res.status(201).json({ success: true, message: 'Learning program created', data: { program } });
  } catch (err) {
    next(err);
  }
};

const updateProgram = async (req, res, next) => {
  try {
    const program = await LearningProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
    const body = req.body || {};
    const image = await uploadImage(body.image, 'qaroo/learning');
    const normalized = normalizeProgram({ ...body, image });
    Object.assign(program, normalized);
    program.updatedBy = req.admin._id;
    await program.save();
    res.json({ success: true, message: 'Learning program updated', data: { program } });
  } catch (err) {
    next(err);
  }
};

const deleteProgram = async (req, res, next) => {
  try {
    const program = await LearningProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
    await program.deleteOne();
    res.json({ success: true, message: 'Learning program deleted' });
  } catch (err) {
    next(err);
  }
};

const togglePublish = async (req, res, next) => {
  try {
    const program = await LearningProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found' });
    program.status = program.status === 'published' ? 'draft' : 'published';
    program.updatedBy = req.admin._id;
    await program.save();
    res.json({ success: true, message: program.status === 'published' ? 'Program published' : 'Program unpublished', data: { program } });
  } catch (err) {
    next(err);
  }
};

export { listPrograms, getProgram, createProgram, updateProgram, deleteProgram, togglePublish };
