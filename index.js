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
    const src = app;
    module.exports = src;
}