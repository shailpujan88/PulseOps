import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStore, getStoreInventory } from '../store/storesSlice';
import { selectProducts } from '../store/inventorySlice';
import { selectLiveOrders } from '../store/ordersSlice';
import { selectSurgeData } from '../store/surgeSlice';
import { selectSelectedStore } from '../store/storesSlice';

const StoreDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const store = useSelector(selectSelectedStore);
  const products = useSelector(selectProducts);
  const liveOrders = useSelector(selectLiveOrders);
  const surgeData = useSelector(selectSurgeData);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    dispatch(getStore(id));
    dispatch(getStoreInventory(id));
  }, [dispatch, id]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const storeOrders = liveOrders.filter(order => order.storeId === Number(id)).slice(-15);
  const storeSurge = surgeData.find(s => s.storeId === Number(id));
  const chartData = storeSurge ? storeSurge.hourlyData.map(h => ({ hour: h.hour, orders: h.orders })) : [];

  const filteredProducts = products.filter(p => {
    if (category !== 'All' && p.category !== category) return false;
    if (debouncedSearch && !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    return true;
  });

  const getStockStatus = (stock, minStock) => {
    if (stock >= minStock * 1.5) return { status: 'In Stock', color: '#10b981' };
    if (stock >= minStock) return { status: 'Low Stock', color: '#f59e0b' };
    return { status: 'Critical', color: '#ef4444' };
  };

  const getStoreStatus = () => {
    const capacity = store.currentOrders / store.capacity;
    if (capacity < 0.6) return { emoji: '🟢', label: 'Operational', color: '#10b981' };
    if (capacity < 0.85) return { emoji: '🟡', label: 'High Load', color: '#f59e0b' };
    return { emoji: '🔴', label: 'Critical', color: '#ef4444' };
  };

  const revenueToday = storeOrders.reduce((sum, order) => sum + order.totalValue, 0);
  const trend = Math.random() > 0.5 ? 'up' : 'down'; // Mock trend

  if (!store) return <p style={{ color: '#9ca3af' }}>Loading...</p>;

  const storeStatus = getStoreStatus();

  return (
    <div style={{ backgroundColor: '#0a0f1e', minHeight: '100vh' }}>
      {/* Store Header */}
      <div style={{ backgroundColor: '#111827', borderBottom: '1px solid #1f2937' }} className="p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">🏪 {store.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <p style={{ color: '#9ca3af' }} className="text-sm">📍 {store.zone}</p>
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              style={{
                backgroundColor: `${storeStatus.color}20`,
                color: storeStatus.color,
                border: `1px solid ${storeStatus.color}40`
              }}
            >
              {storeStatus.emoji} {storeStatus.label}
            </div>
          </div>
        </div>
        <Link
          to="/"
          className="px-6 py-3 rounded-lg text-white font-medium transition-all duration-200"
          style={{
            backgroundColor: 'transparent',
            border: '2px solid #3b82f6',
            color: '#3b82f6'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#3b82f6';
          }}
        >
          ← Back
        </Link>
      </div>

      <div className="px-6 pb-8">
        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="dark-card p-6 border-l-4" style={{ borderLeftColor: '#3b82f6', backgroundColor: '#111827' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Current Orders</h3>
            <p className="text-4xl font-bold mt-2 text-white">{store.currentOrders}<span className="text-lg font-medium" style={{ color: '#9ca3af' }}>/{store.capacity}</span></p>
            <div className="gradient-bar mt-3"></div>
            <p className="text-xs mt-2" style={{ color: '#10b981' }}>Capacity: {Math.round((store.currentOrders / store.capacity) * 100)}%</p>
          </div>
          <div className="dark-card p-6 border-l-4" style={{ borderLeftColor: '#10b981', backgroundColor: '#111827' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Active Riders</h3>
            <p className="text-4xl font-bold mt-2 text-white">{store.activeRiders}</p>
            <p className="text-xs mt-2" style={{ color: '#10b981' }}>🛵 On duty</p>
          </div>
          <div className="dark-card p-6 border-l-4" style={{ borderLeftColor: '#f59e0b', backgroundColor: '#111827' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Avg Delivery Time</h3>
            <p className="text-4xl font-bold mt-2 text-white">{store.avgDeliveryTime}<span className="text-lg font-medium" style={{ color: '#9ca3af' }}>min</span></p>
            <p className="text-xs mt-2" style={{ color: trend === 'up' ? '#ef4444' : '#10b981' }}>
              {trend === 'up' ? '↑' : '↓'} vs yesterday
            </p>
          </div>
          <div className="dark-card p-6 border-l-4" style={{ borderLeftColor: '#8b5cf6', backgroundColor: '#111827' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Revenue Today</h3>
            <p className="text-4xl font-bold mt-2 text-white">₹{revenueToday}</p>
            <p className="text-xs mt-2" style={{ color: '#10b981' }}>+{Math.round(Math.random() * 20)}% growth</p>
          </div>
        </div>

      {/* Surge Prediction Chart */}
      <div className="dark-card p-6 mb-8 relative" style={{ backgroundColor: '#111827' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Surge Prediction (24h)</h2>
            <p style={{ color: '#9ca3af' }} className="text-xs mt-1">Predicted order volume · updates every 10min</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            {/* Peak hour rectangles */}
            {chartData.map((entry, index) => {
              const isPeakHour = (entry.hour >= 8 && entry.hour < 10) || 
                                 (entry.hour >= 12 && entry.hour < 14) || 
                                 (entry.hour >= 19 && entry.hour < 22);
              if (isPeakHour && index === 0) {
                return (
                  <rect key={`peak-${index}`} x={0} y={0} width="100%" height={300} fill="#ef444410" />
                );
              }
              return null;
            })}

            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1f2937', borderRadius: '8px' }}
              labelStyle={{ color: '#f9fafb' }}
              labelFormatter={(h) => `${h}:00`}
              formatter={(value) => [`${value} orders`, 'Orders']}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
            
            {/* Peak hour labels */}
            {chartData.map((entry, idx) => {
              const isPeakStart = (entry.hour === 8) || (entry.hour === 12) || (entry.hour === 19);
              if (isPeakStart) {
                return (
                  <text key={`peak-label-${idx}`} x={`${(idx / chartData.length) * 100}%`} y={20} fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">
                    PEAK
                  </text>
                );
              }
              return null;
            })}

            {/* Current hour marker */}
            {(() => {
              const currentHour = new Date().getHours();
              const currentIndex = chartData.findIndex(d => d.hour === currentHour);
              if (currentIndex !== -1) {
                const xPos = (currentIndex / chartData.length) * 100;
                return (
                  <line key="current-hour" x1={`${xPos}%`} y1={0} x2={`${xPos}%`} y2={300} stroke="#10b981" strokeDasharray="5,5" strokeWidth={2} />
                );
              }
              return null;
            })()}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Health */}
      <div className="dark-card p-6 mb-8" style={{ backgroundColor: '#111827' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Inventory Health</h2>
          </div>
          <span style={{ color: '#9ca3af' }} className="text-sm">Showing {filteredProducts.length} products</span>
        </div>
        <div className="mb-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['All', 'Grocery', 'Dairy', 'Snacks', 'Beverages', 'Personal Care', 'Pharma'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0"
                style={{
                  backgroundColor: category === cat ? '#10b981' : '#1f2937',
                  color: category === cat ? '#fff' : '#d1d5db'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-lg text-white"
            style={{ backgroundColor: '#0f172a', border: '1px solid #1f2937' }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1f2937' }}>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Product</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Stock</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Min Stock</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>% Available</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Status</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center" style={{ color: '#9ca3af' }}>No products found</td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const { status, color } = getStockStatus(product.stock, product.minStock);
                  const maxStock = product.minStock * 2;
                  const stockPercent = Math.min((product.stock / maxStock) * 100, 100);
                  const isCritical = status === 'Critical';
                  return (
                    <tr
                      key={product.productId}
                      style={{
                        borderBottom: '1px solid #1f2937',
                        borderLeft: isCritical ? '3px solid #ef4444' : 'none',
                        backgroundColor: '#111827',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1f2937';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#111827';
                      }}
                    >
                      <td className="p-3 text-white font-medium">{product.name}</td>
                      <td className="p-3 text-white">{product.stock}</td>
                      <td className="p-3" style={{ color: '#9ca3af' }}>{product.minStock}</td>
                      <td className="p-3">
                        <div style={{ width: '100%', maxWidth: '80px' }}>
                          <div
                            style={{
                              height: '6px',
                              backgroundColor: '#0f172a',
                              borderRadius: '3px',
                              overflow: 'hidden',
                              marginBottom: '4px'
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${stockPercent}%`,
                                backgroundColor: color,
                                transition: 'width 0.3s ease'
                              }}
                            ></div>
                          </div>
                          <span className="text-xs" style={{ color: '#9ca3af' }}>{Math.round(stockPercent)}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                          <span className="text-sm font-medium" style={{ color: color }}>{status}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200"
                          style={{
                            border: '1px solid #10b981',
                            color: '#10b981',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#10b981';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#10b981';
                          }}
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dark-card p-6" style={{ backgroundColor: '#111827' }}>
        <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1f2937' }}>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Order ID</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Items</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Value</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Status</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Time</th>
                <th className="p-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>ETA</th>
              </tr>
            </thead>
            <tbody>
              {storeOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center" style={{ color: '#9ca3af' }}>No recent orders</td>
                </tr>
              ) : (
                storeOrders.map(order => {
                  const statusColors = {
                    placed: { bg: '#1e3a8a', text: '#93c5fd' },
                    picking: { bg: '#78350f', text: '#fcd34d' },
                    dispatched: { bg: '#581c87', text: '#d8b4fe' },
                    delivered: { bg: '#064e3b', text: '#86efac' }
                  };
                  const sc = statusColors[order.status] || { bg: '#374151', text: '#d1d5db' };
                  return (
                    <tr key={order.orderId} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td className="p-3 text-white font-mono">#{order.orderId.toString().slice(-4)}</td>
                      <td className="p-3 text-white">{order.items.length}</td>
                      <td className="p-3 text-white font-medium">₹{order.totalValue}</td>
                      <td className="p-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: sc.bg, color: sc.text }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3" style={{ color: '#9ca3af' }}>{new Date(order.createdAt).toLocaleTimeString()}</td>
                      <td className="p-3" style={{ color: '#9ca3af' }}>{new Date(order.estimatedDelivery).toLocaleTimeString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default StoreDetail;