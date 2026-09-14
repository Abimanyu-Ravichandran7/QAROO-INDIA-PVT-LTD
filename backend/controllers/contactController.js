import ContactMessage from '../models/ContactMessage.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, interest, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }
    const msg = await ContactMessage.create({
      name,
      email,
      phone: phone || '',
      interest: interest || '',
      subject: subject || '',
      message,
    });
    res.status(201).json({ success: true, message: 'Message received. We will get back to you soon.', data: { message: msg } });
  } catch (err) {
    next(err);
  }
};

const listMessages = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: escapeRegex(search), $options: 'i' } },
        { email: { $regex: escapeRegex(search), $options: 'i' } },
        { subject: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }
    const messages = await ContactMessage.find(query).sort('-createdAt');
    res.json({ success: true, count: messages.length, data: { messages } });
  } catch (err) {
    next(err);
  }
};

const getMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: { message: msg } });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    msg.status = msg.status === 'read' ? 'new' : 'read';
    await msg.save();
    res.json({ success: true, message: msg.status === 'read' ? 'Marked as read' : 'Marked as new', data: { message: msg } });
  } catch (err) {
    next(err);
  }
};

const resolveMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    msg.status = 'resolved';
    await msg.save();
    res.json({ success: true, message: 'Message resolved', data: { message: msg } });
  } catch (err) {
    next(err);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    await msg.deleteOne();
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
};

export { submitContact, listMessages, getMessage, markRead, resolveMessage, deleteMessage };
