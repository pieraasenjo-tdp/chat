module.exports = {
    development: {
        port: process.env.PORT || 3001, // React listening on 3000
        url: 'https://chat-mta.azurewebsites.net',
        env: 'development',
        saltingRounds: 10,
    },
    production: {
        port: process.env.PORT || 3000,
        url: 'https://your-url',
        env: 'production',
        saltingRounds: 10,
        sslPath: '', // Root path to server certificates for SSL
    },
};