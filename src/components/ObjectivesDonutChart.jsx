import React from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#43a047", "#1976d2"]; // Verde para completados, azul para pendientes

const ObjectivesDonutChart = ({ objectives }) => {
  const total = objectives.length;
  const completed = objectives.filter(obj =>
    obj.milestones && obj.milestones.length > 0 &&
    obj.milestones.every(m => m.completed)
  ).length;
  const pending = total - completed;

  const data = [
    { name: "Completados", value: completed },
    { name: "Pendientes", value: pending },
  ];

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      minHeight: 220,
    }}>
      <PieChart width={480} height={220}>
        <Pie
          data={data}
          cx={150}
          cy={110}
          innerRadius={50}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={3}
          dataKey="value"
          label
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Legend layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </div>
  );
};

export default ObjectivesDonutChart;