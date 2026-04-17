import React from 'react';

const AlertPanel = ({ data }) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl mb-2">Alerts</h2>
      <ul className="list-disc list-inside">
        {data.map(alert => <li key={alert.id} className="text-red-500">{alert.message}</li>)}
      </ul>
    </div>
  );
};

export default AlertPanel;