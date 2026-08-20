const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const { inMemoryData, isMongoConnected } = require('../utils/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'iedc_super_secret_jwt_key_2026_gamified_selection';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'iedc_admin_2026';

const calculateRoundRobinGroup = (totalUsers) => {
  return (totalUsers % 8) + 1;
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, admissionNo, department, role } = req.body;

    if (!name || !email || !phone || !admissionNo || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, admissionNo, and department.'
      });
    }

    // Role safety: only allow candidate user or leader via invite
    const requestedRole = role === 'leader' ? 'leader' : 'user';

    if (isMongoConnected()) {
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { admissionNo }, { phone }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this Email, Phone, or Admission Number already exists.'
        });
      }

      let groupId = null;
      let groupName = null;

      if (requestedRole === 'user') {
        const userCount = await User.countDocuments({ role: 'user' });
        const groupNum = calculateRoundRobinGroup(userCount);
        groupName = `Group ${groupNum}`;

        let group = await Group.findOne({ name: groupName });
        if (!group) {
          group = await Group.create({
            name: groupName,
            visibleAfterGame: 2,
            teamPoints: 0,
            memberIds: []
          });
        }
        groupId = group._id;
      }

      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        phone,
        admissionNo,
        department,
        role: requestedRole,
        status: 'approved',
        groupId,
        personalPoints: 0,
        completedGames: []
      });

      if (groupId) {
        await Group.findByIdAndUpdate(groupId, { $push: { memberIds: newUser._id } });
      }

      const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        success: true,
        message: `Registered successfully as ${requestedRole.toUpperCase()}!`,
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          admissionNo: newUser.admissionNo,
          department: newUser.department,
          role: newUser.role,
          groupId: newUser.groupId,
          groupName: groupName,
          personalPoints: newUser.personalPoints
        }
      });
    } else {
      // In-Memory Fast Fallback
      const existing = inMemoryData.users.find(u => u.email === email.toLowerCase() || u.phone === phone);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this Email or Phone number already exists.' });
      }

      const nonAdminUsers = inMemoryData.users.filter(u => u.role !== 'admin');
      const groupNum = calculateRoundRobinGroup(nonAdminUsers.length);
      const targetGroup = inMemoryData.groups.find(g => g.groupNumber === groupNum);

      const userId = `user_${Date.now()}`;
      const newUser = {
        _id: userId,
        name,
        email: email.toLowerCase(),
        phone,
        admissionNo,
        department,
        role: requestedRole,
        groupId: targetGroup ? targetGroup._id : null,
        groupNumber: groupNum,
        personalPoints: 0
      };

      inMemoryData.users.push(newUser);
      if (targetGroup) targetGroup.members.push(userId);

      const token = jwt.sign({ id: userId, role: requestedRole }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        success: true,
        message: `Registered successfully as ${requestedRole.toUpperCase()}!`,
        token,
        user: newUser
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { secretKey, email, phone, admissionNo, name, department } = req.body;

    if (!secretKey || secretKey !== ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Secret Passkey. Access Denied.'
      });
    }

    const adminEmail = email ? email.toLowerCase() : 'admin@iedc.org';
    const adminPhone = phone || '9999999999';
    const adminAdmissionNo = admissionNo || 'ADMIN2026';
    const adminName = name || 'IEDC Executive Admin';
    const adminDept = department || 'IEDC Executive Cell';

    if (isMongoConnected()) {
      let admin = await User.findOne({ email: adminEmail });

      if (admin) {
        admin.role = 'admin';
        admin.name = adminName;
        admin.phone = adminPhone;
        admin.admissionNo = adminAdmissionNo;
        await admin.save();
      } else {
        admin = await User.create({
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          admissionNo: adminAdmissionNo,
          department: adminDept,
          role: 'admin',
          status: 'approved',
          personalPoints: 100
        });
      }

      const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        message: `Admin access granted for ${admin.email}`,
        token,
        admin
      });
    } else {
      let admin = inMemoryData.users.find(u => u.email === adminEmail || u.role === 'admin');
      if (!admin) {
        admin = {
          _id: 'admin_1',
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          admissionNo: adminAdmissionNo,
          department: adminDept,
          role: 'admin',
          personalPoints: 100
        };
        inMemoryData.users.push(admin);
      }
      const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, message: `Admin access granted for ${admin.email}`, token, admin });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, admissionNo, secretKey } = req.body;

    if (!email && !phone && !admissionNo) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your Email, Phone number, or Admission Number to log in.'
      });
    }

    if (isMongoConnected()) {
      let query = [];
      if (email) query.push({ email: email.toLowerCase() });
      if (phone) query.push({ phone });
      if (admissionNo) query.push({ admissionNo });

      const user = await User.findOne({ $or: query }).populate('groupId');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found. Please check credentials or register.'
        });
      }

      // If user has admin role, verify security key
      if (user.role === 'admin') {
        if (!secretKey || secretKey !== ADMIN_SECRET_KEY) {
          return res.status(200).json({
            success: false,
            requiresAdminKey: true,
            email: user.email,
            message: 'Security Passkey required for Admin accounts.'
          });
        }
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          admissionNo: user.admissionNo,
          department: user.department,
          role: user.role,
          groupId: user.groupId ? user.groupId._id : null,
          groupName: user.groupId ? user.groupId.name : null,
          personalPoints: user.personalPoints
        }
      });
    } else {
      // Memory Fallback
      const user = inMemoryData.users.find(u =>
        (email && u.email === email.toLowerCase()) ||
        (phone && u.phone === phone) ||
        (admissionNo && u.admissionNo === admissionNo)
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found. Please check credentials or register.'
        });
      }

      if (user.role === 'admin') {
        if (!secretKey || secretKey !== ADMIN_SECRET_KEY) {
          return res.status(200).json({
            success: false,
            requiresAdminKey: true,
            email: user.email,
            message: 'Security Passkey required for Admin accounts.'
          });
        }
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        token,
        user
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    if (isMongoConnected()) {
      const user = await User.findById(userId).populate('groupId');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    } else {
      const user = inMemoryData.users.find(u => u._id === userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both Email Address and Phone Number to verify Admin access.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (isMongoConnected()) {
      const user = await User.findOne({
        email: cleanEmail,
        phone: cleanPhone,
        role: 'admin'
      });

      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Email and Phone Number do not match a registered Executive Admin account.'
        });
      }

      const token = jwt.sign({ id: user._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        message: `Admin access verified for ${user.name} (${user.email})`,
        token,
        admin: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          admissionNo: user.admissionNo,
          department: user.department,
          role: 'admin',
          personalPoints: user.personalPoints || 100
        }
      });
    } else {
      let user = inMemoryData.users.find(u =>
        u.email.toLowerCase() === cleanEmail && u.phone === cleanPhone && u.role === 'admin'
      );

      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Email and Phone Number do not match a registered Executive Admin account.'
        });
      }

      const token = jwt.sign({ id: user._id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        message: `Admin access verified for ${user.name} (${user.email})`,
        token,
        admin: user
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

