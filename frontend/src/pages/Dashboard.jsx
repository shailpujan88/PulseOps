import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import socket from '../services/socket';
import { getStores, updateStores } from '../store/storesSlice';
import { getLiveOrders, addOrder, updateOrders } from '../store/ordersSlice';
import { getProducts, updateProducts } from '../store/inventorySlice';
import { getAlerts, updateAlerts } from '../store/alertsSlice';
import { getSurgeStats } from '../store/surgeSlice';
import {
  selectStores,
  selectStoresLoading,
} from '../store/storesSlice';
import {
  selectLiveOrders,
} from '../store/ordersSlice';
import {
  selectLowStockItems,
} from '../store/inventorySlice';
import Toast from '../components/Toast';

const Dashboard = () => {
  const dispatch = useDispatch();
  const stores = useSelector(selectStores);
  const liveOrders = useSelector(selectLiveOrders);
  const lowStockAlerts = useSelector(selectLowStockItems);
  const storesLoading = useSelector(selectStoresLoading);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showToast, setShowToast] = useState(false);
  const [surgeActive, setSurgeActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSurgeSimulation = () => {
    if (surgeActive) return;
    
    setShowToast(true);
    setSurgeActive(true);
    
    // Simulate 3x order spike - make rapid requests to create more orders
    const surgeInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        socket.emit('request:order');
      }
    }, 500);
    
    // Stop surge after 30 seconds
    setTimeout(() => {
      clearInterval(surgeInterval);
      setSurgeActive(false);
    }, 30000);
  };

  useEffect(() => {
    dispatch(getStores());
    dispatch(getLiveOrders());
    dispatch(getProducts());
    dispatch(getAlerts());
    dispatch(getSurgeStats());

    socket.on('order:new', (order) => dispatch(addOrder(order)));
    socket.on('order:update', (orders) => dispatch(updateOrders(orders)));
    socket.on('store:update', (stores) => dispatch(updateStores(stores)));
    socket.on('alert:new', (alerts) => dispatch(updateAlerts(alerts)));
    socket.on('products', (products) => dispatch(updateProducts(products)));

    return () => {
      socket.off('order:new');
      socket.off('order:update');
      socket.off('store:update');
      socket.off('alert:new');
      socket.off('products');
    };
  }, [dispatch]);

  const totalActiveOrders = stores.reduce((sum, store) => sum + store.currentOrders, 0);
  const avgDeliveryTime = stores.length ? (stores.reduce((sum, store) => sum + store.avgDeliveryTime, 0) / stores.length).toFixed(1) : 0;
  const lowStockCount = lowStockAlerts.length;
  const activeRiders = stores.reduce((sum, store) => sum + store.activeRiders, 0);

  const getCapacityColor = (current, capacity) => {
    const percent = (current / capacity) * 100;
    if (percent < 60) return '#10b981'; // green
    if (percent < 85) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getCapacityTopGradient = (current, capacity) => {
    const percent = (current / capacity) * 100;
    if (percent < 60) return 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)';
    if (percent < 85) return 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)';
    return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const last10Orders = liveOrders.slice(-10).reverse();

  return (
    <div style={{ backgroundColor: '#0a0f1e', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <nav style={{ backgroundColor: '#0a0f1e', borderBottom: '1px solid #1f2937' }} className="px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="pulse-dot"></div>
          <span className="text-2xl font-bold text-white">PulseOps</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/alerts" className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200" style={{ backgroundColor: '#1f2937', color: '#f9fafb' }}>
            Alerts <span style={{ color: '#ef4444' }} className="font-bold">●</span>
          </Link>
          <span className="text-sm font-mono" style={{ color: '#9ca3af' }}>{currentTime}</span>
          <div className="flex items-center space-x-2">
            <div className="live-indicator"></div>
            <span className="text-sm font-semibold" style={{ color: '#10b981' }}>LIVE</span>
          </div>
        </div>
      </nav>

      {/* KPI Row */}
      <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="dark-card p-6 border-l-4" style={{ borderLeftColor: '#3b82f6', backgroundColor: '#111827' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Total Orders</h3>
          <p className="text-4xl font-bold mt-2 text-white">{totalActiveOrders}</p>
          <p className="text-xs mt-2" style={{ color: '#10b981' }}>↑ 12% vs yesterday</p>
        </div>

        {/* Avg Delivery Time */}
        <div className="dark-card p-6 border-l-4" style={{ borderLeftColor: '#10b981', backgroundColor: '#111827' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Avg Delivery Time</h3>
          <p className="text-4xl font-bold mt-2 text-white">{avgDeliveryTime}<span className="text-lg font-medium" style={{ color: '#9ca3af' }}>min</span></p>
          <p className="text-xs mt-2" style={{ color: '#ef4444' }}>↑ 5% vs yesterday</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="dark-card p-6 border-l-4 low-stock-glow" style={{ borderLeftColor: '#ef4444', backgroundColor: '#111827' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Low Stock Alerts</h3>
          <p className="text-4xl font-bold mt-2 text-white">{lowStockCount}</p>
          <p className="text-xs mt-2" style={{ color: '#ef4444' }}>Critical if >5</p>
        </div>

        {/* Active Riders */}
        <div className="dark-card p-6 border-l-4" style={{ borderLeftColor: '#f59e0b', backgroundColor: '#111827' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Active Riders</h3>
          <p className="text-4xl font-bold mt-2 text-white">{activeRiders}</p>
          <p className="text-xs mt-2" style={{ color: '#10b981' }}>↓ 2% vs yesterday</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Network Map */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              Store Network
              <span style={{ color: '#10b981' }} className="text-xs font-medium">• {stores.length} stores</span>
            </h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: '#10b981', borderRadius: '999px' }}></div>
          </div>
          {storesLoading ? (
            <p style={{ color: '#9ca3af' }}>Loading stores...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stores.map((store) => {
                const perc = (store.currentOrders / store.capacity) * 100;
                const capacityColor = getCapacityColor(store.currentOrders, store.capacity);
                return (
                  <Link key={store.storeId} to={`/store/${store.storeId}`} className="block group">
                    <div
                      className="dark-card p-5 card-glow relative overflow-hidden transition-all duration-300"
                      style={{
                        backgroundColor: '#111827',
                        border: `1px solid #1f2937`,
                        boxShadow: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = capacityColor;
                        e.currentTarget.style.boxShadow = `0 0 20px ${capacityColor}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#1f2937';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Top Gradient Bar */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: getCapacityTopGradient(store.currentOrders, store.capacity)
                        }}
                      ></div>

                      <h3 className="font-bold text-lg text-white mt-1">🏪 {store.name}</h3>
                      <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>📍 {store.zone}</p>

                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs" style={{ color: '#9ca3af' }}>Capacity</span>
                          <span className="text-xs font-semibold text-white">{Math.round(perc)}%</span>
                        </div>
                        {/* Thicker Capacity Bar with Shimmer */}
                        <div
                          className="shimmer-bar"
                          style={{
                            height: '12px',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            backgroundColor: '#0f172a',
                            backgroundImage: `linear-gradient(90deg, ${capacityColor}00 0%, ${capacityColor} 50%, ${capacityColor}00 100%)`,
                            backgroundSize: '200% 100%'
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(perc, 100)}%`,
                              backgroundColor: capacityColor,
                              borderRadius: '999px',
                              transition: 'width 0.3s ease'
                            }}
                          ></div>
                        </div>
                        <p className="text-xs mt-2 text-white font-medium">{store.currentOrders}/{store.capacity} orders</p>
                      </div>
                      <div className="mt-4 flex justify-between text-xs">
                        <span style={{ color: '#9ca3af' }}>⚡ {store.avgDeliveryTime}min</span>
                        <span style={{ color: '#9ca3af' }}>🛵 {store.activeRiders}</span>
                      </div>

                      {/* Hover: View Details */}
                      <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span style={{ color: '#10b981' }} className="text-xs font-semibold">View Details →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Order Feed */}
        <div className="dark-card p-6" style={{ backgroundColor: '#111827', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <div className="sticky top-6 z-10 mb-4 pb-4" style={{ backgroundColor: '#111827', borderBottom: '1px solid #1f2937' }}>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="live-indicator"></span>
              Live Orders
            </h2>
          </div>
          <div className="space-y-0 max-h-96 overflow-y-auto">
            {last10Orders.length === 0 ? (
              <p style={{ color: '#9ca3af' }} className="text-sm text-center py-8">No recent orders</p>
            ) : (
              last10Orders.map((order, index) => {
                const store = stores.find(s => s.storeId === order.storeId);
                const statusBorderColors = {
                  placed: '#3b82f6',
                  picking: '#f59e0b',
                  dispatched: '#a855f7',
                  delivered: '#10b981'
                };
                return (
                  <div key={order.orderId}>
                    <div
                      className={`p-4 slide-in`}
                      style={{
                        backgroundColor: '#0f172a',
                        borderLeft: `3px solid ${statusBorderColors[order.status] || '#6b7280'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-white">#{order.orderId.toString().slice(-4)}</span>
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: `${statusBorderColors[order.status]}20`,
                              color: statusBorderColors[order.status]
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="text-xs flex gap-2">
                          <span style={{ color: '#9ca3af' }}>🏪 {store ? store.name : 'Unknown'}</span>
                          <span style={{ color: '#6b7280', fontStyle: 'italic' }}>{timeAgo(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: '#10b981' }}>₹{order.totalValue}</p>
                      </div>
                    </div>
                    {index < last10Orders.length - 1 && (
                      <div style={{ height: '1px', backgroundColor: '#1f2937' }}></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Floating Surge Button */}
      <button
        onClick={handleSurgeSimulation}
        disabled={surgeActive}
        className="fixed bottom-8 right-8 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 px-6 py-3 font-semibold z-40"
        style={{
          backgroundColor: surgeActive ? '#059669' : '#10b981',
          color: '#fff',
          border: 'none',
          cursor: surgeActive ? 'not-allowed' : 'pointer',
          opacity: surgeActive ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!surgeActive) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        }}
      >
        🚀 Simulate Surge
      </button>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="⚡ Surge Simulated — 3x load active for 30s"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;