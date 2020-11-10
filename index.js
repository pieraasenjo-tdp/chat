require('dotenv').config();
require('./services/mongo');

const Grupo = require('./model/Chat');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const http = require('http');
const routes = require('./router/index.js');
const _ = require('underscore');
const {
    ingresaUsuario,
    saleUsuario,
    obtenerUsuarioActual,
    obtenerUsuarioSala,
    actualizarData,
    obtenerUsuariosActivos
} = require('./services/usuarios');
var conf = {
    port: 8888,
    debug: false,
    dbPort: 6379,
    dbHost: '127.0.0.1',
    dbOptions: {},
    mainroom: 'salaPrincipal'
};
const app = express();
const router = express.Router();
const ENV = process.env.NODE_ENV;
app.use(express.static(path.join(__dirname, 'app')));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);

function decrypt(o, salt) {
    o = decodeURI(o);
    if (salt && o.indexOf(salt) != 0)
        throw new Error('object cannot be decrypted');
    o = o.substring(salt.length).split('');
    for (var i = 0, l = o.length; i < l; i++)
        if (o[i] == '{')
            o[i] = '}';
        else if (o[i] == '}')
        o[i] = '{';
    return JSON.parse(o.join(''));
}
if (ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'app', 'build')));
    app.use('/api/v1', routes(router));
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, 'app', 'build', 'index.html'));
    });
} else {
    app.use(logger('dev'));
    app.use('/', routes(router));
}
const {
    production,
    development
} = require('./config');

