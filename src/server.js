const express = require("express");
const { getOneById, getAll, create, update, destroy } = require("./database/data.manager.js");

require('dotenv').config();

const server = express();

// Middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

//GET
// Obtener todos los usuarios: Ruta GET http://127.0.0.1:3000/usuarios
server.get('/usuarios', (req, res) => {
    getAll()
        .then((usuarios) => res.status(200).send(usuarios))
        .catch((error) => res.status(400).send(error.message));
});

// Obtener un usuario específico: Ruta GET http://127.0.0.1:3000/usuario/1
server.get('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    getOneById(Number(id))
        .then((usuario) => res.status(200).send(usuario))
        .catch((error) => res.status(400).send(error.message));
});

//POST
// Crear un nuevo usuario: Ruta POST http://127.0.0.1:3000/usuarios
server.post('/usuarios', (req, res) => {
    const { correo, clave, nombre, apellido } = req.body;

    create({ correo, clave, nombre, apellido })
        .then((usuarios) => res.status(201).send(usuarios))
        .catch((error) => res.status(400).send(error.message));
});

//PUT
// Actualizar un usuario específico: Ruta PUT http://127.0.0.1:3000/usuarios/1
server.put('/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { correo, clave, nombre, apellido  } = req.body;

    update({ id: Number(id), correo, clave, nombre, apellido })
        .then((usuario) => res.status(200).send(usuario))
        .catch((error) => res.status(400).send(error.message));
});

//DELETE
// Eliminar un usuario específico: Ruta DELETE http://127.0.0.1:3000/usuarios/1
server.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    destroy(Number(id))
        .then((usuario) => res.status(200).send(usuario))
        .catch((error) => res.status(400).send(error.message));
});

// Control de rutas inexistentes
server.use('*', (req, res) => {
    res.status(404).send(`<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`);
});

// Método oyente de peteciones
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/usuarios`);
});