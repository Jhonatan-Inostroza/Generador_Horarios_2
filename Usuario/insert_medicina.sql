BEGIN TRANSACTION;

--------------------------------------------------
-- 1. AÑO Y CICLO ACADÉMICO
--------------------------------------------------
INSERT OR IGNORE INTO anio_academico (anio) VALUES (2025);
INSERT OR IGNORE INTO ciclo_academico (nombre) VALUES ('II');

--------------------------------------------------
-- 2. CARRERA
--------------------------------------------------
INSERT OR IGNORE INTO carrera_universitaria (nombre)
VALUES ('Medicina Humana');

--------------------------------------------------
-- 3. DETALLE CICLO ACADÉMICO
--------------------------------------------------
INSERT OR IGNORE INTO detalle_ciclo_academico
(anio_academico_id, ciclo_academico_id)
SELECT aa.id, ca.id
FROM anio_academico aa, ciclo_academico ca
WHERE aa.anio = 2025 AND ca.nombre = 'II';

--------------------------------------------------
-- 4. CICLO ACADÉMICO ↔ CARRERA
--------------------------------------------------
INSERT OR IGNORE INTO detalle_ciclo_carrera
(detalle_ciclo_academico_id, carrera_universitaria_id)
SELECT dca.id, cu.id
FROM detalle_ciclo_academico dca, carrera_universitaria cu
WHERE cu.nombre = 'Medicina Humana';

--------------------------------------------------
-- 5. CICLOS CURRICULARES
--------------------------------------------------
INSERT OR IGNORE INTO ciclo_curricular (nombre, orden) VALUES
('I',1), ('II',2), ('III',3);

--------------------------------------------------
-- 6. CARRERA ↔ CICLOS CURRICULARES
--------------------------------------------------
INSERT OR IGNORE INTO detalle_ciclo_carrera_ciclo
(detalle_ciclo_carrera_id, ciclo_curricular_id)
SELECT dcc.id, cc.id
FROM detalle_ciclo_carrera dcc
JOIN ciclo_curricular cc
WHERE dcc.carrera_universitaria_id =
      (SELECT id FROM carrera_universitaria WHERE nombre='Medicina Humana');

--------------------------------------------------
-- 7. ASIGNATURAS (MEDICINA REAL)
--------------------------------------------------
INSERT OR IGNORE INTO asignatura (nombre) VALUES
('Anatomía Humana'),
('Biología Celular'),
('Histología'),
('Bioquímica'),
('Fisiología');

--------------------------------------------------
-- 8. ASIGNATURAS ↔ CICLOS
--------------------------------------------------
INSERT OR IGNORE INTO detalle_asignatura_ciclo
(detalle_ciclo_carrera_ciclo_id, asignatura_id)
SELECT dccc.id, a.id
FROM detalle_ciclo_carrera_ciclo dccc
JOIN detalle_ciclo_carrera dcc ON dcc.id = dccc.detalle_ciclo_carrera_id
JOIN ciclo_curricular cc ON cc.id = dccc.ciclo_curricular_id
JOIN asignatura a
WHERE dcc.carrera_universitaria_id =
      (SELECT id FROM carrera_universitaria WHERE nombre='Medicina Humana')
AND (
    (cc.nombre = 'I' AND a.nombre IN ('Anatomía Humana','Biología Celular'))
 OR (cc.nombre = 'II' AND a.nombre IN ('Histología','Bioquímica'))
 OR (cc.nombre = 'III' AND a.nombre IN ('Fisiología'))
);

--------------------------------------------------
-- 9. DOCENTES
--------------------------------------------------
INSERT OR IGNORE INTO docentes (nombre) VALUES
('Dr. Pérez Gómez, Luis'),
('Dra. Ramírez Torres, Ana'),
('Dr. Vásquez León, Carlos');

--------------------------------------------------
-- 10. HORARIOS (100% VÁLIDOS)
--------------------------------------------------
INSERT INTO grupo_horario
(grupo, detalle_asignatura_ciclo_id, docente_id, dia, hora_inicio, hora_fin)
SELECT
    'A',
    dac.id,
    d.id,
    'LUNES',
    '08:00',
    '11:00'
FROM detalle_asignatura_ciclo dac
JOIN asignatura a ON a.id = dac.asignatura_id
JOIN detalle_ciclo_carrera_ciclo dccc ON dccc.id = dac.detalle_ciclo_carrera_ciclo_id
JOIN detalle_ciclo_carrera dcc ON dcc.id = dccc.detalle_ciclo_carrera_id
JOIN docentes d ON d.nombre = 'Dr. Pérez Gómez, Luis'
WHERE a.nombre = 'Anatomía Humana'
AND dcc.carrera_universitaria_id =
    (SELECT id FROM carrera_universitaria WHERE nombre='Medicina Humana');

COMMIT;
