// C:\Users\Jhonatan Inostroza\Desktop\Proyectos\Generar_Horarios\bridge_db.js
import express from "express";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();
const app = express();
// app.use(express.json());
// REEMPLAZA LA LÍNEA app.use(express.json()); POR ESTA:
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Configura aquí tus credenciales de Turso
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

app.post("/query", async (req, res) => {
  try {
    const { sql, params } = req.body;
    console.log(`Executing SQL: ${sql}`);
    const result = await db.execute({ sql, args: params || [] });
    
    // Enviamos las filas (rows) que Turso devuelve como objetos
    res.json({ success: true, rows: result.rows });
  } catch (error) {
    console.error("Database Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Puente Node-Turso listo en http://localhost:${PORT}`);
});