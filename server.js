const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path'); 
const { Server } = require('socket.io');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']); 

const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

process.env.CLIENT_URL = 'http://localhost:3000';
process.env.SENDGRID_API_KEY = 'SG.dummy_key_to_prevent_crash_for_now';
process.env.MONGO_URI = 'mongodb+srv://abhikumar9166905548_db_user:AbhiRollera669055@cluster0.imxuscy.mongodb.net/rollera?retryWrites=true&w=majority&appName=Cluster0';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' }
});

app.set("io", io);
app.set('trust proxy', 1);

const schema = buildSchema(`
  type Query {
    hello: String
    status: String
  }
`);

const root = {
  hello: () => '🔥 GraphQL is working!',
  status: () => '✅ Server is running perfectly'
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public', {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/stories', require('./routes/story.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/comments', require('./routes/comment.routes'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(/^(?!\/(api|graphql)).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: "API Route not found" });
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log("🔥 User connected:", socket.id);

  socket.on('join', (userId) => {
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', ({ senderId, receiverId, content }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('newMessage', {
        senderId,
        content,
        time: new Date()
      });
    }
  });

  socket.on("joinReel", (reelId) => {
    socket.join(reelId);
    console.log("Joined reel:", reelId);
  });

  socket.on("joinPost", (postId) => {
    socket.join(postId);
    console.log("Joined post:", postId);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

app.use((err, req, res, next) => {
  console.error("💥 Error:", err);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    server.listen(PORT, () => {
      console.log(`🚀 Server running perfectly on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });