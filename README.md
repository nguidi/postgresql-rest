# PostgreSQL RESTful API

## RESTful

Es una arquitectura que define la manera en la que algunos estándares web, como HTTP y las URLs, deben de ser usadas. 

Su utilización se basa en el empleo de los métodos HTTP (GET, POST, PUT, DELETE) y la definición de URLs para identificar, obtener, editar, crear y eliminar recursos en el servidor. 

Este propone una serie de principios de diseño fundamentales que deben ser seguidos.

##### Métodos HTTP explícitos

REST establece una asociación uno-a-uno entre las operaciones de crear, leer, actualizar y borrar y los métodos HTTP.

![CRUD vs REST vs SQL](https://raw.githubusercontent.com/nguidi/postgresql-rest/master/docs/crud-rest-sql.png "CRUD vs REST vs SQL")

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

![REST API Usuarios](https://raw.githubusercontent.com/nguidi/postgresql-rest/master/docs/api-usuarios.png "REST API Usuarios")

Mientras que para los artículos sera:

![REST API Articulos](https://raw.githubusercontent.com/nguidi/postgresql-rest/master/docs/api-articulos.png "REST API Articulos")

Con las consideraciones que las acciones de crear (POST) y actualizar (PUT) aceptan parámetros en el cuerpo de la petición y la acción de obtener una colección (GET) aceptan parámetros de paginación en la URL.
