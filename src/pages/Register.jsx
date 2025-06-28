import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import MainContainer from "../components/MainContainer";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // Guardar usuario en Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        email,
        createdAt: new Date()
      });
      navigate("/dashboard");
    } catch (err) {
      setError("No se pudo registrar el usuario. " + (err.message || ""));
    }
    setLoading(false);
  };

  return (
    <MainContainer>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <h2 style={{ textAlign: "center", color: "#1976d2", marginBottom: 8, fontWeight: 800, letterSpacing: 1 }}>Registro</h2>
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          type="password"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
        {error && (
          <div style={{ color: "#e53935", textAlign: "center", fontWeight: "bold" }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 0",
            borderRadius: 8,
            border: "none",
            background: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8,
            opacity: loading ? 0.7 : 1,
            transition: "background 0.2s",
            width: "100%",
          }}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            background: "none",
            border: "none",
            color: "#1976d2",
            cursor: "pointer",
            textDecoration: "underline",
            marginTop: 8,
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </form>
    </MainContainer>
  );
};

export default Register;