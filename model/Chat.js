var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Ticket = new Schema({
    usuarioId: String,
    fechaReg: Date,
    canal: String,
    estado: Number
});

const Grupo = Schema({
    sala: String,
    socketId: String,
    fechaReg: Date,
    estado: Number,
    usuarios: [{
        usuarioId: Number,
        socketId: String,
        canal: Number,
        rol: Number,
        nombres: String,
        apellidos: String
    }],
    mensajes: [],
    adjuntos: [{
        adjuntoId: String,
        fechaReg: {
            type: Date,
            default: Date.now
        }
    }],
    tickets: [Ticket]
});
module.exports = mongoose.model('Grupo', Grupo);