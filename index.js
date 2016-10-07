/*  FUNC  */

//	Obtiene el listado de nombre de tablas y ejecuta el callback
function getTablesName(db, cb) {
	db
		.any(
			"SELECT a.table_name AS name, b.column_name AS pkey "+
			"FROM "+
				"information_schema.table_constraints a, "+
				"information_schema.key_column_usage b "+ 
			"WHERE "+ 
				"a.constraint_type = 'PRIMARY KEY' "+
				"AND b.table_name = a.table_name "+
				"AND b.constraint_name = a.constraint_name"
		).then(
			function(tables)
			{
				cb(tables,null);
			}
		).catch(
			function(err)
			{
				cb([],err);
			}
		);
}

/* INIT  */

//	Inicializo express con soporte para parsear los JSON en las peticiones POST y PUT
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//	Inicializo postgress
var pg = require("pg-promise")();


//	Obtengo los parametros de conexion
var pgconfig
=	require("./pgconfig.js");

//	Me conecto con la base de datos
var db = pg(pgconfig);

//	Obtengo	el nombre de las tablas de la base de datos
getTablesName(
	db
,	function(tables, error)
	{
		//	Si ocurrio un error lo muestro
		if (error)
			throw error;

		tables
			.forEach(
				function(table)
				{
					//	GET /api/{table}
					app
						.get(
							"/api/"+table.name
						,	function(req, res, next)
							{
								//	Calculo el offset
								var page
								=	(req.query.page)
									?	(req.query.page <= 0)
										?	1
										:	req.query.page
									:	1
								,	offset
								=	page*10 - 10;

								//	Realizo la consulta
								db
									.any("SELECT * FROM "+table.name+" LIMIT 10 OFFSET "+offset)
									.then(
										function(data)
										{
											//	Devuelvo el resultado de la consulta
											res
												.status(200)
												.json(data);
										}
									).catch(
										function(err)
										{
											return next(err);
										}
									);
							}
						);

					//	GET /api/{table}/:id
					app
						.get(
							"/api/"+table.name+"/:pkey"
						,	function(req, res, next)
							{
								//	Realizo la consulta
								db
									.any("SELECT * FROM "+table.name+" WHERE "+table.pkey+" = '"+req.params.pkey+"'")
									.then(
										function(data)
										{
											res
												.status(200)
												.json(data[0]);
										}
									).catch(
										function(err)
										{
											return next(err);
										}
									);
							}
						);

					//	POST /api/{table}
					app
						.post(
							"/api/"+table.name
						,	function(req, res, next)
							{
								//	Genero la consulta
								var queryString
								=	"INSERT INTO public."+table.name+"(";

								Object.keys(req.body)
									.forEach(
										function(key,index)
										{
											queryString += key;
											queryString += (Object.keys(req.body).pop() == key) ? "" : ", ";
										}
									);

								queryString += ") VALUES (";

								Object.keys(req.body)
									.forEach(
										function(key,index)
										{
											queryString += "'"+req.body[key]+"'";
											queryString += (Object.keys(req.body).pop() == key) ? "" : ", ";
										}
									);

								queryString += ")";

								//	Realizo la consulta
								db
									.any(queryString)
									.then(
										function(data)
										{
											res
												.status(200)
												.json(
													{
														code:	200
													,	status:	"OK"
													,	msg:	"Registro creado correctamente."
													}
												);
										}
									).catch(
										function(err)
										{
											return next(err);
										}
									);
							}
						);

					//	PUT /api/{table}/:id
					app
						.put(
							"/api/"+table.name+"/:pkey"
						,	function(req, res, next)
							{
								//	Genero la consulta
								var queryString
								=	"UPDATE public."+table.name+" SET ";

								Object.keys(req.body)
									.forEach(
										function(key,index)
										{
											queryString += key;
											queryString += "=";
											queryString += "'"+req.body[key]+"'";
											queryString += (Object.keys(req.body).pop() == key) ? "" : ", ";
										}
									);

								queryString += " WHERE "+table.pkey+" = '"+req.params.pkey+"'";

								//	Realizo la consulta
								db
									.any(queryString)
									.then(
										function(data)
										{
											res
												.status(200)
												.json(
													{
														code:	200
													,	status:	"OK"
													,	msg:	"Registro actualizado correctamente."
													}
												);
										}
									).catch(
										function(err)
										{
											return next(err);
										}
									);
							}
						);

					//	DELETE /api/{table}/:id
					app
						.delete(
							"/api/"+table.name+"/:pkey"
						,	function(req, res, next)
							{
								//	Genero la consulta
								var queryString
								=	"DELETE FROM public."+table.name+" WHERE "+table.pkey+" = '"+req.params.pkey+"'";

								//	Realizo la consulta
								db
									.any(queryString)
									.then(
										function(data)
										{
											res
												.status(200)
												.json(
													{
														code:	200
													,	status:	"OK"
													,	msg:	"Registro eliminado correctamente."
													}
												);
										}
									).catch(
										function(err)
										{
											return next(err);
										}
									);
							}
						);
				}
			);
		
		app
			.listen(
				3000
			,	function()
				{
					console.log('Postgress Restfull api listening on port 3000!');
				}
			);
	}
);