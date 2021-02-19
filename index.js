require('./services/mongo');
var moment = require('moment');
moment.locale('es');
const Grupo = require('./model/Chat');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const routes = require('./router/index.js');
const scheduler = require('node-schedule');
const _ = require('underscore');
const https = require("https");
var axios = require('axios');
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
var rule = new scheduler.RecurrenceRule();
rule.minute = new scheduler.Range(0, 59, 60);

scheduler.scheduleJob(rule, async () => {
    console.log('***********INICIO JOB' + moment(new Date()).format('DD/MM/yyyy h:mm a'));
    const res = await axios.get('https://aks-mta-ingress-dev.eastus2.cloudapp.azure.com/gestionMta/devolverTicketsPorTarea/0', {
        headers: {
            'Content-Type': 'application/json',
            'UNICA-ServiceId': '1b567df3-0fa8-4ad2-ab0b-a97291904361',
            'UNICA-Application': 'wappe',
            'UNICA-PID': '550e8400-e29b-41d4-a716-446655440000',
            'UNICA-User': 'admin',
            'X-IBM-Client-Id': '9a8ba84e-35ba-4488-0de1-04e436f3e38e',
            'Authorization': 'Bearer kZTctMDRlNDM2ZmVlMzBl3gw3C83XdPUdxwYjC5dqonYG_YLvIggUf'
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        })
    }).catch((err) => {
        console.log('error', err);
    });
    console.log(res);
    console.log(new Date());
});