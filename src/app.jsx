import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [user, setUser] = useState(undefined); // undefined: cargando

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, color: "#1976d2" }}>Cargando...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to={user.email === "conquistalogros@gmail.com" ? "/admin" : "/dashboard"} />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin"
        element={user && user.email === "conquistalogros@gmail.com" ? <Admin /> : <Navigate to="/login" />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? (user.email === "conquistalogros@gmail.com" ? "/admin" : "/dashboard") : "/login"} />}
      />
    </Routes>
  );
}

export default App;