import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";

const ProgressChart = ({ objectives }) => {
  const getProgress = (milestones) =>
    milestones && milestones.length > 0
      ? (milestones.filter(m => m.completed).length / milestones.length) * 100
      : 0;

  const data = objectives.map(obj => ({
    name: obj.text,
    progress: typeof obj.progress === "number"
      ? obj.progress
      : getProgress(obj.milestones || [])
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
        <XAxis dataKey="name" tick={{ fontSize: 13 }} />
        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
        <Tooltip formatter={v => `${v.toFixed(0)}%`} />
        <Bar dataKey="progress">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.progress >= 100 ? "#43a047" : "#1976d2"}
            />
          ))}
          <LabelList dataKey="progress" position="top" formatter={v => `${v.toFixed(0)}%`} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;