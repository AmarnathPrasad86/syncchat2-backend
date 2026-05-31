const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'replace-me-with-secure-secret';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: 'Name, email, mobile, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedMobile = mobile.trim();

    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const mobileExists = await User.findOne({ mobile: normalizedMobile });
    if (mobileExists) {
      return res.status(409).json({ message: 'Mobile number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      password: hashedPassword,
    });

    const token = createToken(user.id);
    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        online: user.online,
        profilePic: user.profilePic,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ message: 'Mobile and password are required.' });
    }

    const normalizedMobile = mobile.trim();
    const user = await User.findOne({ mobile: normalizedMobile });
    if (!user) {
      return res.status(401).json({ message: 'Invalid mobile or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid mobile or password.' });
    }

    const token = createToken(user.id);
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        online: user.online,
        profilePic: user.profilePic,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        online: user.online,
        profilePic: user.profilePic,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
