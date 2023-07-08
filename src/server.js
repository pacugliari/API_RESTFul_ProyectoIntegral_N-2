const express = require('express');
const { connectToCollection, desconnect, generateId } = require('./mongodb.js');

const server = express();

// Middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

//LISTADO DE USUARIOS CON FILTROS DE CORREO,NOMBRE Y APELLIDO
server.get('/usuarios', async (req, res) => {
    const { correo, nombre, apellido } = req.query;
    let usuarios = [];

    try {
        const collection = await connectToCollection('usuarios');

        //FILTROS
        if (correo) usuarios = await collection.find({ correo }).toArray();
        else if (nombre)  usuarios = await collection.find({ nombre }).toArray();
        else if (apellido)  usuarios = await collection.find({ apellido }).toArray();
        else usuarios = await collection.find().toArray();

        res.status(200).send(JSON.stringify(usuarios, null, '\t'));
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Hubo un error en el servidor');
    } finally {
        await desconnect();
    }
});

//BUSCAR POR ID
server.get('/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const collection = await connectToCollection('usuarios');
        const usuario = await collection.findOne({ id: { $eq: Number(id) } });

        if (!usuario) return res.status(400).send('Error. El Id no corresponde a un usuario existente.');

        res.status(200).send(JSON.stringify(usuario, null, '\t'));
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Hubo un error en el servidor');
    } finally {
        await desconnect();
    }
});

//ALTA
server.post('/usuarios', async (req, res) => {
    const { correo, clave, nombre, apellido } = req.body;

    if (!correo || !clave || !nombre || !apellido) {
        return res.status(400).send('Error. Faltan datos de relevancia.');
    }

    try {
        const collection = await connectToCollection('usuarios');
        const usuario = { id: await generateId(collection),  correo, clave, nombre, apellido  };

        await collection.insertOne(usuario);

        res.status(200).send(JSON.stringify(usuario, null, '\t'));
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Hubo un error en el servidor');
    } finally {
        await desconnect();
    }
});

//MODIFICACION
server.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { correo, clave, nombre, apellido } = req.body;

    if (!correo || !clave || !nombre || !apellido) {
        return res.status(400).send('Error. Faltan datos de relevancia.');
    }

    try {
        const collection = await connectToCollection('usuarios');
        let existeId = await collection.findOne({ id: { $eq: Number(id) } });
        
        if(existeId){
            const usuario = { correo, clave, nombre, apellido };
            await collection.updateOne({ id: Number(id) }, { $set: usuario});
            res.status(200).send(JSON.stringify(usuario, null, '\t'));
        }else
            res.status(200).send('No existe el id a modificar');

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Hubo un error en el servidor');
    } finally {
        await desconnect();
    }
});

//ELIMINAR
server.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const collection = await connectToCollection('usuarios');
        const usuario = await collection.findOne({ id: { $eq: Number(id) } });
        
        if(usuario){
            const eliminado = await collection.deleteOne({ id: { $eq: Number(id) } });
            res.status(200).send('Eliminado');
        }else
            res.status(200).send('No existe el id a eliminar');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Hubo un error en el servidor');
    } finally {
        await desconnect();
    }
});

// Control de rutas inexistentes
server.use('*', (req, res) => {
    res.status(404).send(`<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`);
});

// Método oyente de peteciones
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/usuarios`);
});


/*
SERVIDOR CON BASE DE DATOS USANDO ARCHIVOS

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
});*/