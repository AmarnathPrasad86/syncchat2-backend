const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const Message = require('./models/Message');
const pythonAIService = require('./services/pythonAIService');

dotenv.config({ path: path.resolve(__dirname, '.env') });
//first push yaha se hoga
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'replace-me-with-secure-secret';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Realtime chat backend is running.' });
});

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      throw new Error('Authentication token missing');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Socket authentication failed'));
  }
};

io.use(authenticateSocket);

io.on('connection', async (socket) => {
  const user = socket.user;
  console.log(`User connected: ${user.id} (${user.email})`);

  await User.findByIdAndUpdate(user.id, {
    online: true,
    socketId: socket.id,
    lastSeen: new Date(),
  });

  socket.join(user.id.toString());

  socket.broadcast.emit('user_status', {
    userId: user.id,
    online: true,
  });

  socket.on('typing', ({ to, isTyping }) => {
    if (!to) return;
    io.to(to).emit('typing', {
      from: user.id,
      isTyping: Boolean(isTyping),
    });
  });

  socket.on('private_message', async ({ to, text }) => {
    if (!to || !text || text.trim().length === 0) {
      socket.emit('error_message', { message: 'Message recipient and text are required.' });
      return;
    }

    const payload = {
      sender: user.id,
      receiver: to,
      text: text.trim(),
      status: 'sent',
    };

    const aiResult = await pythonAIService.analyzeMessage(text.trim());
    payload.isToxic = aiResult.toxic;
    payload.aiSuggestion = aiResult.suggestion || '';

    const messageDocument = await Message.create(payload);

    const deliveredPayload = {
      messageId: messageDocument.id,
      sender: user.id,
      receiver: to,
      text: messageDocument.text,
      status: messageDocument.status,
      isToxic: messageDocument.isToxic,
      aiSuggestion: messageDocument.aiSuggestion,
      createdAt: messageDocument.createdAt,
    };

    const recipient = await User.findById(to);
    if (recipient?.socketId) {
      await Message.findByIdAndUpdate(messageDocument.id, {
        status: 'delivered',
        deliveredAt: new Date(),
      });
      deliveredPayload.status = 'delivered';
      deliveredPayload.deliveredAt = new Date();
      io.to(recipient.socketId).emit('private_message', deliveredPayload);
      socket.emit('message_delivered', { messageId: messageDocument.id, receiver: to });
    }

    if (aiResult.toxic) {
      socket.emit('ai_warning', {
        messageId: messageDocument.id,
        warning: aiResult.reason || 'Potential toxic or spam message detected.',
      });
    }

    socket.emit('message_sent', deliveredPayload);
  });

  socket.on('message_seen', async ({ messageId }) => {
    if (!messageId) return;

    const message = await Message.findById(messageId);
    if (!message) return;

    message.status = 'seen';
    message.seenAt = new Date();
    await message.save();

    io.to(message.sender.toString()).emit('message_seen', {
      messageId: message.id,
      by: user.id,
      seenAt: message.seenAt,
    });
  });

  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${user.id}`);
    await User.findByIdAndUpdate(user.id, {
      online: false,
      socketId: null,
      lastSeen: new Date(),
    });

    socket.broadcast.emit('user_status', {
      userId: user.id,
      online: false,
      lastSeen: new Date(),
    });
  });
});

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Node.js backend listening at http://localhost:${PORT}`);
      console.log(`Python AI service base URL: ${process.env.PYTHON_AI_BASE_URL || 'http://127.0.0.1:5000'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  });


