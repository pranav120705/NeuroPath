
import React from 'react';
import { Stats } from '../types';

interface StatsTableProps {
  stats: {
    leftElbow: Stats;
    rightElbow: Stats;
    leftKnee: Stats;
    rightKnee: Stats;
  };
}

const StatsTable: React.FC<StatsTableProps> = ({ stats }) => {
  const formatNumber = (num: number) => num.toFixed(2);
  const data = [
    { joint: 'Left Elbow', ...stats.leftElbow },
    { joint: 'Right Elbow', ...stats.rightElbow },
    { joint: 'Left Knee', ...stats.leftKnee },
    { joint: 'Right Knee', ...stats.rightKnee },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joint</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mean Absolute Deviation (MAD)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mean Squared Error (MSE)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mean Absolute Percentage Error (MAPE)</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.joint}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.joint}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(row.mad)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(row.mse)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(row.mape)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsTable;
