# C:\Users\Jhonatan Inostroza\Desktop\Proyectos\Generar_Horarios\Gestion_de_Acceso\Conexion\CursorAdapter.py
class CursorAdapter:
    """
    Adapter universal que imita el comportamiento de sqlite3.Cursor
    pero funciona tanto para SQLite como para Turso (HTTP).
    """

    def __init__(self, rows, columns=None):
        self._rows = rows or []
        self.columns = columns or []

    def fetchone(self):
        return self._rows[0] if self._rows else None

    def fetchall(self):
        return self._rows
