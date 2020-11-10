function encrypt(o, salt) {
    o = JSON.stringify(o).split('');
    for (var i = 0, l = o.length; i < l; i++)
        if (o[i] == '{')
            o[i] = '}';
        else if (o[i] == '}')
        o[i] = '{';
    return encodeURI(salt + o.join(''));
}

$(function () {
    const nombre = prompt('usuario:');
    const usr = {
        usuarioId: 0,
        usuario: "",
        room: "salaPrincipal",
        nombre: nombre,
        activo: true,
        documento: "10101010",
        rolId: 0,
        rol: "Asesor PDV"
    };
    var key = "mta2020";
    var data = encrypt(usr, key);
    const url = 'http://localhost:3001';
    var socket = io.connect(url, {
        query: `data=${data}`
    });

    const usuarios = [];

    socket.on('connected', function (data) {
        console.log(data + ' | ' + 'ID Servidor/Cliente: ' + socket.id);
        // socket.emit('getUsersInRoom', {
        //     'room': 'salaPrincipal'
        // });
    });

    //nuevo usuario a la sala
    socket.on('userJoinsRoom', function (data) {
        console.log('------------------------------------------');
        console.log(`usuario:${data.username} ingresa a la sala:${data.room}`);
    });

    socket.on('roomsReceived', (res) => {
        console.log('salas: ' + JSON.stringify(res));
    });

    // Unsubscription to room confirmed
    socket.on('unsubscriptionConfirmed', function (data) {
        const usr = _.find(usuarios, {
            socketid: data.socketid
        });
        usr.room = 'salaPrincipal';
        console.log('El usuario ' + data.username + ' salio de la sala: ' + data.sala + 'y vuelve a ' + usr.room);
    });

    // User nickname updated
    socket.on('userNicknameUpdated', function (data) {
        console.log('----------------------------------------------')
        console.log("nombre de usuario actualizado: %s", JSON.stringify(data));
    });

    // Users in room received
    socket.on('usersInRoom', function (data) {
        console.log('Usuarios en la sala: %s', JSON.stringify(data));
    });

    // User leaves room
    socket.on('userLeavesRoom', function (data) {
        const usr = _.find(usuarios, {
            socketid: data.socketid
        });
        if (usr) {
            if (data.room != usr.room) {
                console.log("userLeavesRoom: %s", JSON.stringify(data));
            }
        } else console.log('no existe usuario en sala');
    });



    // // en los dos casos
    // $button.on('click', () => {
    //     socket.emit('bandejamta', {...})
    // })

    // socket.on('actualizarBandeja', (res) => {
    //     //MANDAR A REFRESCAR LA BANDEJA DEL ASESOR MTA
    // });



    //suscripcion a la sala confirmada
    socket.on('subscriptionConfirmed', function (data) {
        //consultar a '/obtenerchatporsala'
        const usr = _.find(usuarios, {
            socketid: data.socketid
        });
        if (usr) {
            if (usr.room != data.room) {
                usr.room = data.room;
            }
            console.log('Suscrito correctamente!');
        }
    });

    // Message received
    socket.on('newMessage', function (data) {
        console.log(data);
    });

    $('#enviarmensaje').click(function () {
        socket.emit('newMessage', {
            room: 'salaPrincipal',
            message: 'hola'
        });
    });

    $('#desconectar').click(function () {
        console.log("------------------------------------------")
        if (socket.connected) socket.disconnect();
        else console.log('Ya estaba desconectado!');
    });

    $('#usuarios_socket').click(() => {
        socket.emit('getUsersInRoom', {
            room: 'salaPrincipal'
        });
    });

    socket.on('usuariosEnSocket', function (res) {
        if (res.length > 0) {
            const _uActivos = _.filter(res, {
                'activo': true
            });
            const _uInactivos = _.filter(res, {
                'activo': false
            });

            const usuariosActivos = _.map(_uActivos, 'nombre');
            const usuariosInactivos = _.map(_uInactivos, 'nombre');

            console.log(`usuarios ACTIVOS:${usuariosActivos}`);
            console.log(`usuarios INACTIVOS:${usuariosInactivos}`);
        } else {
            console.log(`No Existen usuarios disponibles`);
        }
    });


    $("#salir_sala").click(() => {
        const usr = _.find(usuarios, {
            socketid: socket.id
        });
        if (usr.room != 'salaPrincipal') {
            socket.emit('unsubscribe', {
                'usuario': usr.username,
                'sala': usr.room
            });
            usr.room = 'salaPrincipal';
        } else console.log('No puede dejar su sesion!!!')
    });

    $("#socketid").click(() => {
        console.log("SocketID:" + socket.id);
    });

    $("#guardar_ticket").click(() => {
        //NOTIFICAR A TODOS LOS QUE ESTEN BANDEJA MTA
        const req = {
            usuarioId: 1,
            ticketId: 0
        };
        socket.emit('bandejamta'.req);
    });

    $('#estado').click(function () {
        if (socket.connected) {
            console.log("CAMBIO")
            const usr = _.find(usuarios, {
                socketid: socket.id
            });
            socket.emit('getRooms', {});
            socket.emit('getUsersInRoom', {
                room: usr.room
            });
            console.log('Sala Actual: ' + usr.room);
        } else {
            console.log('------------------------------');
            console.log('Se encuentra desconectado');
        }
    });

    $('#asignarusuario').click(() => {
        const username = prompt('ingrese un nombre de usuario:');
        socket.emit('setNickname', {
            'username': username
        });
    });

    $("#crear_sala").click(() => {
        const sala = prompt('Nombre de la sala?');
        socket.emit('subscribe', {
            'sala': sala
        });
    });

    socket.on('inicio', (res) => {
        console.log('Servidor: ' + res);
    });
    socket.on('usuarioEnSala', (res) => {
        console.log('Sala: ' + res.sala);
        console.log('Usuarios: ' + res.usuarios);
    });
    socket.on('notification', (res) => {
        console.log('Servidor: ' + res);
    });

    // Reconnected to server
    socket.on('reconnect', function (data) {
        var info = {
            'room': 'salaPrincipal',
            'username': 'ServerBot',
            'msg': '----- Reconnected to server -----'
        };
        console.log('Intentos de reconexion: ' + data + ' | ' + info);
    });

    // Disconnected from server
    socket.on('disconnect', function (data) {
        var info = {
            'room': 'salaPrincipal',
            'username': 'ServerBot',
            'msg': '----- Lost connection to server -----'
        };
        console.log('Desconexion: ' + data);
        console.log('Info: ' + JSON.stringify(info));
    });
});