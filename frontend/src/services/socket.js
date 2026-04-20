import io from 'socket.io-client';

const socket = io(
  process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : 'https://pulseops-1.onrender.com',
  {
    path: '/socket.io',
  }
);

export default socket;