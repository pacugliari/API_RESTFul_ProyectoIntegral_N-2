const fs   = require("fs");
const path = require("path");

const ruta = path.join(__dirname, "data.json");

function escribir(contenido) {
    return new Promise((resolve, reject) => {
        fs.writeFile(ruta, JSON.stringify(contenido, null, "\t"), "utf8", (error) => {
            if (error) reject(new Error("Error. No se puede escribir"));

            resolve(true);
        });
    });
}

function leer() {
    return new Promise((resolve, reject) => {
        fs.readFile(ruta, "utf8", (error, result) => {
            if (error) reject(new Error("Error. No se puede leer"));

            resolve(JSON.parse(result));
        });
    });
}

function generarId(usuarios) {
    let mayorId = 0;

    usuarios.forEach((usuario) => {
        if (Number(usuario.id) > mayorId) {
            mayorId = Number(usuario.id);
        }
    });

    return mayorId + 1;
}

async function getOneById(id) {
    if (!id) throw new Error("Error. El ID está indefinido.");

    const usuarios = await leer();
    const usuario  = usuarios.find((element) => element.id === id);

    if (!usuario) throw new Error("Error. El ID no corresponde a un usuario en existencia.");

    return usuario;
}

async function getAll() {
    const usuarios = await leer();
    return usuarios;
}

async function create(usuario) {
    if (!usuario?.correo || !usuario?.clave || !usuario?.nombre || !usuario?.apellido) throw new Error("Error. Datos incompletos en el ALTA.");

    let usuarios = await leer();

    // Verificar si el correo ya están en uso
    const usuarioExistente = usuarios.find(
        (u) => u.correo === usuario.correo
    );
    if (usuarioExistente) {
        throw new Error("Error. El correo ya están en uso.");
    }

    const usuarioConId = { id: generarId(usuarios), ...usuario };

    usuarios.push(usuarioConId);
    await escribir(usuarios);

    return usuarioConId;
}

async function update(usuario) {
    if (!usuario?.correo || !usuario?.clave || !usuario?.nombre || !usuario?.apellido) throw new Error("Error. Datos incompletos en el MODIFICAR.");

    let usuarios   = await leer();
    const indice = usuarios.findIndex((element) => element.id === usuario.id);

    if (indice < 0) throw new Error("Error. El ID no corresponde a un usuario en existencia.");

    usuarios[indice] = usuario;
    await escribir(usuarios);

    return usuarios[indice];
}

async function destroy(id) {
    if (!id) throw new Error("Error. El ID está indefinido.");

    let usuarios   = await leer();
    const indice = usuarios.findIndex((element) => element.id === id);

    if (indice < 0) throw new Error("Error. El ID no corresponde a un usuario en existencia.");

    const usuario = usuarios[indice];
    usuarios.splice(indice, 1);
    await escribir(usuarios);

    return usuario;
}

module.exports = { getOneById, getAll, create, update, destroy };