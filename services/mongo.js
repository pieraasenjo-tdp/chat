const mongoose = require('mongoose');

const connUri = process.env.MONGO_AZURE_CONN_URL;
const databaseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
};

mongoose.connect("mongodb://" + process.env.COSMOSDB_HOST + ":" + process.env.COSMOSDB_PORT + "/" + process.env.COSMOSDB_DBNAME + "?ssl=true&replicaSet=globaldb", {
        auth: {
            user: process.env.COSMODDB_USER,
            password: process.env.COSMOSDB_PASSWORD
        },
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: false
    })
    .then(() => console.log('Connection to CosmosDB successful'))
    .catch((err) => console.error(err));

// mongoose.connect(connUri, databaseOptions, (err) => {
//     if (!err) {
//         console.log("MongoDB UP!");
//         return process.stdout.write('Conexion establecida con la bd');
//     }
//     throw new Error(`Error connection to the database! ${err.toString()}`);
// });