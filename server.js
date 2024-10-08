
'use strict';

require('dotenv').config();
const EXPRESS = require("express");
const CONFIG = require('./config');
const app = EXPRESS();

/********************************
 ***** Server Configuration *****
 ********************************/
app.set('port', CONFIG.server.PORT);
const server = require('http').Server(app);

/** Server is running here */
let startNodeserver = async () => {
    await require(`./app/startup/expressStartup`)(app); //intialize express startup
    return new Promise((resolve, reject) => {
        server.listen(CONFIG.server.PORT, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
};

startNodeserver()
.then(() => {
    console.log('Node server running on ', CONFIG.server.URL);
}).catch((err) => {
    console.log('Error in starting server', err);
    process.exit(1);
});

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error);
});
