const chat = require('./chat');
module.exports = (router) => {
    chat(router);
    return router;
};