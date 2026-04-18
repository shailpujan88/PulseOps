import io from 'socket.io-client';

const socket = io(
  process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : '/',
  {
    path: '/socket.io',
  }
);

export default socket;