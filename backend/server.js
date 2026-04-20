const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mockData = require('./data/mockData');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "https://pulse-ops-five.vercel.app", "https://pulseops-1.onrender.com"],
    methods: ["GET", "POST"]
  },
  path: "/socket.io"
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "https://pulse-ops-five.vercel.app", "https://pulseops-1.onrender.com"],
  credentials: true
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'PulseOps Backend Running', version: '1.0.0' });
});

// Routes
app.get('/api/stores', (req, res) => {
  setTimeout(() => res.json(mockData.stores), Math.random() * 50 + 50);
});

app.get('/api/stores/:id', (req, res) => {
  const store = mockData.stores.find(s => s.storeId == req.params.id);
  setTimeout(() => res.json(store || { error: 'Store not found' }), Math.random() * 50 + 50);
});

app.get('/api/stores/:id/inventory', (req, res) => {
  const inventory = mockData.products.filter(p => p.stock > 0); // Assuming global inventory
  setTimeout(() => res.json(inventory), Math.random() * 50 + 50);
});

app.get('/api/orders/live', (req, res) => {
  const liveOrders = mockData.orders.slice(-20);
  setTimeout(() => res.json(liveOrders), Math.random() * 50 + 50);
});

app.get('/api/stats/surge', (req, res) => {
  setTimeout(() => res.json(mockData.surgeData), Math.random() * 50 + 50);
});

app.get('/api/alerts', (req, res) => {
  setTimeout(() => res.json(mockData.generateAlerts()), Math.random() * 50 + 50);
});

io.on('connection', (socket) => {
  console.log('Client connected');
  // Send initial data
  socket.emit('orders', mockData.orders);
  socket.emit('products', mockData.products);
  socket.emit('alerts', mockData.generateAlerts());
  socket.emit('stores', mockData.stores);
  socket.emit('surgeData', mockData.surgeData);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Global real-time updates
function startOrderStream() {
  const delay = Math.random() * 5000 + 3000; // 3-8 seconds
  setTimeout(() => {
    const order = mockData.generateOrder();
    io.emit('order:new', order);
    startOrderStream();
  }, delay);
}

setInterval(() => {
  mockData.updateOrderStatuses();
  io.emit('order:update', mockData.orders);
}, 10000);

setInterval(() => {
  mockData.updateStores();
  io.emit('store:update', mockData.stores);
}, 10000);

setInterval(() => {
  const alerts = mockData.generateAlerts();
  io.emit('alert:new', alerts);
}, 15000);

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startOrderStream(); // Start the mock order stream
});