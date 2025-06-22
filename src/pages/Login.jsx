import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (email === "admin@demo.com") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Credenciales incorrectas.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(120deg, #1976d2 0%, #43a047 100%)"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 36,
          borderRadius: 12,
          boxShadow: "0 2px 16px #0002",
          minWidth: 320,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <h2 style={{ textAlign: "center", color: "#1976d2", marginBottom: 8 }}>Iniciar Sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
          required
        />
        {error && (
          <div style={{ color: "#e53935", textAlign: "center", fontWeight: "bold" }}>{error}</div>
        )}
        <button
          type="submit"
          style={{
            padding: "10px 0",
            borderRadius: 6,
            border: "none",
            background: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;