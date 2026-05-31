const Message = require('../models/Message');
const User = require('../models/User');

const getConversation = async (req, res, next) => {
  try {
    const withUserId = req.params.withUserId;
    const currentUserId = req.user.id;

    if (!withUserId) {
      return res.status(400).json({ message: 'Target user id is required.' });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: withUserId },
        { sender: withUserId, receiver: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email online')
      .populate('receiver', 'name email online');

    return res.json({ conversation: messages });
  } catch (error) {
    next(error);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      'name email online lastSeen'
    );

    return res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversation,
  getContacts,
};
