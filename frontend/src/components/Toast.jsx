import React, { useEffect } from 'react';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleExit = () => {
    const toast = document.querySelector('.toast');
    if (toast) {
      toast.classList.add('exit');
      setTimeout(onClose, 300);
    }
  };

  return (
    <div className="toast">
      {message}
      <button
        onClick={handleExit}
        className="ml-4 text-white opacity-70 hover:opacity-100"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
