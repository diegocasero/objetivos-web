import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

const WIDGETS = [
  { key: "progress", label: "Progreso general" },
  { key: "objectives", label: "Lista de objetivos" },
  { key: "chart", label: "Gráfico de objetivos" }
];

const DashboardSettings = ({ onChange }) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists() && snap.data().dashboardWidgets) {
        setSelected(snap.data().dashboardWidgets);
        if (onChange) onChange(snap.data().dashboardWidgets);
      } else {
        setSelected(WIDGETS.map(w => w.key));
        if (onChange) onChange(WIDGETS.map(w => w.key));
      }
    };
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const handleToggle = async (key) => {
    let updated;
    if (selected.includes(key)) {
      updated = selected.filter(k => k !== key);
    } else {
      updated = [...selected, key];
    }
    setSelected(updated);
    if (onChange) onChange(updated);
    // Guarda en Firestore
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { dashboardWidgets: updated });
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <strong>Personaliza tu dashboard:</strong>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
        {WIDGETS.map(w => (
          <label key={w.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={selected.includes(w.key)}
              onChange={() => handleToggle(w.key)}
            />
            {w.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default DashboardSettings;