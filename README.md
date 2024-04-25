# Movies API with Bun and Elysia

Puedes elegir entre diferentes formas de almacenar los datos.

### Bases de datos implementadas
* MySQL
* Archivo local JSON
* MongoDB

### Antes de empezar
Debes crear un archivo `.env` en la raíz del proyecto con el Puerto que deseas  y las configuraciones de las bases de datos que vayas a utilizar.

```bash
PORT
```

## Comandos

### Instalación
* Para instalar las dependencias:

```bash
bun install
```

### Ejecución
* Para ejecutar con archivo local JSON (por defecto):

```bash
bun run dev
```

```bash
bun run dev:local
```

* Para ejecutar con MySQL:

```bash
bun run dev:mysql
```

* Para ejecutar con MongoDB:

```bash
bun run dev:mongo
```

### Pruebas
Cada base de datos debe probarse por separado.

* Para probar la API con Archivo local JSON:

```bash
bun run test:local
```

* Para probar la API con MySQL:

```bash
bun run test:mysql
```

* Para probar la API con MongoDB:

```bash
bun run test:mongo
```

## Peticiones
Cambia el puerto de los ejemplos si es necesario.

[Métodos HTTP aceptados](./api.http)



## MySQL

### Creación de la base de datos

```sql
DROP SCHEMA IF EXISTS movies_db;
CREATE SCHEMA movies_db;
USE movies_db;

CREATE TABLE movie
(
    id       BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    title    VARCHAR(255)           NOT NULL,
    year     INT                    NOT NULL,
    director VARCHAR(255)           NOT NULL,
    duration INT                    NOT NULL,
    poster   TEXT,
    rate     DECIMAL(2, 1) UNSIGNED NOT NULL
);

CREATE TABLE genre
(
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE movie_genre
(
    movie_id BINARY(16) REFERENCES movie (id),
    genre_id INT REFERENCES genre (id),
    PRIMARY KEY (movie_id, genre_id)
);

INSERT INTO genre (name)
VALUES ('Action'),
       ('Adventure'),
       ('Animation'),
       ('Biography'),
       ('Comedy'),
       ('Crime'),
       ('Drama'),
       ('Family'),
       ('Fantasy'),
       ('History'),
       ('Horror'),
       ('Music'),
       ('Mystery'),
       ('Romance'),
       ('Sci-Fi'),
       ('Sport'),
       ('Thriller'),
       ('War'),
       ('Western');
```

### Conexión a MySQL
Para conectarse a MySQL, se debe crear o editar un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

```bash
MYSQL_HOST
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DATABASE
MYSQL_PORT
```

## MongoDB
### Creación de la base de datos
La base de datos se crea automáticamente al insertar los primeros documentos.

### Conexión a MongoDB
Para conectarse a MongoDB, se debe crear o editar el archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

```bash
MONGO_URI
MONGO_DB
```
