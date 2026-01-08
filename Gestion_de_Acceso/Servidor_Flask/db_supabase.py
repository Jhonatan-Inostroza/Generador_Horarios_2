import psycopg2
import os

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_AU21yjOkSomN@ep-lingering-tree-acxetrvz-pooler.sa-east-1.aws.neon.tech/gestion_horarios?sslmode=require"
)

def get_connection():
    return psycopg2.connect(DATABASE_URL)