if (ENV === 'production') {
    const SSL = production.sslPath; // Root path to certificates
    const httpsOpts = {
        cert: fs.readFileSync(path.join(SSL, 'server.cert')), // Your cert keys here
        key: fs.readFileSync(path.join(SSL, 'server.key')),
    };

    const httpsServer = https.createServer(httpsOpts, app);

    elastic
        .ping()
        .then(() => httpsServer.listen(production.port, () => {
            process.stdout.write(`Server started at ${production.url}:${production.port}`);
        }))
        .catch(() => {
            process.stdout.write('ElasticSearch server is not responding...');
            process.exit(1);
        });
    global.io = require('socket.io').listen(httpsServer);
    const src = app;
    module.exports = src;
} else {
    const server = http.createServer(app);
    server.listen(8080, () => {
        console.log("El app inicio en la dirección:" + development.url + ":" + development.port);
    });
    const io = require('socket.io')(server);
    //Send a message to all active rooms
    const sendBroadcast = function (text) {
        _.each(io.nsps['/'].adapter.rooms, function (sockets, room) {
            var message = {
                'room': room,
                'username': 'ServerBot',
                'msg': text,
                'date': new Date()
            };
            io.to(room).emit('newMessage', message);
        });
    };

    io.sockets.on('connection', socket => {
        const _data = socket.handshake.query.data;
        var key = "mta2020";

        const usr = decrypt(_data, key);
        usr.socketid = socket.id;

        console.log('ws: ' + socket.id);
        socket.emit('connected', 'Bienvenido a appmta');
        socket.join(conf.mainroom);
        socket.emit('subscriptionConfirmed', {
            'sala': conf.mainroom,
            'socketid': socket.id,
            'usuario': usr.nombre
        });
        var data = {
            'room': conf.mainroom,
            'username': usr.nombre,
            'msg': '----- Joined the room -----',
            'socketid': socket.id
        };
        io.to(conf.mainroom).emit('userJoinsRoom', data);
        //SE AÑADE AL ARRAY DE USUARIOS
        ingresaUsuario(usr, socket.id);
        // ingresaUsuario(usuarioid, socket.id, 'anonimo', conf.mainroom);
        socket.on('subscribe', function (data) {
            const usr = obtenerUsuarioActual(socket.id);
            usr.room = data.sala;
            const res = actualizarData(socket.id, usr);
            Grupo.findOne({
                'sala': data.sala
            }, (err, grupo) => {
                if (grupo) {
                    // grupo.estado = 2;
                } else {
                    // grupo.estado = 1;
                    //registro
                    grupo = new Grupo();
                    grupo.sala = data.sala;
                    grupo.socketId = socket.id;
                    grupo.estado = 1; // 3: estado en espera
                    grupo.usuarios.push({
                        usuarioId: 1,
                        socketId: socket.id,
                        canal: 1,
                        rol: 1,
                        nombres: 'nom prueba',
                        apellidos: 'ape prueba'
                    });
                    console.log('GRUPO CREADO: ', grupo);

                }

                grupo.save((err, res) => {
                    console.log('RES SAVE GROUP: ', res);
                    if (err) console.log(err);
                    socket.join(data.sala);
                    socket.emit('subscriptionConfirmed', {
                        'socketid': socket.id,
                        'room': data.sala,
                        'estado': grupo.estado
                    });
                    // Notify subscription to all users in room
                    var message = {
                        'room': data.sala,
                        'estado': res.estado,
                        'username': usr.username,
                        'msg': '----- Ingreso a la sala -----',
                        'socketid': socket.id
                    };
                    // 'room': conf.mainroom,
                    // 'username': usuarioid,
                    // // 'username': 'anonimo',
                    // 'msg': '----- Joined the room -----',
                    // 'socketid': socket.id
                    io.to(data.sala).emit('userJoinsRoom', message);
                });
            });
        });
        socket.on('unsubscribe', function (data) {
            const usr = obtenerUsuarioActual(socket.id);
            const saleDeLaSala = usr.room;
            if (data.sala != conf.mainroom) {
                usr.room = conf.mainroom;
                const res = actualizarData(socket.id, usr);
                socket.leave(data.sala);
                socket.emit('unsubscriptionConfirmed', {
                    'sala': data.sala,
                    'username': data.usuario,
                    'socketid': socket.id
                });
                var message = {
                    'room': saleDeLaSala,
                    'username': usr.username,
                    'msg': '----- Left the room -----',
                    'socketid': socket.id
                };
                io.to(data.sala).emit('userLeavesRoom', message);
            } else console.log('No puede salir de su sesion!!!');
        });
        socket.on('getRooms', function (data) {
            socket.emit('roomsReceived', socket.rooms);
        });
        socket.on('getUsersInRoom', function (req) {
            const usuarios = obtenerUsuarioSala(req.room);
            io.to(req.room).emit('usuariosEnSocket', usuarios);
        });
        //SE CREO UN TICKET NUEVO
        socket.on('bandejamta', (req) => {
            //BUSCAR A TODOS LOS USUARIOS PARA ENVIAR LA ACCION DE ACTUALIZAR BANDEJA
            io.to(conf.mainroom).emit('actualizarBandeja', req);
        });
        socket.on('setNickname', function (data) {
            const usr = obtenerUsuarioActual(socket.id);
            const usr_old = usr.username;
            usr.username = data.username;
            const res = actualizarData(socket.id, usr);

            io.of('/').in(usr.room).clients((error, clientes) => {
                var info = {
                    'room': usr.room,
                    'oldUsername': usr_old,
                    'newUsername': usr.username,
                    'id': socket.id
                };
                io.to(usr.room).emit('userNicknameUpdated', info);
            });
        });
        socket.on('newMessage', function (data) {
            const usr = obtenerUsuarioActual(socket.id);
            io.to(data.room).emit('newMessage', {
                room: data.room,
                message: data.message,
                date: new Date(),
                type: data.type,
                author: usr.autor,
            });
        });
        socket.on('disconnect', function () {
            const desconecta = obtenerUsuarioActual(this.id);
            desconecta.activo = false;
            actualizarData(this.id, desconecta);
            const usuarios = obtenerUsuariosActivos('salaPrincipal');
            io.to('salaPrincipal').emit('usuariosEnSocket', usuarios);
        });
    });
    const src = app;
    module.exports = src;
}