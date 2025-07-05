import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import MainContainer from "../components/MainContainer";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    
    try {
      // 1. Crear usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Guardar en Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
        emailVerified: false
      });
      
      // 3. 📧 ENVIAR EMAIL DE VERIFICACIÓN
      await sendEmailVerification(user, {
        url: window.location.origin + '/login', // URL de retorno
        handleCodeInApp: false
      });
      
      // 4. Mostrar mensaje de éxito
      setSuccess(
        `🎉 ¡Registro exitoso!\n\n📧 Te hemos enviado un email de verificación a:\n${email}\n\n✅ Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.`
      );
      
      // 5. Cerrar sesión hasta que verifique
      await auth.signOut();
      
      console.log("✅ Usuario registrado, email de verificación enviado");
      
    } catch (err) {
      console.error("Error en registro:", err);
      setError(getErrorMessage(err.code));
    }
    setLoading(false);
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este email ya está registrado.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/invalid-email':
        return 'Email inválido.';
      default:
        return 'Error al registrar usuario.';
    }
  };

  return (
    <MainContainer>
      {/* Logo igual que en Login */}
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <h2 style={{ 
          textAlign: "center", 
          color: "#1976d2", 
          marginBottom: 8, 
          fontWeight: 800, 
          letterSpacing: 1 
        }}>
          Crear Cuenta
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
        
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          <div style={{ 
            color: "#e53935", 
            textAlign: "center", 
            fontWeight: "bold",
            background: "#ffebee",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ffcdd2"
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            color: "#2e7d32", 
            textAlign: "center", 
            fontWeight: "bold",
            background: "#e8f5e8",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #c8e6c9",
            whiteSpace: "pre-line",
            fontSize: 14
          }}>
            {success}
          </div>
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
          }}
        >
          {loading ? "Registrando..." : "Crear Cuenta"}
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

      <style jsx>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </MainContainer>
  );
};

export default Register;