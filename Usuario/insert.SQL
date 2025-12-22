INSERT INTO anio_academico (id, anio) VALUES
(1, 2024),
(2, 2025);

INSERT INTO ciclo_academico (id, nombre) VALUES
(1, 'I'),
(2, 'II');

INSERT INTO detalle_ciclo_academico (id, anio_academico_id, ciclo_academico_id) VALUES
(1, 1, 1), -- 2024-I
(2, 1, 2), -- 2024-II
(3, 2, 1); -- 2025-I

INSERT INTO carrera_universitaria (id, nombre) VALUES
(1, 'Medicina Humana'),
(2, 'Ingeniería de Sistemas');

INSERT INTO detalle_ciclo_carrera (id, detalle_ciclo_academico_id, carrera_universitaria_id) VALUES
(1, 1, 1), -- Medicina 2024-I
(2, 1, 2), -- Ingeniería 2024-I
(3, 2, 1); -- Medicina 2024-II

INSERT INTO ciclo_curricular (id, nombre, orden) VALUES
(1, 'I', 1),
(2, 'II', 2),
(3, 'III', 3),
(4, 'IV', 4),
(5, 'V', 5),
(6, 'VI', 6);

INSERT INTO detalle_ciclo_carrera_ciclo
(id, detalle_ciclo_carrera_id, ciclo_curricular_id) VALUES
-- Medicina 2024-I
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),

-- Ingeniería 2024-I
(4, 2, 1),
(5, 2, 2),

-- Medicina 2024-II
(6, 3, 4),
(7, 3, 5);

INSERT INTO asignatura (id, nombre) VALUES
(1, 'Anatomía'),
(2, 'Biología'),
(3, 'Programación I'),
(4, 'Estructuras de Datos');

INSERT INTO detalle_asignatura_ciclo
(id, detalle_ciclo_carrera_ciclo_id, asignatura_id) VALUES
(1, 1, 1), -- Anatomía - Medicina - Ciclo I
(2, 2, 2), -- Biología - Medicina - Ciclo II
(3, 4, 3), -- Programación I - Ingeniería - Ciclo I
(4, 5, 4); -- Estructuras - Ingeniería - Ciclo II

INSERT INTO docentes (id, nombre) VALUES
(1, 'Estela Salazar'),
(2, 'Roberto Zamora'),
(3, 'Araceli Jara');

INSERT INTO grupo_horario
(id, grupo, detalle_asignatura_ciclo_id, docente_id, dia, hora_inicio, hora_fin) VALUES
(1, 'A', 1, 1, 'LUNES',   '07:00', '10:00'),
(2, 'B', 2, 2, 'MARTES', '08:00', '11:00'),
(3, 'A', 3, 3, 'MIÉRCOLES', '10:00', '13:00'),
(4, 'B', 4, 1, 'JUEVES', '14:00', '17:00');

INSERT INTO usuarios (id, nombre, contrasena) VALUES
(1, 'Jhona', '123456');
