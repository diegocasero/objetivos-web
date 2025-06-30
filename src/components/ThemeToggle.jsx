import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      style={{
        background: "none",
        border: "none",
        color: theme === "light" ? "#1976d2" : "#ffd600",
        fontSize: 22,
        cursor: "pointer",
        marginLeft: 12,
      }}
      title="Cambiar tema"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;