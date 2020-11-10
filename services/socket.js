const {
    ingresaUsuario,
    saleUsuario,
    obtenerUsuarioActual,
    obtenerUsuarioSala
} = require('./usuarios');

var model = require('../model/chatModel');

exports.emitToSocketId = (eventName, data) => {
    console.log(`Emit ${eventName}`, data);
    global.io.emit(eventName, data);
};

exports.emitOverChannel = (eventName, data) => {
    console.log(`Emit over channel ${eventName}`, data);
    global.io.emit(eventName, data);
};

exports.init = async () => {
    //TE CONECTAS AL SOCKET
    global.io.on('connection', async (socket) => {

        console.log('Usuario Conectado: ' + socket.id);

        socket.on('login', ({
            usuario,
            sala
        }) => {
            const user = ingresaUsuario(socket.id, usuario, sala);
            socket.join(user.room);
            //BIENVENIDA AL APP
            global.io.emit('inicio', 'iniciaste una session ' + user.room);
            socket.broadcast.to(user.room).emit('notification', 'se conecto');
            socket.broadcast.to(user.room).emit('notification', `${user.username} has joined the chat`);
            global.io.to(user.room).emit('usuarioEnSala', {
                sala: user.room,
                usuarios: obtenerUsuarioSala(user.room)
            });
        });

        socket.on('chatMessage', msg => {
            const user = obtenerUsuarioActual(socket.id);
            io.to(user.room).emit('message', msg);
        });

        socket.on('setusuario', () => {

        });
        socket.on('setmensaje', () => {

        });
        socket.on('setgrupo', () => {

        });
        socket.on('getchat', () => {

        });

        socket.on('disconnect', () => {
            const user = saleUsuario(socket.id);
            if (user) {
                socket.to(user.room).emit('notification', `${user.username} dejo el chat`);
                // Send users and room info
                socket.to(user.room).emit('usuarioEnSala', {
                    room: user.room,
                    users: obtenerUsuarioSala(user.room)
                });
            }
            //Save messages for room to database
        });

        socket.on('nuevoTicket', (obj) => {
            //BUSCAR LOS ASESORES MTA CONECTADOS QUE ESTEN DENTRO DEL MISMO CANAL
            socket.emit('actualizarBandeja', {});
        });

        global.io.to(socket.id).emit('notification', socket.id);
        //global.io.sockets.sockets[socket.id].disconnect();
    });
};