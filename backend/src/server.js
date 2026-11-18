import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { auth } from './middleware/auth.js';
import { User, Company, Lead, Task } from './models/index.js';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Validation Helpers
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
};

const isValidPhone = (phone) => {
  return /^\d{10}$/.test(String(phone || '').trim());
};

const isValidUrl = (url) => {
  if (!url || !String(url).trim()) return false;
  return /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(String(url).trim());
};

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ message: 'Name, valid email and password (8+ chars) required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Protected API routes
app.use('/api', auth);

app.get('/api/auth/me', async (req, res) => {
  try {
    const u = await User.findById(req.user.id).select('-password');
    res.json(u);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Dashboard metrics
app.get('/api/dashboard', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [totalLeads, qualifiedLeads, tasksDueToday, completedTasks] = await Promise.all([
      Lead.countDocuments({ deletedAt: null }),
      Lead.countDocuments({ deletedAt: null, status: 'Qualified' }),
      Task.countDocuments({
        status: { $ne: 'Completed' },
        dueDate: { $gte: todayStart, $lte: todayEnd }
      }),
      Task.countDocuments({ status: 'Completed' })
    ]);

    res.json({ totalLeads, qualifiedLeads, tasksDueToday, completedTasks });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// --- LEADS ---
app.get('/api/leads', async (req, res) => {
  try {
    const page = Math.max(1, +req.query.page || 1);
    const limit = Math.min(200, +req.query.limit || 50);
    const q = req.query.includeArchived === 'true' ? {} : { deletedAt: null };

    if (req.query.status && req.query.status !== 'All') {
      q.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      q.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const [items, total] = await Promise.all([
      Lead.find(q)
        .populate('company', 'name industry website phone address contactPerson')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Lead.countDocuments(q)
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, status, source, notes, company, image, assignedTo } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Lead Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email Address is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone Number is required' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!company || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: 'Company is required' });
    }
    if (!status || !['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].includes(status)) {
      return res.status(400).json({ message: 'Lead Status is required' });
    }
    if (!source || !source.trim()) {
      return res.status(400).json({ message: 'Lead Source is required' });
    }
    if (!image || !image.trim()) {
      return res.status(400).json({ message: 'Lead Image is required' });
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company,
      status,
      source: source.trim(),
      notes: notes ? notes.trim() : '',
      image: image.trim(),
      assignedTo: assignedTo && mongoose.Types.ObjectId.isValid(assignedTo) ? assignedTo : req.user.id
    };

    const lead = await Lead.create(payload);
    const populated = await Lead.findById(lead._id)
      .populate('company', 'name industry website phone address contactPerson')
      .populate('assignedTo', 'name email');

    res.status(201).json(populated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.get('/api/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('company')
      .populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const existing = await Lead.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Lead not found' });

    const { name, email, phone, status, source, notes, company, image, assignedTo } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Lead Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email Address is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone Number is required' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!company || !mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: 'Company is required' });
    }
    if (!status || !['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].includes(status)) {
      return res.status(400).json({ message: 'Lead Status is required' });
    }
    if (!source || !source.trim()) {
      return res.status(400).json({ message: 'Lead Source is required' });
    }

    const updates = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company,
      status,
      source: source.trim(),
      notes: notes !== undefined ? notes.trim() : existing.notes
    };

    if (image && image.trim()) {
      updates.image = image.trim();
    }

    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      updates.assignedTo = assignedTo;
    }

    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('company', 'name industry website phone address contactPerson')
      .populate('assignedTo', 'name email');

    res.json(lead);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.patch('/api/leads/:id/archive', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead archived', lead });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    if (req.query.permanent === 'true') {
      await Task.updateMany({ lead: req.params.id }, { $set: { lead: null } });
      const deleted = await Lead.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Lead not found' });
      return res.json({ message: 'Lead deleted permanently' });
    }

    const archived = await Lead.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!archived) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead archived' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// --- COMPANIES ---
app.get('/api/companies', async (_, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { name, contactPerson, industry, email, phone, website, address, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Company Name is required' });
    }
    if (!contactPerson || !contactPerson.trim()) {
      return res.status(400).json({ message: 'Contact Person is required' });
    }
    if (!industry || !industry.trim()) {
      return res.status(400).json({ message: 'Industry is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email Address is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone Number is required' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!website || !website.trim()) {
      return res.status(400).json({ message: 'Website is required' });
    }
    if (!isValidUrl(website)) {
      return res.status(400).json({ message: 'Please enter a valid website URL.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const company = await Company.create({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      industry: industry.trim(),
      email: email.trim(),
      phone: phone.trim(),
      website: website.trim(),
      address: address.trim(),
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json(company);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const leads = await Lead.find({ company: company.id, deletedAt: null });
    res.json({ company, leads });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.put('/api/companies/:id', async (req, res) => {
  try {
    const { name, contactPerson, industry, email, phone, website, address, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Company Name is required' });
    }
    if (!contactPerson || !contactPerson.trim()) {
      return res.status(400).json({ message: 'Contact Person is required' });
    }
    if (!industry || !industry.trim()) {
      return res.status(400).json({ message: 'Industry is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email Address is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone Number is required' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!website || !website.trim()) {
      return res.status(400).json({ message: 'Website is required' });
    }
    if (!isValidUrl(website)) {
      return res.status(400).json({ message: 'Please enter a valid website URL.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        industry: industry.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: website.trim(),
        address: address.trim(),
        notes: notes ? notes.trim() : ''
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    await Lead.updateMany({ company: req.params.id }, { $set: { company: null } });
    const deleted = await Company.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// --- TASKS ---
app.get('/api/tasks', async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { $or: [{ assignedTo: req.user.id }, { createdBy: req.user.id }] };

    const tasks = await Task.find(filter)
      .populate('lead', 'name email phone status image')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, lead, dueDate, priority, status, assignedTo } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!lead || !mongoose.Types.ObjectId.isValid(lead)) {
      return res.status(400).json({ message: 'Related Lead is required' });
    }
    if (!dueDate || isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ message: 'Due Date is required' });
    }
    if (!priority || !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ message: 'Priority is required' });
    }
    if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      lead,
      dueDate: new Date(dueDate),
      priority,
      status,
      assignedTo: assignedTo && mongoose.Types.ObjectId.isValid(assignedTo) ? assignedTo : req.user.id,
      createdBy: req.user.id
    };

    const task = await Task.create(payload);
    const populated = await Task.findById(task._id)
      .populate('lead', 'name email phone status image')
      .populate('assignedTo', 'name email');

    res.status(201).json(populated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('lead', 'name email phone status image')
      .populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, description, lead, dueDate, priority, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!lead || !mongoose.Types.ObjectId.isValid(lead)) {
      return res.status(400).json({ message: 'Related Lead is required' });
    }
    if (!dueDate || isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ message: 'Due Date is required' });
    }
    if (!priority || !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ message: 'Priority is required' });
    }
    if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const updates = {
      title: title.trim(),
      description: description.trim(),
      lead,
      dueDate: new Date(dueDate),
      priority,
      status
    };

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('lead', 'name email phone status image')
      .populate('assignedTo', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    if (!['Pending', 'In Progress', 'Completed'].includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (
      req.user.role !== 'admin' &&
      String(task.assignedTo) !== String(req.user.id) &&
      String(task.createdBy) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: 'Only the assigned user or admin can update task status' });
    }

    task.status = req.body.status;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('lead', 'name email phone status image')
      .populate('assignedTo', 'name email');

    res.json(populated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(port, () => console.log(`API running on ${port}`))
  )
  .catch((e) => {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  });
