DROP VIEW IF EXISTS vista_anios_academicos;
DROP VIEW IF EXISTS vista_ciclos_academicos;
DROP VIEW IF EXISTS vista_carreras_por_ciclo;
DROP VIEW IF EXISTS vista_ciclos_curriculares;
DROP VIEW IF EXISTS vista_asignaturas;
DROP VIEW IF EXISTS vista_grupos_horarios;
CREATE VIEW vista_anios_academicos AS
SELECT id, anio
FROM anio_academico;

CREATE VIEW vista_ciclos_academicos AS
SELECT
    dca.id AS detalle_ciclo_academico_id,
    aa.anio,
    ca.nombre AS ciclo
FROM detalle_ciclo_academico dca
JOIN anio_academico aa ON aa.id = dca.anio_academico_id
JOIN ciclo_academico ca ON ca.id = dca.ciclo_academico_id;

CREATE VIEW vista_carreras_por_ciclo AS
SELECT
    dcc.id AS detalle_ciclo_carrera_id,
    dcc.detalle_ciclo_academico_id,
    cu.nombre AS carrera
FROM detalle_ciclo_carrera dcc
JOIN carrera_universitaria cu ON cu.id = dcc.carrera_universitaria_id;

CREATE VIEW vista_ciclos_curriculares AS
SELECT
    dccc.id AS detalle_ciclo_carrera_ciclo_id,
    dccc.detalle_ciclo_carrera_id,
    cc.nombre,
    cc.orden
FROM detalle_ciclo_carrera_ciclo dccc
JOIN ciclo_curricular cc ON cc.id = dccc.ciclo_curricular_id;

CREATE VIEW vista_asignaturas AS
SELECT
    dac.id AS detalle_asignatura_ciclo_id,
    dac.detalle_ciclo_carrera_ciclo_id,
    a.nombre
FROM detalle_asignatura_ciclo dac
JOIN asignatura a ON a.id = dac.asignatura_id;

CREATE VIEW vista_grupos_horarios AS
SELECT
    gh.detalle_asignatura_ciclo_id,
    gh.grupo,
    gh.dia,
    gh.hora_inicio,
    gh.hora_fin,
    d.nombre AS docente
FROM grupo_horario gh
JOIN docentes d ON d.id = gh.docente_id;
