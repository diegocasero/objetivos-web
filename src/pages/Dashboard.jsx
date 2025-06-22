import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import ProgressChart from "../components/ProgressChart";

const Dashboard = () => {
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingProgress, setEditingProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    fetchObjectives();
    // eslint-disable-next-line
  }, []);

  const fetchObjectives = async () => {
    const q = query(collection(db, "objectives"), where("uid", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const objs = [];
    querySnapshot.forEach((doc) => {
      objs.push({ id: doc.id, ...doc.data() });
    });
    setObjectives(objs);
  };

  const handleAddObjective = async (e) => {
    e.preventDefault();
    if (!newObjective.trim()) return;
    await addDoc(collection(db, "objectives"), {
      uid: auth.currentUser.uid,
      text: newObjective,
      progress: 0,
    });
    setNewObjective("");
    fetchObjectives();
  };

  const handleDeleteObjective = async (id) => {
    await deleteDoc(doc(db, "objectives", id));
    fetchObjectives();
  };

  const handleEditObjective = (obj) => {
    setEditingId(obj.id);
    setEditingText(obj.text);
    setEditingProgress(obj.progress);
  };

  const handleUpdateObjective = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "objectives", editingId), {
      text: editingText,
      progress: Number(editingProgress),
    });
    setEditingId(null);
    setEditingText("");
    setEditingProgress(0);
    fetchObjectives();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingProgress(0);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Mis Objetivos</h2>
      <form onSubmit={handleAddObjective} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Nuevo objetivo"
          value={newObjective}
          onChange={(e) => setNewObjective(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Añadir
        </button>
      </form>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        {objectives.length === 0 && (
          <div style={{ textAlign: "center", color: "#888" }}>No tienes objetivos aún.</div>
        )}
        {objectives.map((obj) =>
          editingId === obj.id ? (
            <div key={obj.id} style={{ background: "#f5f5f5", borderRadius: 8, padding: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <form onSubmit={handleUpdateObjective} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  style={{
                    flex: 2,
                    padding: "6px 10px",
                    borderRadius: 4,
                    border: "1px solid #bbb",
                    fontSize: 15,
                  }}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingProgress}
                  onChange={(e) => setEditingProgress(e.target.value)}
                  style={{
                    width: 60,
                    padding: "6px 10px",
                    borderRadius: 4,
                    border: "1px solid #bbb",
                    fontSize: 15,
                  }}
                />
                <span style={{ fontSize: 15 }}>%</span>
                <button
                  type="submit"
                  style={{
                    background: "#43a047",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "6px 14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: "#e53935",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "6px 14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </form>
            </div>
          ) : (
            <div key={obj.id} style={{ background: "#f5f5f5", borderRadius: 8, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>{obj.text}</div>
                <div style={{ color: "#1976d2", fontWeight: "bold", fontSize: 15 }}>{obj.progress}% completado</div>
                <div style={{ background: "#e3eafc", borderRadius: 4, height: 8, marginTop: 6, width: 180 }}>
                  <div style={{
                    width: `${obj.progress}%`,
                    background: "#1976d2",
                    height: "100%",
                    borderRadius: 4,
                    transition: "width 0.3s"
                  }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleEditObjective(obj)}
                  style={{
                    background: "#ffb300",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "6px 14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteObjective(obj.id)}
                  style={{
                    background: "#e53935",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "6px 14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          )
        )}
      </div>
      <div style={{ background: "#f5f5f5", borderRadius: 8, padding: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 12, color: "#1976d2" }}>Progreso general</h3>
        <ProgressChart objectives={objectives} />
      </div>
    </div>
  );
};

export default Dashboard;