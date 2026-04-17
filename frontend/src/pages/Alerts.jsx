import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { dismissAlert, updateAlerts } from '../store/alertsSlice';
import { selectStores } from '../store/storesSlice';
import socket from '../services/socket';

const Alerts = () => {
  const dispatch = useDispatch();
  const activeAlerts = useSelector(state => state.alerts.active);
  const dismissedAlerts = useSelector(state => state.alerts.dismissed);
  const stores = useSelector(selectStores);
  const [filterType, setFilterType] = useState('All');
  const [filterStore, setFilterStore] = useState('All');

  useEffect(() => {
    socket.on('alert:new', (alerts) => {
      dispatch(updateAlerts(alerts));
    });
    return () => socket.off('alert:new');
  }, [dispatch]);

  const filteredActive = activeAlerts.filter(alert => {
    if (filterType !== 'All' && alert.type !== filterType) return false;
    if (filterStore !== 'All' && alert.storeId !== Number(filterStore)) return false;
    return true;
  });

  const recentDismissed = dismissedAlerts.filter(alert => {
    const dismissedTime = new Date(alert.dismissedAt);
    const now = new Date();
    return (now - dismissedTime) < 24 * 60 * 60 * 1000; // Last 24h
  });

  const getAlertStyle = (type) => {
    switch (type) {
      case 'Critical Stock': return { border: 'border-l-red-500', icon: '🔴', bg: '#1a1425' };
      case 'Low Stock': return { border: 'border-l-yellow-500', icon: '🟡', bg: '#1a1814' };
      case 'Surge Detected': return { border: 'border-l-red-500', icon: '🔴', bg: '#1a1425' };
      case 'Slow Delivery': return { border: 'border-l-yellow-500', icon: '🟡', bg: '#1a1814' };
      case 'Rider Shortage': return { border: 'border-l-blue-500', icon: '🔵', bg: '#141a25' };
      default: return { border: 'border-l-gray-600', icon: 'ℹ️', bg: '#0f1419' };
    }
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div style={{ backgroundColor: '#0a0f1e', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#111827', borderBottom: '1px solid #1f2937' }} className="p-6 mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Alert Center
          <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: '#ef4444', color: '#fff' }}>
            {activeAlerts.length}
          </span>
        </h1>
      </div>

      <div className="px-6 pb-8">
        {/* Filters */}
        <div className="dark-card p-6 mb-8" style={{ backgroundColor: '#111827' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Alert Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-3 rounded-lg text-white" style={{ backgroundColor: '#0f172a', border: '1px solid #1f2937' }}
              >
                <option>All</option>
                <option>Critical Stock</option>
                <option>Low Stock</option>
                <option>Surge Detected</option>
                <option>Slow Delivery</option>
                <option>Rider Shortage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Store</label>
              <select
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                className="w-full p-3 rounded-lg text-white" style={{ backgroundColor: '#0f172a', border: '1px solid #1f2937' }}
              >
                <option value="All">All Stores</option>
                {stores.map(store => (
                  <option key={store.storeId} value={store.storeId}>{store.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Active Alerts</h2>
          {filteredActive.length === 0 ? (
            <div className="dark-card p-12 text-center" style={{ backgroundColor: '#111827' }}>
              <p style={{ color: '#9ca3af' }}>No active alerts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActive.map(alert => {
                const style = getAlertStyle(alert.type);
                const store = stores.find(s => s.storeId === alert.storeId);
                return (
                  <div
                    key={alert.id}
                    className={`dark-card p-5 border-l-4 ${style.border} slide-in`}
                    style={{ backgroundColor: style.bg }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{style.icon}</span>
                        <div>
                          <h3 className="font-bold text-lg text-white">{alert.type}</h3>
                          <p style={{ color: '#d1d5db' }} className="mt-1">{alert.message}</p>
                          <p style={{ color: '#9ca3af' }} className="text-xs mt-2">
                            {store ? store.name : 'Global'} • {timeAgo(alert.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => dispatch(dismissAlert(alert.id))}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          style={{ backgroundColor: '#374151', color: '#f9fafb' }}
                        >
                          Dismiss
                        </button>
                        {alert.storeId && (
                          <Link
                            to={`/store/${alert.storeId}`}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            style={{ backgroundColor: '#3b82f6', color: '#fff' }}
                          >
                            View Store
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alert History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Alert History (Last 24h)</h2>
          {recentDismissed.length === 0 ? (
            <div className="dark-card p-12 text-center" style={{ backgroundColor: '#111827' }}>
              <p style={{ color: '#9ca3af' }}>No dismissed alerts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDismissed.map(alert => {
                const style = getAlertStyle(alert.type);
                const store = stores.find(s => s.storeId === alert.storeId);
                return (
                  <div
                    key={alert.id}
                    className={`dark-card p-5 border-l-4 ${style.border}`}
                    style={{ backgroundColor: style.bg, opacity: 0.6 }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{style.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg text-white">{alert.type}</h3>
                        <p style={{ color: '#d1d5db' }} className="mt-1">{alert.message}</p>
                        <p style={{ color: '#9ca3af' }} className="text-xs mt-2">
                          {store ? store.name : 'Global'} • Dismissed {timeAgo(alert.dismissedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;