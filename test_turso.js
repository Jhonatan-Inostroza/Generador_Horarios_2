import { createClient } from "@libsql/client";

const db = createClient({
  url: "libsql://usuarios-jhonatan-inostroza.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3Njg1MTA5NTIsImlhdCI6MTc2NzkwNjE1MiwiaWQiOiIwZGVlNWI4OC0wYWI2LTRjNTktODFjNi1iMmU2MWE0MDhhMjkiLCJyaWQiOiIyOWNiZjE2ZS0yNGVjLTQ5YmQtODk2Yy0wMjVmNDQyNGQxNjEifQ.PsNWJrlir3VqzFFiozdVCc2o4rKNA8Ya5Bhe0nnmgHqId9ottLaBRYMun-SNO_GvtwhvNCM3CQIRnyEBuWhtAQ",
});

async function main() {
  try {
    const result = await db.execute("SELECT * FROM Vista_Perfil_Usuario ");
    console.log("✅ Datos:", result.rows);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    db.close();
  }
}

main();
