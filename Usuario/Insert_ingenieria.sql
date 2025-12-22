BEGIN TRANSACTION;

-- =========================
-- 1. LIMPIEZA TOTAL
-- =========================
DELETE FROM grupo_horario;
DELETE FROM detalle_asignatura_ciclo;
DELETE FROM detalle_ciclo_carrera_ciclo;
DELETE FROM detalle_ciclo_carrera;
DELETE FROM detalle_ciclo_academico;
DELETE FROM asignatura;
DELETE FROM docentes;
DELETE FROM carrera_universitaria;
DELETE FROM ciclo_curricular;
DELETE FROM ciclo_academico;
DELETE FROM anio_academico;

DELETE FROM sqlite_sequence;

-- =========================
-- 2. AÑO Y CICLO ACADÉMICO
-- =========================
INSERT INTO anio_academico (anio) VALUES (2025);
INSERT INTO ciclo_academico (nombre) VALUES ('II');

INSERT INTO detalle_ciclo_academico (anio_academico_id, ciclo_academico_id)
VALUES (
    (SELECT id FROM anio_academico WHERE anio = 2025),
    (SELECT id FROM ciclo_academico WHERE nombre = 'II')
);

-- =========================
-- 3. CARRERA
-- =========================
INSERT INTO carrera_universitaria (nombre)
VALUES ('Ingeniería Civil');

INSERT INTO detalle_ciclo_carrera (detalle_ciclo_academico_id, carrera_universitaria_id)
VALUES (
    (SELECT id FROM detalle_ciclo_academico),
    (SELECT id FROM carrera_universitaria WHERE nombre = 'Ingeniería Civil')
);

-- =========================
-- 4. CICLO CURRICULAR
-- =========================
INSERT INTO ciclo_curricular (nombre, orden) VALUES ('V',5);

INSERT INTO detalle_ciclo_carrera_ciclo (detalle_ciclo_carrera_id, ciclo_curricular_id)
VALUES (
    (SELECT id FROM detalle_ciclo_carrera),
    (SELECT id FROM ciclo_curricular WHERE nombre='V')
);

-- =========================
-- 5. ASIGNATURAS
-- =========================
INSERT INTO asignatura (nombre) VALUES
('Ética'),
('Geotecnia y Cimientos'),
('Mecánica de Fluidos II'),
('Métodos Numéricos'),
('Tecnología del Concreto');

INSERT INTO detalle_asignatura_ciclo (detalle_ciclo_carrera_ciclo_id, asignatura_id)
SELECT
    (SELECT id FROM detalle_ciclo_carrera_ciclo),
    id
FROM asignatura;

-- =========================
-- 6. DOCENTES
-- =========================
INSERT INTO docentes (nombre) VALUES
('Estela Salazar, Nancy Emilia'),
('Jara Cotrina, Araceli'),
('Villalobos Peña, Raquel Viviana'),
('Mera Rodas, Armando'),
('Bravo Diaz, Cesar Eduardo'),
('Torres Rubio, Miguel Angel'),
('Zamora Nevado, Roberto Martin'),
('Tejada Espinoza, Hebert Enrique'),
('Zelada Zamora, Wilmer Moises'),
('Sanchez Goycochea, Nestor Abel'),
('Cachay Lazo, Cesar Eduardo'),
('Gamarra Uceda, Hector Augusto'),
('Martinez Fiestas, Mario Antonio');

-- =========================
-- 7. HORARIOS (NORMALIZADOS)
-- =========================
INSERT INTO grupo_horario
(grupo, detalle_asignatura_ciclo_id, docente_id, dia, hora_inicio, hora_fin)
VALUES
-- ETICA
('A',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Ética'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Estela Salazar%'),'MARTES','07:00','10:00'),

('B',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Ética'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Estela Salazar%'),'LUNES','10:00','13:00'),

('C',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Ética'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Jara Cotrina%'),'LUNES','07:00','10:00'),

('D',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Ética'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Villalobos%'),'JUEVES','10:00','13:00'),

-- GEOTECNIA
('A',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Geotecnia y Cimientos'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Zamora%'),'LUNES','10:00','13:00'),

('B',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Geotecnia y Cimientos'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Zamora%'),'VIERNES','07:00','10:00'),

-- MECÁNICA DE FLUIDOS II
('A',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Mecánica de Fluidos II'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Tejada%'),'MARTES','19:00','22:00'),

('B',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Mecánica de Fluidos II'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Tejada%'),'JUEVES','19:00','22:00'),

-- MÉTODOS NUMÉRICOS
('A',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Métodos Numéricos'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Sanchez%'),'MIÉRCOLES','07:00','10:00'),

('B',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Métodos Numéricos'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Sanchez%'),'MARTES','10:00','13:00'),

-- TECNOLOGÍA DEL CONCRETO
('A',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Tecnología del Concreto'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Cachay%'),'MIÉRCOLES','11:00','14:00'),

('B',(SELECT dac.id FROM detalle_asignatura_ciclo dac JOIN asignatura a ON a.id=dac.asignatura_id WHERE a.nombre='Tecnología del Concreto'),
 (SELECT id FROM docentes WHERE nombre LIKE 'Gamarra%'),'MIÉRCOLES','07:00','10:00');

COMMIT;
