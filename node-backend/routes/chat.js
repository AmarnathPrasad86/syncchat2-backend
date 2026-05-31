const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getConversation, getContacts } = require('../controllers/chatController');

router.get('/contacts', protect, getContacts);
router.get('/messages/:withUserId', protect, getConversation);

module.exports = router;
