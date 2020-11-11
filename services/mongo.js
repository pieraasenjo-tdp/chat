const mongoose = require('mongoose');

const connUri = process.env.MONGO_AZURE_CONN_URL;
const databaseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
};

mongoose.connect("mongodb://account-mta-dev.mongo.cosmos.azure.com:10255/chatmta?ssl=true&replicaSet=globaldb", {
        auth: {
            user: "account-mta-dev",
            password: "ivW5uPPnDpzL6Z1qxBBFXD0PEBlOAL83lsrs4K4JgMA0cwxsOCwkLFdtOlsFCyJxfrwUJv0yAU4aylWoesLeBQ=="
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