import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "#e53935",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "10px 18px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: 16,
        boxShadow: "0 2px 8px #0002",
        transition: "background 0.2s",
        maxWidth: "100vw",
        width: "100%",
        minWidth: 120,
      }}
    >
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;