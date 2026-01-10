import requests
import json

# URL base de tu DB (remplaza con tu dominio correcto)
base_url = "https://usuarios-jhonatan-inostroza.aws-us-east-1.turso.io"

# Endpoint correcto para consultas SQL
url = f"{base_url}/v2/pipeline"

auth_token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3Njg1MTA5NTIsImlhdCI6MTc2NzkwNjE1MiwiaWQiOiIwZGVlNWI4OC0wYWI2LTRjNTktODFjNi1iMmU2MWE0MDhhMjkiLCJyaWQiOiIyOWNiZjE2ZS0yNGVjLTQ5YmQtODk2Yy0wMjVmNDQyNGQxNjEifQ.PsNWJrlir3VqzFFiozdVCc2o4rKNA8Ya5Bhe0nnmgHqId9ottLaBRYMun-SNO_GvtwhvNCM3CQIRnyEBuWhtAQ"

# Armar la payload según el protocolo libSQL/Turso
payload = {
    "requests": [
        {
            "type": "execute",
            "stmt": {
                "sql": "SELECT * FROM Vista_Perfil_Usuario;"
            }
        },
        {
            "type": "close"
        }
    ]
}

headers = {
    "Authorization": f"Bearer {auth_token}",
    "Content-Type": "application/json"
}

try:
    resp = requests.post(url, headers=headers, json=payload)
    resp.raise_for_status()
    data = resp.json()

    # Extraer filas de la respuesta
    results = []
    for r in data.get("results", []):
        if r.get("response", {}).get("type") == "execute":
            # filas devueltas por la query
            results = r["response"]["result"].get("rows", [])
            break

    print("✅ Datos:", results)

except Exception as e:
    print("❌ Error:", e)
