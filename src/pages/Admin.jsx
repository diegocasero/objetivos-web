import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useObjectives } from "../hooks/useObjectives";
import LogoutButton from "../components/LogoutButton";
import MainContainer from "../components/MainContainer";

const getProgress = (milestones) =>
  milestones && milestones.length > 0
    ? (milestones.filter(m => m.completed).length / milestones.length) * 100
    : 0;

const Admin = () => {
  const [newObjective, setNewObjective] = useState("");
  const [newUid, setNewUid] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingMilestones, setEditingMilestones] = useState([]);
  const [editingUid, setEditingUid] = useState("");
  const navigate = useNavigate();

  const { objectives, fetchObjectives, addObjective, updateObjective, deleteObjective } = useObjectives();

  useEffect(() => {
    if (!auth.currentUser || auth.currentUser.email !== "admin@demo.com") {
      navigate("/login");
      return;
    }
    fetchObjectives();
    // eslint-disable-next-line
  }, []);

  // Agrupar objetivos por usuario
  const grouped = objectives.reduce((acc, obj) => {
    acc[obj.uid] = acc[obj.uid] || [];
    acc[obj.uid].push(obj);
    return acc;
  }, {});

  // Añadir objetivo con hitos
  const handleAddObjective = async (e) => {
    e.preventDefault();
    if (!newObjective.trim() || !newUid.trim()) return;
    await addObjective({
      uid: newUid,
      text: newObjective,
      milestones: milestones.map(title => ({ title, completed: false })),
    });
    setNewObjective("");
    setNewUid("");
    setMilestones([]);
  };

  // Añadir hito al crear objetivo
  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (newMilestone.trim()) {
      setMilestones([...milestones, newMilestone]);
      setNewMilestone("");
    }
  };

  // Eliminar hito al crear objetivo
  const handleRemoveMilestone = (idx) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  // Eliminar objetivo
  const handleDeleteObjective = async (id) => {
    await deleteObjective(id);
  };

  // Editar objetivo e hitos
  const handleEditObjective = (obj) => {
    setEditingId(obj.id);
    setEditingText(obj.text);
    setEditingMilestones(obj.milestones ? [...obj.milestones] : []);
    setEditingUid(obj.uid);
  };

  // Guardar edición de objetivo
  const handleUpdateObjective = async (e) => {
    e.preventDefault();
    await updateObjective(editingId, {
      text: editingText,
      milestones: editingMilestones,
      uid: editingUid,
    });
    setEditingId(null);
    setEditingText("");
    setEditingMilestones([]);
    setEditingUid("");
  };

  // Añadir hito en edición
  const handleAddEditMilestone = (e) => {
    e.preventDefault();
    setEditingMilestones([...editingMilestones, { title: "", completed: false }]);
  };

  // Editar título de hito en edición
  const handleEditMilestoneTitle = (idx, value) => {
    setEditingMilestones(editingMilestones.map((m, i) => i === idx ? { ...m, title: value } : m));
  };

  // Eliminar hito en edición
  const handleRemoveEditMilestone = (idx) => {
    setEditingMilestones(editingMilestones.filter((_, i) => i !== idx));
  };

  // Marcar hito como completado
  const handleToggleMilestone = async (objId, milestoneIdx) => {
    const obj = objectives.find(o => o.id === objId);
    const updatedMilestones = obj.milestones.map((m, i) =>
      i === milestoneIdx ? { ...m, completed: !m.completed } : m
    );
    await updateObjective(obj.id, {
      text: obj.text,
      milestones: updatedMilestones,
      uid: obj.uid,
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingMilestones([]);
    setEditingUid("");
  };

  return (
    <>
      {/* Botón fijo arriba a la derecha, fuera del cuadrado */}
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1000,
          maxWidth: "calc(100vw - 32px)",
          width: "auto",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <LogoutButton />
      </div>
      <MainContainer maxWidth={900}>
        <h2 style={{ textAlign: "center", marginBottom: 24, color: "#1976d2", fontWeight: 800 }}>Panel de Administración</h2>
        {/* Formulario para añadir objetivo y hitos a cualquier usuario */}
        <form onSubmit={handleAddObjective} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <input
            type="text"
            placeholder="UID de usuario"
            value={newUid}
            onChange={(e) => setNewUid(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #cfd8dc",
              fontSize: 16,
              background: "#f7fafd",
              width: "100%",
            }}
          />
          <input
            type="text"
            placeholder="Nuevo objetivo"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #cfd8dc",
              fontSize: 16,
              background: "#f7fafd",
              width: "100%",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Añadir hito"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #cfd8dc",
                fontSize: 16,
                background: "#f7fafd",
              }}
            />
            <button
              onClick={handleAddMilestone}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                background: "#43a047",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              type="button"
            >
              Añadir hito
            </button>
          </div>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {milestones.map((m, idx) => (
              <li key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {m}
                <button type="button" onClick={() => handleRemoveMilestone(idx)} style={{ color: "#e53935", background: "none", border: "none", cursor: "pointer" }}>✕</button>
              </li>
            ))}
          </ul>
          <button
            type="submit"
            style={{
              padding: "12px 0",
              borderRadius: 8,
              border: "none",
              background: "#1976d2",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            Añadir objetivo
          </button>
        </form>
        {/* Lista de objetivos agrupados por usuario */}
        {Object.keys(grouped).length === 0 && (
          <div style={{ textAlign: "center", color: "#888" }}>No hay objetivos registrados.</div>
        )}
        {Object.entries(grouped).map(([uid, objs]) => (
          <div key={uid} style={{ marginBottom: 32 }}>
            <h3 style={{ color: "#43a047", marginBottom: 12, fontWeight: 700 }}>Usuario: <span style={{ fontWeight: "normal" }}>{uid}</span></h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {objs.map((obj) =>
                editingId === obj.id ? (
                  <div key={obj.id} style={{ background: "#f7fafd", borderRadius: 12, padding: 18, boxShadow: "0 2px 8px #0001" }}>
                    <form onSubmit={handleUpdateObjective} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 6,
                          border: "1px solid #bbb",
                          fontSize: 15,
                        }}
                      />
                      <input
                        type="text"
                        value={editingUid}
                        onChange={(e) => setEditingUid(e.target.value)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 6,
                          border: "1px solid #bbb",
                          fontSize: 15,
                        }}
                      />
                      <div>
                        <strong>Hitos:</strong>
                        <ul style={{ paddingLeft: 18, margin: 0 }}>
                          {editingMilestones.map((m, idx) => (
                            <li key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                type="text"
                                value={m.title}
                                onChange={e => handleEditMilestoneTitle(idx, e.target.value)}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 4,
                                  border: "1px solid #bbb",
                                  fontSize: 15,
                                }}
                              />
                              <button type="button" onClick={() => handleRemoveEditMilestone(idx)} style={{ color: "#e53935", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                            </li>
                          ))}
                        </ul>
                        <button type="button" onClick={handleAddEditMilestone} style={{ background: "#43a047", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontWeight: "bold", cursor: "pointer", marginTop: 6 }}>Añadir hito</button>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="submit"
                          style={{
                            background: "#43a047",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "8px 18px",
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
                            padding: "8px 18px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div key={obj.id} style={{
                    background: "#f7fafd",
                    borderRadius: 12,
                    padding: 18,
                    boxShadow: "0 2px 8px #0001",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 17 }}>{obj.text}</div>
                    <div style={{ color: "#1976d2", fontWeight: 600 }}>{getProgress(obj.milestones).toFixed(0)}% completado</div>
                    <div style={{ background: "#e3eafc", borderRadius: 4, height: 8, width: "100%" }}>
                      <div style={{
                        width: `${getProgress(obj.milestones)}%`,
                        background: getProgress(obj.milestones) >= 100 ? "#43a047" : "#1976d2",
                        height: "100%",
                        borderRadius: 4,
                        transition: "width 0.3s"
                      }} />
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <strong>Hitos:</strong>
                      <ul style={{ paddingLeft: 18, margin: 0 }}>
                        {obj.milestones && obj.milestones.map((m, idx) => (
                          <li key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={m.completed}
                              onChange={() => handleToggleMilestone(obj.id, idx)}
                            />
                            {m.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleEditObjective(obj)}
                        style={{
                          background: "#ffb300",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "8px 18px",
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
                          padding: "8px 18px",
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
          </div>
        ))}
      </MainContainer>
    </>
  );
};

export default Admin;