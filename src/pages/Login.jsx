import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import MainContainer from "../components/MainContainer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowResendButton(false);
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // VERIFICAR SI EL EMAIL ESTÁ CONFIRMADO
      if (!user.emailVerified) {
        setError(`📧 Debes verificar tu email antes de continuar.

Revisa tu bandeja de entrada y haz clic en el enlace de verificación.

¿No recibiste el email?`);
        setShowResendButton(true);
        await auth.signOut(); // Cerrar sesión
        setLoading(false);
        return;
      }
      
    } catch (err) {
      setError("Credenciales incorrectas.");
    }
    setLoading(false);
  };

  // Función para reenviar verificación
  const handleResendVerification = async () => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await auth.signOut();
      setError(`📧 Email de verificación reenviado a: ${email}

Revisa tu bandeja de entrada y carpeta de spam.`);
      setShowResendButton(false);
    } catch (err) {
      setError("Error reenviando verificación. Verifica tus credenciales.");
    }
    setLoading(false);
  };

  return (
    <MainContainer>
      {/* 🏆 LOGO CONQUISTALOGROS */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: 25,
        animation: "fadeInDown 0.8s ease-out"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          background: "linear-gradient(135deg, #1976d2, #1565c0)",
          padding: "16px 28px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(25, 118, 210, 0.3)",
          marginBottom: 8
        }}>
          <div style={{
            fontSize: 32,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          }}>
            🏆
          </div>
          <h1 style={{
            margin: 0,
            color: "#fff",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 2,
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            ConquistaLogros
          </h1>
        </div>
        <p style={{
          margin: 0,
          color: "#666",
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: 0.5
        }}>
          🎯 Alcanza tus objetivos, conquista tus sueños
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <h2 style={{ 
          textAlign: "center", 
          color: "#1976d2", 
          marginBottom: 8, 
          fontWeight: 800, 
          letterSpacing: 1 
        }}>
          Iniciar Sesión
        </h2>
        
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
        
        {/* MENSAJE DE ERROR MEJORADO */}
        {error && (
          <div style={{ 
            color: "#e53935", 
            textAlign: "center", 
            fontWeight: "bold",
            whiteSpace: "pre-line",
            background: "#ffebee",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ffcdd2",
            fontSize: 14,
            lineHeight: 1.5
          }}>
            {error}
          </div>
        )}

        {/* BOTÓN PARA REENVIAR VERIFICACIÓN */}
        {showResendButton && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading}
            style={{
              background: "#ff9800",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)"
            }}
          >
            {loading ? "📧 Enviando..." : "📧 Reenviar Verificación"}
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 0",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #1976d2, #1565c0)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8,
            opacity: loading ? 0.7 : 1,
            transition: "all 0.3s ease",
            width: "100%",
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
            transform: loading ? "none" : "translateY(0)",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(25, 118, 210, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.3)";
            }
          }}
        >
          {loading ? "🔄 Entrando..." : "🚀 Entrar"}
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
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => e.target.style.color = "#1565c0"}
          onMouseLeave={(e) => e.target.style.color = "#1976d2"}
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </form>

      {/* CSS de animación */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </MainContainer>
  );
};

export default Login;