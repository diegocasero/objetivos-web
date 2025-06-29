import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Busca el UID de un usuario dado su correo electrónico
export const getUidByEmail = async (email) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  return null;
};

// Obtiene un mapa de UID a email de todos los usuarios
export const getUsersMap = async () => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  const map = {};
  snapshot.forEach(doc => {
    map[doc.id] = doc.data().email;
  });
  return map;
};