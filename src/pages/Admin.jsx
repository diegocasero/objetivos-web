import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useObjectives } from "../hooks/useObjectives";
import LogoutButton from "../components/LogoutButton";
import MainContainer from "../components/MainContainer";
import { getUidByEmail, getUsersMap } from "../services/userService";
import { Timestamp } from "firebase/firestore";

const getProgress = (milestones) =>
  milestones && milestones.length > 0
    ? (milestones.filter(m => m.completed).length / milestones.length) * 100
    : 0;

const getTimeProgress = (createdAt, deadline) => {
  if (!deadline) return null;
  
  const now = new Date();
  const due = deadline.toDate();
  
  // Si no hay createdAt, usar fecha estimada (30 días antes de deadline)
  const created = createdAt ? 
    createdAt.toDate() : 
    new Date(due.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  const total = due - created;
  const elapsed = now - created;
  
  // Calcular días de forma más precisa
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(due);
  dueDate.setHours(0, 0, 0, 0);
  
  const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  const isOverdue = dueDate < today;
  
  if (total <= 0) return { progress: 100, daysLeft, isOverdue };
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
  
  return {
    progress: progress,
    daysLeft: daysLeft,
    isOverdue: isOverdue
  };
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  return timestamp.toDate().toLocaleDateString('es-ES');
};

const Admin = () => {
  const [newEmail, setNewEmail] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newObjectiveDeadline, setNewObjectiveDeadline] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingDeadline, setEditingDeadline] = useState("");
  const [editingMilestones, setEditingMilestones] = useState([]);
  const [editingUid, setEditingUid] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [usersMap, setUsersMap] = useState({});
  const [commentText, setCommentText] = useState({});
  const navigate = useNavigate();

  const {
    objectives,
    fetchObjectives,
    addObjective,
    updateObjective,
    deleteObjective,
    addComment,
    deleteComment,
  } = useObjectives();

  useEffect(() => {
    if (!auth.currentUser || auth.currentUser.email !== "conquistalogros@gmail.com") {
      navigate("/login");
      return;
    }
    fetchObjectives();
    const fetchUsers = async () => {
      const map = await getUsersMap();
      setUsersMap(map);
    };
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Agrupar objetivos por usuario
  const grouped = objectives.reduce((acc, obj) => {
    acc[obj.uid] = acc[obj.uid] || [];
    acc[obj.uid].push(obj);
    return acc;
  }, {});

  // Añadir objetivo con hitos usando correo
  const handleAddObjective = async (e) => {
    e.preventDefault();
    setError("");
    if (!newObjective.trim() || !newEmail.trim()) return;
    const uid = await getUidByEmail(newEmail);
    if (!uid) {
      setError("No se encontró ningún usuario con ese correo.");
      return;
    }
    if (milestones.length === 0) {
      setError("Debes añadir al menos un hito.");
      return;
    }
    
    const deadline = newObjectiveDeadline ? Timestamp.fromDate(new Date(newObjectiveDeadline)) : null;
    
    await addObjective({
      uid,
      text: newObjective,
      milestones: milestones.map(title => ({ title, completed: false })),
      deadline: deadline,
    });
    setNewObjective("");
    setNewEmail("");
    setNewObjectiveDeadline("");
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
  const handleEditObjective = async (obj) => {
    setEditingId(obj.id);
    setEditingText(obj.text);
    setEditingMilestones(obj.milestones ? [...obj.milestones] : []);
    setEditingDeadline(obj.deadline ? obj.deadline.toDate().toISOString().split('T')[0] : "");
    setEditingUid(obj.uid);
    setEditingEmail(usersMap[obj.uid] || "");
    setEditError("");
  };

  // Guardar edición de objetivo usando correo
  const handleUpdateObjective = async (e) => {
    e.preventDefault();
    setEditError("");
    let uid = editingUid;
    if (editingEmail && editingEmail !== "") {
      uid = await getUidByEmail(editingEmail);
      if (!uid) {
        setEditError("No se encontró ningún usuario con ese correo.");
        return;
      }
    }
    if (editingMilestones.length === 0) {
      setEditError("Debes añadir al menos un hito.");
      return;
    }
    
    const deadline = editingDeadline ? Timestamp.fromDate(new Date(editingDeadline)) : null;
    
    await updateObjective(editingId, {
      text: editingText,
      milestones: editingMilestones,
      deadline: deadline,
      uid,
    });
    setEditingId(null);
    setEditingText("");
    setEditingMilestones([]);
    setEditingDeadline("");
    setEditingUid("");
    setEditingEmail("");
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
      deadline: obj.deadline,
      uid: obj.uid,
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setEditingMilestones([]);
    setEditingDeadline("");
    setEditingUid("");
    setEditingEmail("");
    setEditError("");
  };

  // Añadir comentario a un objetivo
  const handleAddComment = async (objectiveId) => {
    if (!commentText[objectiveId] || !commentText[objectiveId].trim()) return;
    await addComment(objectiveId, {
      user: auth.currentUser.email,
      text: commentText[objectiveId],
      createdAt: Timestamp.now()
    });
    setCommentText({ ...commentText, [objectiveId]: "" });
    fetchObjectives();
  };

  // Eliminar comentario (admin puede eliminar cualquiera)
  const handleDeleteComment = async (objectiveId, comment) => {
    await deleteComment(objectiveId, comment);
    fetchObjectives();
  };

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }
      `}</style>
      {/* Botón fijo arriba a la derecha, fuera del cuadrado */}
      <div style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 1000,
        maxWidth: "calc(100vw - 32px)",
        width: "auto",
        display: "flex",
        justifyContent: "flex-end",
      }}>
        <LogoutButton />
      </div>
      <MainContainer maxWidth={900}>
        <h2 style={{ textAlign: "center", marginBottom: 24, color: "#1976d2", fontWeight: 800 }}>Panel de Administración</h2>
        {/* Formulario para añadir objetivo y hitos a cualquier usuario */}
        <form onSubmit={handleAddObjective} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <input
            type="email"
            placeholder="Correo del usuario"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #cfd8dc",
              fontSize: 16,
              background: "#f7fafd",
              width: "100%",
            }}
            required
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
            required
          />
          <input
            type="date"
            value={newObjectiveDeadline}
            onChange={(e) => setNewObjectiveDeadline(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #cfd8dc",
              fontSize: 16,
              background: "#f7fafd",
              width: "100%",
            }}
            placeholder="Fecha límite (opcional)"
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
          {error && <div style={{ color: "#e53935", fontWeight: "bold" }}>{error}</div>}
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
            <h3 style={{ color: "#43a047", marginBottom: 12, fontWeight: 700 }}>
              Usuario: <span style={{ fontWeight: "normal" }}>
                {usersMap[uid] || uid}
              </span>
            </h3>
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
                        type="email"
                        value={editingEmail}
                        onChange={(e) => setEditingEmail(e.target.value)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 6,
                          border: "1px solid #bbb",
                          fontSize: 15,
                        }}
                        placeholder="Correo del usuario"
                      />
                      <input
                        type="date"
                        value={editingDeadline}
                        onChange={(e) => setEditingDeadline(e.target.value)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 6,
                          border: "1px solid #bbb",
                          fontSize: 15,
                        }}
                        placeholder="Fecha límite (opcional)"
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
                    
                    {/* Información de fecha límite - SOLO SI NO ESTÁ COMPLETADO */}
                    {obj.deadline && getProgress(obj.milestones) < 100 && (
                      <div style={{ 
                        fontSize: 14, 
                        color: "#666",
                        background: (() => {
                          const timeInfo = getTimeProgress(obj.createdAt, obj.deadline);
                          if (!timeInfo) return "transparent";
                          if (timeInfo.isOverdue) return "#ffebee";
                          if (timeInfo.daysLeft <= 1) return "#fff3e0";
                          if (timeInfo.daysLeft <= 3) return "#fff8e1";
                          return "transparent";
                        })(),
                        padding: 8,
                        borderRadius: 6,
                        border: (() => {
                          const timeInfo = getTimeProgress(obj.createdAt, obj.deadline);
                          if (!timeInfo) return "none";
                          if (timeInfo.isOverdue) return "2px solid #e53935";
                          if (timeInfo.daysLeft <= 1) return "2px solid #ff9800";
                          if (timeInfo.daysLeft <= 3) return "2px solid #ffc107";
                          return "1px solid #e0e0e0";
                        })()
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <strong>📅 Fecha límite:</strong> {formatDate(obj.deadline)}
                          {(() => {
                            const timeInfo = getTimeProgress(obj.createdAt, obj.deadline);
                            if (timeInfo) {
                              if (timeInfo.isOverdue) {
                                return (
                                  <span style={{ 
                                    color: "#e53935", 
                                    fontWeight: "bold",
                                    background: "#ffcdd2",
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    fontSize: 12
                                  }}>
                                    🚨 VENCIDO hace {Math.abs(timeInfo.daysLeft)} día{Math.abs(timeInfo.daysLeft) !== 1 ? 's' : ''}
                                  </span>
                                );
                              } else if (timeInfo.daysLeft === 0) {
                                return (
                                  <span style={{ 
                                    color: "#e53935", 
                                    fontWeight: "bold",
                                    background: "#ffcdd2",
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    fontSize: 12,
                                    animation: "blink 1s infinite"
                                  }}>
                                    🔥 ¡HOY VENCE!
                                  </span>
                                );
                              } else if (timeInfo.daysLeft === 1) {
                                return (
                                  <span style={{ 
                                    color: "#ff6f00", 
                                    fontWeight: "bold",
                                    background: "#ffe0cc",
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    fontSize: 12
                                  }}>
                                    ⚡ Vence MAÑANA
                                  </span>
                                );
                              } else if (timeInfo.daysLeft <= 3) {
                                return (
                                  <span style={{ 
                                    color: "#f57c00", 
                                    fontWeight: "bold",
                                    background: "#fff3e0",
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    fontSize: 12
                                  }}>
                                    ⚠️ {timeInfo.daysLeft} días restantes
                                  </span>
                                );
                              } else if (timeInfo.daysLeft <= 7) {
                                return (
                                  <span style={{ 
                                    color: "#f9a825", 
                                    fontWeight: "600",
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    fontSize: 12
                                  }}>
                                    📍 {timeInfo.daysLeft} días restantes
                                  </span>
                                );
                              } else {
                                return (
                                  <span style={{ 
                                    color: "#43a047", 
                                    fontWeight: "600",
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    fontSize: 12
                                  }}>
                                    ✅ {timeInfo.daysLeft} días restantes
                                  </span>
                                );
                              }
                            }
                            return null;
                          })()}
                        </div>
                        
                        {/* Barra de progreso de tiempo */}
                        {(() => {
                          const timeInfo = getTimeProgress(obj.createdAt, obj.deadline);
                          if (timeInfo) {
                            return (
                              <div style={{ marginTop: 6 }}>
                                <div style={{ 
                                  fontSize: 12, 
                                  color: "#888", 
                                  marginBottom: 2,
                                  display: "flex",
                                  justifyContent: "space-between"
                                }}>
                                  <span>Progreso de tiempo</span>
                                  <span>{timeInfo.progress.toFixed(0)}%</span>
                                </div>
                                <div style={{ 
                                  background: "#f0f0f0", 
                                  borderRadius: 4, 
                                  height: 4, 
                                  width: "100%" 
                                }}>
                                  <div style={{
                                    width: `${Math.min(100, timeInfo.progress)}%`,
                                    background: timeInfo.isOverdue ? "#e53935" : 
                                              timeInfo.daysLeft <= 1 ? "#ff9800" :
                                              timeInfo.daysLeft <= 3 ? "#ffc107" : "#43a047",
                                    height: "100%",
                                    borderRadius: 4,
                                    transition: "width 0.3s"
                                  }} />
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Mostrar fecha límite sin indicadores si está completado */}
                    {obj.deadline && getProgress(obj.milestones) >= 100 && (
                      <div style={{ 
                        fontSize: 14, 
                        color: "#666",
                        padding: 8,
                        borderRadius: 6,
                        background: "#e8f5e8",
                        border: "1px solid #43a047"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <strong>📅 Fecha límite:</strong> {formatDate(obj.deadline)}
                          <span style={{ 
                            color: "#43a047", 
                            fontWeight: "bold",
                            background: "#c8e6c9",
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: 12
                          }}>
                            🎉 ¡COMPLETADO!
                          </span>
                        </div>
                      </div>
                    )}
                    
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
                    {/* Bloque de comentarios */}
                    <div style={{ marginTop: 16, background: "#f0f4f8", borderRadius: 8, padding: 12 }}>
                      <strong>Comentarios:</strong>
                      <ul style={{ paddingLeft: 18 }}>
                        {(obj.comments || []).map((c, idx) => (
                          <li key={idx} style={{ marginBottom: 4, display: "flex", alignItems: "center" }}>
                            <span style={{ fontWeight: 600 }}>{c.user}:</span> {c.text}
                            <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>
                              {c.createdAt?.toDate?.().toLocaleString?.() || ""}
                            </span>
                            <button
                              onClick={() => handleDeleteComment(obj.id, c)}
                              style={{
                                marginLeft: 8,
                                color: "#e53935",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "bold"
                              }}
                              title="Eliminar comentario"
                            >
                              Eliminar
                            </button>
                          </li>
                        ))}
                      </ul>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          handleAddComment(obj.id);
                        }}
                        style={{ display: "flex", gap: 8, marginTop: 8 }}
                      >
                        <input
                          type="text"
                          placeholder="Añade un comentario..."
                          value={commentText[obj.id] || ""}
                          onChange={e => setCommentText({ ...commentText, [obj.id]: e.target.value })}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #bbb",
                            fontSize: 15,
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            background: "#1976d2",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "8px 16px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Comentar
                        </button>
                      </form>
                    </div>
                    {/* Fin bloque de comentarios */}
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