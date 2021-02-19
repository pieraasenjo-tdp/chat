const _ = require('underscore');
const usuarios = [];

function ingresaUsuario(usr, socketid) {
    const _usr = _.find(usuarios, {
        'nombre': usr.nombre
    });
    if (_usr) {
        if (!_usr.activo) _usr.activo = true;
        _usr.socketid = socketid;
    } else {
        usuarios.push(usr);
    }
    return usr;
}

function obtenerUsuariosActivos(room) {
    return _.filter(usuarios, {
        'activo': true,
        'room': room
    });
}

function actualizarData(socketid, usuario) {
    const index = usuarios.findIndex((obj => obj.socketid == socketid));
    usuarios[index] = usuario;
    return usuarios;
}

function obtenerUsuarioActual(socketid) {
    const usr = usuarios.find(u => u.socketid === socketid);
    return usr;
}

function saleUsuario(socketid) {
    const index = usuarios.findIndex(u => u.socketid === socketid);
    console.log('Se desconecta: ' + socketid);
    if (index !== -1) {
        return usuarios.splice(index, 1)[0];
    }
}

function obtenerUsuarioSala(room) {
    const usr = usuarios.filter(u => u.room === room);
    console.log('Usuarios en sala ' + room + ': ' + JSON.stringify(usr));
    return usr;
}
module.exports = {
    ingresaUsuario,
    saleUsuario,
    obtenerUsuarioActual,
    obtenerUsuarioSala,
    actualizarData,
    obtenerUsuariosActivos
}