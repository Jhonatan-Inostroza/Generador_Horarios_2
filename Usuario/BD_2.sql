PRAGMA foreign_keys = OFF;

-- =========================
-- ELIMINAR VISTAS (si existen)
-- =========================
DROP VIEW IF EXISTS vista_horarios;
DROP VIEW IF EXISTS vista_anios_academicos;
DROP VIEW IF EXISTS vista_ciclos_academicos;
DROP VIEW IF EXISTS vista_carreras_por_ciclo;
DROP VIEW IF EXISTS vista_ciclos_por_carrera;
DROP VIEW IF EXISTS vista_asignaturas;
DROP VIEW IF EXISTS vista_grupos_horarios;

-- =========================
-- ELIMINAR TABLAS
-- =========================
DROP TABLE IF EXISTS grupo_horario;
DROP TABLE IF EXISTS detalle_asignatura_ciclo;
DROP TABLE IF EXISTS detalle_ciclo_carrera_ciclo;
DROP TABLE IF EXISTS ciclo_curricular;
DROP TABLE IF EXISTS detalle_ciclo_carrera;
DROP TABLE IF EXISTS detalle_ciclo_academico;
DROP TABLE IF EXISTS docentes;
DROP TABLE IF EXISTS asignatura;
DROP TABLE IF EXISTS carrera_universitaria;
DROP TABLE IF EXISTS ciclo_academico;
DROP TABLE IF EXISTS anio_academico;
DROP TABLE IF EXISTS usuarios;

DELETE FROM sqlite_sequence;

PRAGMA foreign_keys = ON;

-- =========================
-- USUARIOS
-- =========================
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    contrasena TEXT NOT NULL
);

-- =========================
-- AÑO Y CICLO ACADÉMICO
-- =========================
CREATE TABLE anio_academico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anio INTEGER NOT NULL UNIQUE
);

CREATE TABLE ciclo_academico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE 
);

CREATE TABLE detalle_ciclo_academico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anio_academico_id INTEGER NOT NULL,
    ciclo_academico_id INTEGER NOT NULL,
    UNIQUE (anio_academico_id, ciclo_academico_id),
    FOREIGN KEY (anio_academico_id) REFERENCES anio_academico(id),
    FOREIGN KEY (ciclo_academico_id) REFERENCES ciclo_academico(id)
);

-- =========================
-- CARRERAS
-- =========================
CREATE TABLE carrera_universitaria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

-- Carrera en un ciclo académico
CREATE TABLE detalle_ciclo_carrera (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    detalle_ciclo_academico_id INTEGER NOT NULL,
    carrera_universitaria_id INTEGER NOT NULL,
    UNIQUE (detalle_ciclo_academico_id, carrera_universitaria_id),
    FOREIGN KEY (detalle_ciclo_academico_id) REFERENCES detalle_ciclo_academico(id),
    FOREIGN KEY (carrera_universitaria_id) REFERENCES carrera_universitaria(id)
);

-- =========================
-- CICLOS CURRICULARES
-- =========================
CREATE TABLE ciclo_curricular (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,      
    orden INTEGER NOT NULL,    
    UNIQUE (nombre, orden)
);

-- Relación M:N
CREATE TABLE detalle_ciclo_carrera_ciclo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    detalle_ciclo_carrera_id INTEGER NOT NULL,
    ciclo_curricular_id INTEGER NOT NULL,
    UNIQUE (detalle_ciclo_carrera_id, ciclo_curricular_id),
    FOREIGN KEY (detalle_ciclo_carrera_id)
        REFERENCES detalle_ciclo_carrera(id),
    FOREIGN KEY (ciclo_curricular_id)
        REFERENCES ciclo_curricular(id)
);

-- =========================
-- ASIGNATURAS
-- =========================
CREATE TABLE asignatura (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE detalle_asignatura_ciclo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    detalle_ciclo_carrera_ciclo_id INTEGER NOT NULL,
    asignatura_id INTEGER NOT NULL,
    UNIQUE (detalle_ciclo_carrera_ciclo_id, asignatura_id),
    FOREIGN KEY (detalle_ciclo_carrera_ciclo_id)
        REFERENCES detalle_ciclo_carrera_ciclo(id),
    FOREIGN KEY (asignatura_id)
        REFERENCES asignatura(id)
);

-- =========================
-- DOCENTES
-- =========================
CREATE TABLE docentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

-- =========================
-- GRUPOS HORARIOS
-- =========================
CREATE TABLE grupo_horario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grupo TEXT NOT NULL,
    detalle_asignatura_ciclo_id INTEGER NOT NULL,
    docente_id INTEGER NOT NULL,
    dia TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    FOREIGN KEY (detalle_asignatura_ciclo_id)
        REFERENCES detalle_asignatura_ciclo(id),
    FOREIGN KEY (docente_id)
        REFERENCES docentes(id)
);
