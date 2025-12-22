BEGIN TRANSACTION;
CREATE TABLE anio_academico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anio INTEGER NOT NULL UNIQUE
);
INSERT INTO "anio_academico" VALUES(1,2025);
CREATE TABLE asignatura (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);
INSERT INTO "asignatura" VALUES(1,'Ética');
INSERT INTO "asignatura" VALUES(2,'Geotecnia y Cimientos');
INSERT INTO "asignatura" VALUES(3,'Mecánica de Fluidos II');
INSERT INTO "asignatura" VALUES(4,'Métodos Numéricos');
INSERT INTO "asignatura" VALUES(5,'Tecnología del Concreto');
INSERT INTO "asignatura" VALUES(6,'Anatomía Humana');
INSERT INTO "asignatura" VALUES(7,'Biología Celular');
INSERT INTO "asignatura" VALUES(8,'Histología');
INSERT INTO "asignatura" VALUES(9,'Bioquímica');
INSERT INTO "asignatura" VALUES(10,'Fisiología');
CREATE TABLE carrera_universitaria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);
INSERT INTO "carrera_universitaria" VALUES(1,'Ingeniería Civil');
INSERT INTO "carrera_universitaria" VALUES(2,'Medicina Humana');
CREATE TABLE ciclo_academico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE 
);
INSERT INTO "ciclo_academico" VALUES(1,'II');
CREATE TABLE ciclo_curricular (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,      
    orden INTEGER NOT NULL,    
    UNIQUE (nombre, orden)
);
INSERT INTO "ciclo_curricular" VALUES(1,'V',5);
INSERT INTO "ciclo_curricular" VALUES(2,'I',1);
INSERT INTO "ciclo_curricular" VALUES(3,'II',2);
INSERT INTO "ciclo_curricular" VALUES(4,'III',3);
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
INSERT INTO "detalle_asignatura_ciclo" VALUES(1,1,1);
INSERT INTO "detalle_asignatura_ciclo" VALUES(2,1,2);
INSERT INTO "detalle_asignatura_ciclo" VALUES(3,1,3);
INSERT INTO "detalle_asignatura_ciclo" VALUES(4,1,4);
INSERT INTO "detalle_asignatura_ciclo" VALUES(5,1,5);
INSERT INTO "detalle_asignatura_ciclo" VALUES(6,3,6);
INSERT INTO "detalle_asignatura_ciclo" VALUES(7,3,7);
INSERT INTO "detalle_asignatura_ciclo" VALUES(8,4,9);
INSERT INTO "detalle_asignatura_ciclo" VALUES(9,4,8);
INSERT INTO "detalle_asignatura_ciclo" VALUES(10,5,10);
CREATE TABLE detalle_ciclo_academico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anio_academico_id INTEGER NOT NULL,
    ciclo_academico_id INTEGER NOT NULL,
    UNIQUE (anio_academico_id, ciclo_academico_id),
    FOREIGN KEY (anio_academico_id) REFERENCES anio_academico(id),
    FOREIGN KEY (ciclo_academico_id) REFERENCES ciclo_academico(id)
);
INSERT INTO "detalle_ciclo_academico" VALUES(1,1,1);
CREATE TABLE detalle_ciclo_carrera (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    detalle_ciclo_academico_id INTEGER NOT NULL,
    carrera_universitaria_id INTEGER NOT NULL,
    UNIQUE (detalle_ciclo_academico_id, carrera_universitaria_id),
    FOREIGN KEY (detalle_ciclo_academico_id) REFERENCES detalle_ciclo_academico(id),
    FOREIGN KEY (carrera_universitaria_id) REFERENCES carrera_universitaria(id)
);
INSERT INTO "detalle_ciclo_carrera" VALUES(1,1,1);
INSERT INTO "detalle_ciclo_carrera" VALUES(2,1,2);
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
INSERT INTO "detalle_ciclo_carrera_ciclo" VALUES(1,1,1);
INSERT INTO "detalle_ciclo_carrera_ciclo" VALUES(2,2,1);
INSERT INTO "detalle_ciclo_carrera_ciclo" VALUES(3,2,2);
INSERT INTO "detalle_ciclo_carrera_ciclo" VALUES(4,2,3);
INSERT INTO "detalle_ciclo_carrera_ciclo" VALUES(5,2,4);
CREATE TABLE docentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);
INSERT INTO "docentes" VALUES(1,'Estela Salazar, Nancy Emilia');
INSERT INTO "docentes" VALUES(2,'Jara Cotrina, Araceli');
INSERT INTO "docentes" VALUES(3,'Villalobos Peña, Raquel Viviana');
INSERT INTO "docentes" VALUES(4,'Mera Rodas, Armando');
INSERT INTO "docentes" VALUES(5,'Bravo Diaz, Cesar Eduardo');
INSERT INTO "docentes" VALUES(6,'Torres Rubio, Miguel Angel');
INSERT INTO "docentes" VALUES(7,'Zamora Nevado, Roberto Martin');
INSERT INTO "docentes" VALUES(8,'Tejada Espinoza, Hebert Enrique');
INSERT INTO "docentes" VALUES(9,'Zelada Zamora, Wilmer Moises');
INSERT INTO "docentes" VALUES(10,'Sanchez Goycochea, Nestor Abel');
INSERT INTO "docentes" VALUES(11,'Cachay Lazo, Cesar Eduardo');
INSERT INTO "docentes" VALUES(12,'Gamarra Uceda, Hector Augusto');
INSERT INTO "docentes" VALUES(13,'Martinez Fiestas, Mario Antonio');
INSERT INTO "docentes" VALUES(14,'Dr. Pérez Gómez, Luis');
INSERT INTO "docentes" VALUES(15,'Dra. Ramírez Torres, Ana');
INSERT INTO "docentes" VALUES(16,'Dr. Vásquez León, Carlos');
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
INSERT INTO "grupo_horario" VALUES(1,'A',1,1,'MARTES','07:00','10:00');
INSERT INTO "grupo_horario" VALUES(2,'B',1,1,'LUNES','10:00','13:00');
INSERT INTO "grupo_horario" VALUES(3,'C',1,2,'LUNES','07:00','10:00');
INSERT INTO "grupo_horario" VALUES(4,'D',1,3,'JUEVES','10:00','13:00');
INSERT INTO "grupo_horario" VALUES(5,'A',2,7,'LUNES','10:00','13:00');
INSERT INTO "grupo_horario" VALUES(6,'B',2,7,'VIERNES','07:00','10:00');
INSERT INTO "grupo_horario" VALUES(7,'A',3,8,'MARTES','19:00','22:00');
INSERT INTO "grupo_horario" VALUES(8,'B',3,8,'JUEVES','19:00','22:00');
INSERT INTO "grupo_horario" VALUES(9,'A',4,10,'MIÉRCOLES','07:00','10:00');
INSERT INTO "grupo_horario" VALUES(10,'B',4,10,'MARTES','10:00','13:00');
INSERT INTO "grupo_horario" VALUES(11,'A',5,11,'MIÉRCOLES','11:00','14:00');
INSERT INTO "grupo_horario" VALUES(12,'B',5,12,'MIÉRCOLES','07:00','10:00');
INSERT INTO "grupo_horario" VALUES(13,'A',6,14,'LUNES','08:00','11:00');
CREATE TABLE usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
INSERT INTO "usuarios" VALUES(1,'Jhona','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
INSERT INTO "usuarios" VALUES(2,'Samuel','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
CREATE VIEW vista_ciclos_por_carrera AS
SELECT
    dccc.id AS detalle_ciclo_carrera_ciclo_id,
    dcc.id AS detalle_ciclo_carrera_id,
    cu.id AS carrera_id,
    cu.nombre AS carrera,
    cc.id AS ciclo_curricular_id,
    cc.nombre AS ciclo,
    cc.orden
FROM detalle_ciclo_carrera_ciclo dccc
JOIN detalle_ciclo_carrera dcc
    ON dccc.detalle_ciclo_carrera_id = dcc.id
JOIN carrera_universitaria cu
    ON dcc.carrera_universitaria_id = cu.id
JOIN ciclo_curricular cc
    ON dccc.ciclo_curricular_id = cc.id
ORDER BY cu.nombre, cc.orden;
CREATE VIEW vista_horarios AS
SELECT
    aa.anio,
    ca.nombre AS ciclo_academico,
    cu.nombre AS carrera,
    cc.nombre AS ciclo_curricular,
    a.nombre AS asignatura,
    gh.grupo,
    gh.dia,
    gh.hora_inicio,
    gh.hora_fin,
    d.nombre AS docente
FROM grupo_horario gh
JOIN detalle_asignatura_ciclo dac
    ON gh.detalle_asignatura_ciclo_id = dac.id
JOIN detalle_ciclo_carrera_ciclo dccc
    ON dac.detalle_ciclo_carrera_ciclo_id = dccc.id
JOIN ciclo_curricular cc
    ON dccc.ciclo_curricular_id = cc.id
JOIN detalle_ciclo_carrera dcc
    ON dccc.detalle_ciclo_carrera_id = dcc.id
JOIN carrera_universitaria cu
    ON dcc.carrera_universitaria_id = cu.id
JOIN detalle_ciclo_academico dca
    ON dcc.detalle_ciclo_academico_id = dca.id
JOIN anio_academico aa
    ON dca.anio_academico_id = aa.id
JOIN ciclo_academico ca
    ON dca.ciclo_academico_id = ca.id
JOIN asignatura a
    ON dac.asignatura_id = a.id
JOIN docentes d
    ON gh.docente_id = d.id
ORDER BY aa.anio, ca.nombre, cu.nombre, cc.orden, a.nombre;
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
DELETE FROM "sqlite_sequence";
INSERT INTO "sqlite_sequence" VALUES('anio_academico',2);
INSERT INTO "sqlite_sequence" VALUES('ciclo_academico',2);
INSERT INTO "sqlite_sequence" VALUES('detalle_ciclo_academico',2);
INSERT INTO "sqlite_sequence" VALUES('carrera_universitaria',2);
INSERT INTO "sqlite_sequence" VALUES('detalle_ciclo_carrera',2);
INSERT INTO "sqlite_sequence" VALUES('ciclo_curricular',4);
INSERT INTO "sqlite_sequence" VALUES('detalle_ciclo_carrera_ciclo',5);
INSERT INTO "sqlite_sequence" VALUES('asignatura',10);
INSERT INTO "sqlite_sequence" VALUES('detalle_asignatura_ciclo',10);
INSERT INTO "sqlite_sequence" VALUES('docentes',16);
INSERT INTO "sqlite_sequence" VALUES('grupo_horario',13);
COMMIT;
