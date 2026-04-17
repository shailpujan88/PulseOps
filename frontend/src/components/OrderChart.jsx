import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const OrderChart = ({ data }) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl mb-2">Order Trends</h2>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="orders" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};

export default OrderChart;