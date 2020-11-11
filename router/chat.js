var Grupo = require('../model/Chat');
module.exports = (router) => {
    // Register
    router.route('/guardarusuario')
        .post((req, res) => {
            new Usuario(req.body).save((err, usuario) => {
                res.send(201, "Ok!");
            });
        });

    router.route('/cambiarestadochat')
        .post((req, res) => {
            Grupo.findOne({
                'sala': req.body.sala
            }, (err, data) => {
                data.estado = req.body.estado;
                data.save();
                res.json({
                    mensaje: 'ok'
                });
            });
        });
        
        router.route('/guardarmensajes')
        .post((req, res) => {
            console.log('inicia guardar...');
            Grupo.findOne({
                'sala': req.body.sala
            }, (err, data) => {
                if(data){
                    console.log('existe data...');
                    data.mensajes.push(req.body.msg);
                    data.save();
                    res.json({
                        mensaje: 'ok'
                    });
                }
            });
        });

    router.route('/obtenerchatporsala')
        .get((req, res) => {
            Grupo.find({
                'sala': req.query.sala
            }, (err, data) => {
                res.json(data);
            });
        });

    router.route('/obtenertodo')
        .get((req, res) => {
            Usuario.find({}, (err, data) => {
                res.json(data);
            });
        });

    // Login
    router.route('/cosmos_family')
        .post((req, res) => {
            new Family(req.body).save((err, saveFamily) => {
                console.log(JSON.stringify(saveFamily));
            });
        });
    router.route('/chat_grupal')
        .post((req, res) => {
            new Grupo(req.body).save((err, saveFamily) => {
                console.log(JSON.stringify(saveFamily));
            });
        });
    router.route('/chat')
        .post((req, res) => {
            new Mensaje(req.body).save((err, saveFamily) => {
                console.log(JSON.stringify(saveFamily));
            });
        });

    // Edit my profile
    router.route('/me')
        .patch((req, res) => {

        });

    // Search
    router.route('/search')
        .post((req, res) => {

        });
};