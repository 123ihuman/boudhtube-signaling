const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('call-user', ({ to, from, signal }) => {
    console.log(`Call from ${from} to ${to}`);
    io.to(to).emit('incoming-call', { from, signal });
  });

  socket.on('answer-call', ({ to, signal }) => {
    console.log(`Answer from ${to}`);
    io.to(to).emit('call-answered', { signal });
  });

  socket.on('end-call', ({ to }) => {
    io.to(to).emit('call-ended');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;

// Root route – always works
app.get('/', (req, res) => {
  res.json({ status: 'Signaling server is running' });
});

// Email route – only uses Resend when called
app.get('/test-email', async (req, res) => {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'umadviy500@gmail.com',
      subject: 'Test from BoudhTube',
      html: '<p>Your server is working!</p>'
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
