import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ProgressChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const snapshot = await getDocs(collection(db, 'objectives'));
      const userObjectives = snapshot.docs
        .map(doc => doc.data())
        .filter(obj => obj.uid === uid);

      const chartData = userObjectives.map(obj => ({
        name: obj.text,
        Progreso: obj.progress,
      }));

      setData(chartData);
    };

    fetchChartData();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Gráfica de Progreso</h2>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="Progreso" fill="#3b82f6" />
      </BarChart>
    </div>
  );
}
