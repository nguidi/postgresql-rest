# PostgreSQL RESTful API

Esta herramienta permite la creación de una API REST de forma automática. Para su funcionamiento se requiere que la base de datos cumpla que los registros de sus tablas sean identificables mediante una única clave primaria, es decir, que exista una única columna por tabla que identifique a sus registros.

## RESTful

Es una arquitectura que define la manera en la que algunos estándares web, como HTTP y las URLs, deben de ser usadas. 

Su utilización se basa en el empleo de los métodos HTTP (GET, POST, PUT, DELETE) y la definición de URLs para identificar, obtener, editar, crear y eliminar recursos en el servidor. 

Este propone una serie de principios de diseño fundamentales que deben ser seguidos.

##### Métodos HTTP explícitos

REST establece una asociación uno-a-uno entre las operaciones de crear, leer, actualizar y borrar y los métodos HTTP.

| HTTP/REST  | CRUD      | SQL     | Acción     |
| ---------- | --------- | ------- | ---------- |
| POST       | Create    | INSERT  | Crear      |
| GET        | Retrieve  | SELECT  | Obtener    |
| PUT        | Update    | UPDATE  | Actualizar |
| DELETE     | Delete    | DELETE  | Borrar     |

Es decir, usaremos:

* POST para crear un recurso.
* GET para obtener uno o varios recursos.
* PUT para actualizar un recurso.
* DELETE para eliminar un recurso.

##### Información sin estados

La información asociada a una petición no debe trascender a la misma. El contexto o datos adicionales necesarios para resolver una petición deben de viajar en la misma, no pueden ser almacenadas en el servidor.

##### Identificación de los recursos

Todos los recursos accedidos mediante peticiones REST deben de tener una ID que los represente. De esta manera podemos especificar a que recurso hacemos referencia en la petición.

##### Representación de recursos

Todos los recursos tienen que poder ser representados de diferentes maneras, por ejemplo, XML, JSON, etc. El tipo de representación utilizada debe ser especificada en la cabecera de la petición.

## RESTful API

Supongamos que tenemos una base de datos SQL con la siguiente estructura

![Tablas de nuestra base de datos](https://raw.githubusercontent.com/nguidi/postgresql-rest/master/docs/dbtables.png "Tablas de nuestra base de datos")

Llamamos recurso a cada uno de los registros que componen nuestras tablas. El conjunto de recursos se lo conoce como colección.

En este caso, nuestra REST API para los usuarios tendrá la siguiente forma:

| METODO | URL                  | Acción                                   |
| ------ | -------------------- | ----------------------------------------------- |
| GET    | api/usuarios?page=n  | Obtiene todos los usuarios paginados de a 10    |
| GET    | api/usuarios/:id     | Obtiene el usuario con la id correspondiente    |
| POST   | api/usuarios         | Crea un nuevo usuario                           |
| PUT    | api/usuarios/:id     | Actualiza el usuario con la id correspondiente  |
| DELETE | api/usuarios/:id     | Borra el usuario con la id correspondiente      |

Mientras que para los artículos sera:

| METODO | URL                    | Acción                                              |
| ------ | ---------------------- | --------------------------------------------------- |
| GET    | api/articulos?page=n   | Obtiene todos los articulos paginados de a 10       |
| GET    | api/articulos/:codigo  | Obtiene el articulo con el codigo correspondiente   |
| POST   | api/articulos          | Crea un nuevo articulo                              |
| PUT    | api/articulos/:codigo  | Actualiza el articulo con el codigo correspondiente |
| DELETE | api/articulos/:codigo  | Borra el articulo con el codigo correspondiente     |

Con las consideraciones que las acciones de crear (POST) y actualizar (PUT) aceptan parámetros en el cuerpo de la petición y la acción de obtener una colección (GET) aceptan parámetros de paginación en la URL.

## Herramienta

#### Requerimientos

Para poder utilizar la herramienta es necesario contar con [NodeJS](https://nodejs.org/) instalado en su sistema. Una base de datos PostgreSQL y las credenciales necesarias para acceder a la misma.

#### Instalación

1. Descargar la herramienta (o clonarla).
2. Ingresar al directorio y utilizar el comando: 

 ```
 npm install
 ```
3. Modificar el archivo de configuración ```config.js``` de manera que se ajuste a los datos de conexión a su base de datos.

4. Iniciar la aplicacion utilizando el comando:

 ```
 npm start
 ```

5. Utilizar la API mediante alguna aplicación REST.

#### Como funciona

La herramienta toma los datos de conexion del archivo ```config.js```, se conecta a la base de datos y realiza la siguiente consulta para obtener el listado de columnas y su respectiva clave primaria:

```sql
SELECT	a.table_name AS name, b.column_name AS pkey 
FROM	information_schema.table_constraints a,
		information_schema.key_column_usage b
WHERE   a.constraint_type = 'PRIMARY KEY'
	AND b.table_name = a.table_name
	AND b.constraint_name = a.constraint_name
```

Dicha consulta realiza una asociación entre la tabla de restricciones y el tipo de restricción para determinar que columna es la clave primaria de cada tabla. Obtendremos un resultado similar al siguiente:

| name          | pkey   |
| ------------- | ------ |
| articulos     | codigo |
| usuarios      | id     |

El resultado es tomado y parseado por JavaScript obteniendo una colección de objetos en donde cada objeto tiene el nombre de la tabla y su clave primaria.

```javascript
[
	{
		name: 'articulos'
	,	pkey: 'codigo'
	}
,	{
		name: 'usuarios'
	,	pkey: 'id'
	}
]

```

Luego se itera sobre cada elemento de la coleccion tomando el nombre de la tabla (atributo name) y generando asi las funciones que seran disparadas cuando se realicen las peticiones asociadas a la tabla. Por ejemplo, tomando como modelo a la tabla usuarios, obtendremos:

| METODO | URL                  | Consulta SQL                                                      |
| ------ | -------------------- | ----------------------------------------------------------------- |
| GET    | api/usuarios?page=n  | SELECT * FROM usuarios LIMIT 10 OFFSET X                          |
| GET    | api/usuarios/:id     | SELECT * FROM usuarios WHERE id = 'X'                             |
| POST   | api/usuarios         | INSERT INTO public.usuarios(nombre,edad) VALUES ('X','Y')         |
| PUT    | api/usuarios/:id     | UPDATE public.usuarios SET nombre='X', edad = 'Y' WHERE id = 'Z'  |
| DELETE | api/usuarios/:id     | DELETE FROM public.usuarios WHERE id = 'X'                        |

Ahora si realizamos una petición del tipo GET a api/usuarios la herramienta realizara la consulta SQL correspondiente y parseara el resultado generando un documento JSON el cual sera enviado en la respuesta de la peticion.

Si analizamos el cuerpo de la respuesta encontraremos el siguiente JSON:

```javascript
[
  {
    "id": 1,
    "nombre": "aleman1542",
    "edad": 20
  },
  {
    "id": 2,
    "nombre": "widis",
    "edad": 20
  },
  {
    "id": 3,
    "nombre": "juli1994",
    "edad": 20
  },
  {
    "id": 4,
    "nombre": "fauste",
    "edad": 20
  }
]
```