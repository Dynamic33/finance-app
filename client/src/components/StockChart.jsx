import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './StockChart.css';

function StockChart({ data, symbol }) {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No chart data available</div>;
  }

  return (
    <div className="stock-chart">
      <h3>{symbol} Price Movement</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#0066cc" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;