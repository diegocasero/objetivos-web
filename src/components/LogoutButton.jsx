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
        borderRadius: 4,
        padding: "8px 16px",
        fontWeight: "bold",
        cursor: "pointer",
        margin: "16px 0"
      }}
    >
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;