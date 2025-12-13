import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Session } from '../types';

interface AnalysisChartProps {
  session1: Session;
  session2: Session;
}

type JointKey = 'leftElbow' | 'rightElbow' | 'leftKnee' | 'rightKnee';

const JOINT_KEYS: JointKey[] = ['leftElbow', 'rightElbow', 'leftKnee', 'rightKnee'];
const JOINT_NAMES: Record<JointKey, string> = {
  leftElbow: 'Left Elbow',
  rightElbow: 'Right Elbow',
  leftKnee: 'Left Knee',
  rightKnee: 'Right Knee',
};

const AnalysisChart: React.FC<AnalysisChartProps> = ({ session1, session2 }) => {
  const [selectedJoint, setSelectedJoint] = useState<JointKey>('leftElbow');

  const chartData = useMemo(() => {
    const angles1 = session1.angles[selectedJoint];
    const angles2 = session2.angles[selectedJoint];
    const maxLength = Math.max(angles1.length, angles2.length);
    const data = [];
    for (let i = 0; i < maxLength; i++) {
      data.push({
        frame: i + 1,
        session1: angles1[i] ?? null,
        session2: angles2[i] ?? null,
      });
    }
    return data;
  }, [session1, session2, selectedJoint]);

  const session1Name = `Session (${new Date(session1.date).toLocaleDateString()})`;
  const session2Name = session2.id === 'benchmark' 
    ? 'Benchmark' 
    : `Session (${new Date(session2.date).toLocaleDateString()})`;

  return (
    <div>
        <div className="mb-4">
            <label htmlFor="joint-chart-select" className="block text-sm font-medium text-gray-700">
                Select Joint to Display
            </label>
            <select
                id="joint-chart-select"
                value={selectedJoint}
                onChange={(e) => setSelectedJoint(e.target.value as JointKey)}
                className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
                {JOINT_KEYS.map(key => (
                    <option key={key} value={key}>{JOINT_NAMES[key]}</option>
                ))}
            </select>
        </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="frame" label={{ value: 'Frame', position: 'insideBottom', offset: -5 }}/>
          <YAxis label={{ value: 'Angle (degrees)', angle: -90, position: 'insideLeft' }} domain={[0, 180]}/>
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="session1" name={session1Name} stroke="#8884d8" dot={false} connectNulls />
          <Line type="monotone" dataKey="session2" name={session2Name} stroke="#10B981" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalysisChart;
