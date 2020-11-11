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

if (ENV === 'production') {
    
} else {
    const src = app;
    module.exports = src;
}