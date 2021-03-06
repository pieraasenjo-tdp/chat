const mongoose = require('mongoose');

const connUri = process.env.MONGO_AZURE_CONN_URL;
const databaseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
};
console.log('prueba');
//CER
mongoose.connect("mongodb://account-mta-cert.mongo.cosmos.azure.com:10255/chatmta?ssl=true&replicaSet=globaldb", {
        auth: {
            user: "account-mta-cert",
            password: "KNuNP2XZeoOFTsJqq8S0BYEsHk6zuMGvyHtliAIN52EcNkMGJJnxFrzQHS3MYm4UvMd6AsgjtmVOB5arooqsqQ=="
        },
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: false
    })
    .then(() => console.log('Conexión a CosmosDB cert ok'))
    .catch((err) => console.error(err));

//DEV
// mongoose.connect("mongodb://account-mta-dev.mongo.cosmos.azure.com:10255/chatmta?ssl=true&replicaSet=globaldb", {
//         auth: {
//             user: "account-mta-dev",
//             password: "ivW5uPPnDpzL6Z1qxBBFXD0PEBlOAL83lsrs4K4JgMA0cwxsOCwkLFdtOlsFCyJxfrwUJv0yAU4aylWoesLeBQ=="
//         },
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         retryWrites: false
//     })
//     .then(() => console.log('Conexión a CosmosDB dev ok'))
//     .catch((err) => console.error(err));

// mongoose.connect(connUri, databaseOptions, (err) => {
//     if (!err) {
//         console.log("MongoDB UP!");
//         return process.stdout.write('Conexion establecida con la bd');
//     }
//     throw new Error(`Error connection to the database! ${err.toString()}`);
// });
