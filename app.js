
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// routes get
const adminroutes = require('./routes/admin')
const userroutes = require('./routes/user');

// middleware set
app.use(adminroutes);
app.use(userroutes);

const server = http.createServer(app);

server.listen(3000);
