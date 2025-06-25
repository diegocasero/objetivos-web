import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import MainContainer from "../components/MainContainer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
        <h2 style={{ textAlign: "center", color: "#1976d2", marginBottom: 8, fontWeight: 800, letterSpacing: 1 }}>Iniciar Sesión</h2>
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
          placeholder="Contraseña"
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
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/register")}
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
          ¿No tienes cuenta? Regístrate
        </button>
      </form>
    </MainContainer>
  );
};

export default Login;