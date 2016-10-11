//	Datos de conexion a la base de datos
module.exports = {

	//	Configuración del servidor PostgreSQL
	"db":
	{
		//	IP o Nombre de Dominio del servidor
		//	Default: localhost
		"host": "localhost"

		//	Puerto del servidor
		//	Default: 5432
	,	"port": 5432

		//	Nombre de la base de datos
		//	Default: testdb
	,	"database": "restdb"

		//	Nombre del usuario
		//	Default: testuser
	,	"user": "testuser"

		//	Contraseña del usuario
		//	Default: testpassword
	,	"password": "testpassword"
	}

	//	Configuracion de la API REST
,	"api":
	{
		//	Puerto de conexion a la API
		"port": 3000

		//	Prefijo en las URL de la API
	,	"prefix": "api"
	}

};