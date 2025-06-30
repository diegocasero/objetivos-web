import { useState, useCallback } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, arrayUnion } from "firebase/firestore";

export function useObjectives(uid = null) {
  const [objectives, setObjectives] = useState([]);

  const fetchObjectives = useCallback(async () => {
    const q = uid
      ? query(collection(db, "objectives"), where("uid", "==", uid))
      : collection(db, "objectives");
    const querySnapshot = await getDocs(q);
    const objs = [];
    querySnapshot.forEach((docu) => {
      objs.push({ id: docu.id, ...docu.data() });
    });
    setObjectives(objs);
  }, [uid]);

  const addObjective = async (data) => {
    await addDoc(collection(db, "objectives"), {
      ...data,
      comments: [] // <-- añade esto
    });
    fetchObjectives();
  };

  const updateObjective = async (id, data) => {
    await updateDoc(doc(db, "objectives", id), data);
    fetchObjectives();
  };

  const deleteObjective = async (id) => {
    await deleteDoc(doc(db, "objectives", id));
    fetchObjectives();
  };

  const addComment = async (objectiveId, comment) => {
    const ref = doc(db, "objectives", objectiveId);
    await updateDoc(ref, {
      comments: arrayUnion(comment)
    });
  };

  return {
    objectives,
    fetchObjectives,
    addObjective,
    updateObjective,
    deleteObjective,
    setObjectives,
    addComment
  };
}