const mockData = {
  stores: [
    {
      storeId: 1,
      name: 'Gurgaon Sector 14',
      location: { lat: 28.4676, lng: 77.0365 },
      zone: 'Gurgaon Central',
      currentOrders: Math.floor(Math.random() * 51),
      capacity: 100,
      avgDeliveryTime: 18,
      activeRiders: 8
    },
    {
      storeId: 2,
      name: 'Lajpat Nagar',
      location: { lat: 28.5783, lng: 77.2406 },
      zone: 'South Delhi',
      currentOrders: Math.floor(Math.random() * 51),
      capacity: 120,
      avgDeliveryTime: 22,
      activeRiders: 10
    },
    {
      storeId: 3,
      name: 'Koramangala',
      location: { lat: 28.5355, lng: 77.2446 },
      zone: 'South Delhi',
      currentOrders: Math.floor(Math.random() * 51),
      capacity: 90,
      avgDeliveryTime: 20,
      activeRiders: 7
    },
    {
      storeId: 4,
      name: 'Connaught Place',
      location: { lat: 28.6315, lng: 77.2167 },
      zone: 'Central Delhi',
      currentOrders: Math.floor(Math.random() * 51),
      capacity: 110,
      avgDeliveryTime: 25,
      activeRiders: 12
    },
    {
      storeId: 5,
      name: 'Dwarka Sector 21',
      location: { lat: 28.5525, lng: 77.0588 },
      zone: 'West Delhi',
      currentOrders: Math.floor(Math.random() * 51),
      capacity: 95,
      avgDeliveryTime: 28,
      activeRiders: 9
    },
    {
      storeId: 6,
      name: 'Noida Sector 18',
      location: { lat: 28.5708, lng: 77.3211 },
      zone: 'Noida',
      currentOrders: Math.floor(Math.random() * 51),
      capacity: 105,
      avgDeliveryTime: 24,
      activeRiders: 11
    }
  ],

  products: [],

  orders: [],

  surgeData: [],

  orderIdCounter: 1,

  // Generate 200 products
  generateProducts: function() {
    const categories = ['Grocery', 'Dairy', 'Snacks', 'Beverages', 'Personal Care', 'Pharma'];
    const productNames = {
      Grocery: ['Rice 1kg', 'Wheat Flour 1kg', 'Sugar 1kg', 'Salt 500g', 'Cooking Oil 1L', 'Onions 1kg', 'Potatoes 1kg', 'Tomatoes 500g', 'Garlic 200g', 'Ginger 200g', 'Green Chilies 100g', 'Turmeric Powder 100g', 'Coriander Powder 100g', 'Cumin Seeds 100g', 'Mustard Seeds 100g', 'Red Chili Powder 100g', 'Garam Masala 100g', 'Tea Leaves 250g', 'Coffee Powder 200g', 'Milk Powder 500g'],
      Dairy: ['Amul Milk 1L', 'Amul Cheese 200g', 'Amul Butter 100g', 'Amul Yogurt 400g', 'Nestle Milk 500ml', 'Britannia Cheese Slices 200g', 'Mother Dairy Curd 500g', 'Paneer 200g', 'Cream 200ml', 'Ghee 500ml'],
      Snacks: ['Lays Potato Chips 50g', 'Kurkure Namkeen 70g', 'Bingo Mad Angles 60g', 'Pringles Chips 110g', 'Doritos Nachos 150g', 'Cheetos Puffs 50g', 'Oreo Biscuits 150g', 'Parle-G Biscuits 100g', 'Hide & Seek Biscuits 100g', 'Good Day Biscuits 200g'],
      Beverages: ['Coca Cola 600ml', 'Pepsi 600ml', 'Sprite 600ml', 'Fanta 600ml', 'Thums Up 600ml', 'Kinley Water 1L', 'Bisleri Water 1L', 'Red Bull 250ml', 'Monster Energy 500ml', 'Tropicana Juice 1L'],
      'Personal Care': ['Colgate Toothpaste 150g', 'Pepsodent Toothpaste 150g', 'Dove Soap 100g', 'Lux Soap 100g', 'Lifebuoy Soap 100g', 'Head & Shoulders Shampoo 180ml', 'Pantene Shampoo 180ml', 'Sunsilk Shampoo 180ml', 'Fair & Lovely Cream 50g', 'Ponds Cream 50g'],
      Pharma: ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Aspirin 75mg', 'Cough Syrup 100ml', 'Antacid Tablets', 'Vitamin C Tablets', 'Multivitamin Tablets', 'Band Aid 10pcs', 'Dettol Antiseptic 100ml', 'Hand Sanitizer 500ml']
    };

    this.products = [];
    let productId = 1;
    categories.forEach(category => {
      const names = productNames[category];
      names.forEach(name => {
        const minStock = Math.floor(Math.random() * 41) + 10; // 10-50
        const maxStock = Math.floor(Math.random() * 401) + 100; // 100-500
        let stock = Math.floor(Math.random() * (maxStock - minStock + 1)) + minStock;
        if (Math.random() < 0.2) { // 20% below minStock
          stock = Math.floor(Math.random() * minStock);
        }
        const price = Math.floor(Math.random() * 491) + 10; // 10-500
        this.products.push({
          productId,
          name,
          category,
          stock,
          minStock,
          maxStock,
          price
        });
        productId++;
      });
    });
  },

  // Generate order
  generateOrder: function() {
    const store = this.stores[Math.floor(Math.random() * this.stores.length)];
    const numItems = Math.floor(Math.random() * 5) + 1; // 1-5 items
    const items = [];
    let totalValue = 0;
    for (let i = 0; i < numItems; i++) {
      const product = this.products[Math.floor(Math.random() * this.products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1; // 1-5
      items.push({ productId: product.productId, quantity });
      totalValue += product.price * quantity;
    }
    const createdAt = new Date();
    const estimatedDelivery = new Date(createdAt.getTime() + store.avgDeliveryTime * 60000);
    const order = {
      orderId: this.orderIdCounter++,
      storeId: store.storeId,
      items,
      totalValue,
      status: 'placed',
      createdAt: createdAt.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString()
    };
    this.orders.push(order);
    if (this.orders.length > 100) { // Keep last 100 orders
      this.orders.shift();
    }
    return order;
  },

  // Generate surge data
  generateSurgeData: function() {
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const multiplier = isWeekend ? 1.4 : 1;
    this.surgeData = [];
    for (let store of this.stores) {
      const hourlyData = [];
      for (let hour = 0; hour < 24; hour++) {
        let baseOrders = Math.floor(Math.random() * 20) + 5; // 5-25
        if ((hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 22)) {
          baseOrders *= 2; // Peak hours
        }
        baseOrders *= multiplier;
        hourlyData.push({ hour, orders: Math.floor(baseOrders) });
      }
      this.surgeData.push({ storeId: store.storeId, hourlyData });
    }
  },

  generateAlerts: function() {
    const alerts = [];
    this.products.forEach(product => {
      if (product.stock < product.minStock) {
        alerts.push({
          id: `low-${product.productId}`,
          message: `Low stock on ${product.name}`,
          type: 'Low Stock',
          storeId: null,
          createdAt: new Date().toISOString()
        });
      }
      if (product.stock === 0) {
        alerts.push({
          id: `critical-${product.productId}`,
          message: `${product.name} has 0 units remaining`,
          type: 'Critical Stock',
          storeId: null,
          createdAt: new Date().toISOString()
        });
      }
    });
    this.stores.forEach(store => {
      if (store.currentOrders > store.capacity * 0.8) {
        alerts.push({
          id: `surge-${store.storeId}`,
          message: `${store.name} receiving high order volume`,
          type: 'Surge Detected',
          storeId: store.storeId,
          createdAt: new Date().toISOString()
        });
      }
      if (store.avgDeliveryTime > 15) {
        alerts.push({
          id: `slow-${store.storeId}`,
          message: `Avg delivery at ${store.name} exceeded 15 minutes`,
          type: 'Slow Delivery',
          storeId: store.storeId,
          createdAt: new Date().toISOString()
        });
      }
      if (store.activeRiders < 5) {
        alerts.push({
          id: `rider-${store.storeId}`,
          message: `Only ${store.activeRiders} riders active at ${store.name}`,
          type: 'Rider Shortage',
          storeId: store.storeId,
          createdAt: new Date().toISOString()
        });
      }
    });
    return alerts;
  },

  updateOrderStatuses: function() {
    this.orders.forEach(order => {
      const now = new Date();
      const created = new Date(order.createdAt);
      const diffMinutes = (now - created) / (1000 * 60);
      if (diffMinutes > 2 && order.status === 'placed') {
        order.status = 'picking';
      } else if (diffMinutes > 5 && order.status === 'picking') {
        order.status = 'dispatched';
      } else if (diffMinutes > 10 && order.status === 'dispatched') {
        order.status = 'delivered';
      }
    });
  },

  updateStores: function() {
    this.stores.forEach(store => {
      store.currentOrders = Math.max(0, Math.min(store.capacity, store.currentOrders + Math.floor(Math.random() * 11) - 5)); // -5 to +5
      store.activeRiders = Math.max(1, Math.min(20, store.activeRiders + Math.floor(Math.random() * 3) - 1)); // -1 to +1
    });
  },

  // Initialize
  init: function() {
    this.generateProducts();
    this.generateSurgeData();
  }
};

// Initialize on load
mockData.init();

module.exports = mockData;