const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Resend } = require('resend');

// Use environment variable for API key (never hardcode in code)
const resend = new Resend(process.env.RESEND_API_KEY);

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

app.get('/test-email', async (req, res) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'umadviy500@gmail.com',   // <-- Change this to your own email for testing
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