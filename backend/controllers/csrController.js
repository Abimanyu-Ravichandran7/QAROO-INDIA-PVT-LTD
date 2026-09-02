import CSRProject from '../models/CSRProject.js';
import { uploadImage } from '../services/imageService.js';

const normalizeProject = (b) => ({
  year: b.year || '',
  tag: b.tag || '',
  title: b.title || '',
  desc: b.desc || '',
  partner: b.partner || '',
  location: b.location || '',
  beneficiaries: b.beneficiaries || '',
  image: b.image || '',
  status: b.status === 'published' ? 'published' : 'draft',
});

const listCSR = async (req, res, next) => {
  try {
    const { year, status, search } = req.query;
    const query = {};
    if (!req.admin) query.status = 'published';
    if (year) query.year = year;
    if (status && status !== 'all' && req.admin) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { partner: { $regex: search, $options: 'i' } },
        { tag: { $regex: search, $options: 'i' } },
      ];
    }
    const projects = await CSRProject.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort('-year');
    res.json({ success: true, count: projects.length, data: { projects } });
  } catch (err) {
    next(err);
  }
};

const getCSR = async (req, res, next) => {
  try {
    const project = await CSRProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: { project } });
  } catch (err) {
    next(err);
  }
};

const createCSR = async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.title || !body.year) {
      return res.status(400).json({ success: false, message: 'Title and year are required' });
    }
    const image = await uploadImage(body.image, 'qaroo/csr');
    const project = await CSRProject.create({
      ...normalizeProject({ ...body, image }),
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });
    res.status(201).json({ success: true, message: 'CSR project created', data: { project } });
  } catch (err) {
    next(err);
  }
};

const updateCSR = async (req, res, next) => {
  try {
    const project = await CSRProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const body = req.body || {};
    const image = await uploadImage(body.image, 'qaroo/csr');
    Object.assign(project, normalizeProject({ ...body, image }));
    project.updatedBy = req.admin._id;
    await project.save();
    res.json({ success: true, message: 'CSR project updated', data: { project } });
  } catch (err) {
    next(err);
  }
};

const deleteCSR = async (req, res, next) => {
  try {
    const project = await CSRProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await project.deleteOne();
    res.json({ success: true, message: 'CSR project deleted' });
  } catch (err) {
    next(err);
  }
};

const togglePublish = async (req, res, next) => {
  try {
    const project = await CSRProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    project.status = project.status === 'published' ? 'draft' : 'published';
    project.updatedBy = req.admin._id;
    await project.save();
    res.json({ success: true, message: project.status === 'published' ? 'Project published' : 'Project unpublished', data: { project } });
  } catch (err) {
    next(err);
  }
};

export { listCSR, getCSR, createCSR, updateCSR, deleteCSR, togglePublish };
