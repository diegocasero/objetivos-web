import React from "react";

const ObjectivesBarChart = ({ objectives }) => {
  const completed = objectives.filter(obj =>
    obj.milestones && obj.milestones.length > 0 &&
    obj.milestones.every(m => m.completed)
  ).length;
  const pending = objectives.length - completed;

  return (
    <div style={{ width: 220, margin: "0 auto" }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>Completados: {completed}</div>
      <div style={{ background: "#e3eafc", borderRadius: 4, height: 24, marginBottom: 8 }}>
        <div style={{
          width: `${(completed / objectives.length) * 100 || 0}%`,
          background: "#43a047",
          height: "100%",
          borderRadius: 4,
          transition: "width 0.3s"
        }} />
      </div>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>Pendientes: {pending}</div>
      <div style={{ background: "#e3eafc", borderRadius: 4, height: 24 }}>
        <div style={{
          width: `${(pending / objectives.length) * 100 || 0}%`,
          background: "#e53935",
          height: "100%",
          borderRadius: 4,
          transition: "width 0.3s"
        }} />
      </div>
    </div>
  );
};

export default ObjectivesBarChart;