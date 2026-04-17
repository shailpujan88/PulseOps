import React from 'react';

const InventoryList = ({ data }) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl mb-2">Inventory</h2>
      <ul className="list-disc list-inside">
        {data.map(item => <li key={item.id}>{item.name}: {item.quantity}</li>)}
      </ul>
    </div>
  );
};

export default InventoryList;