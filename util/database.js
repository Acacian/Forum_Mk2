const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const mongoConnect = callback => {
    MongoClient.connect(
        'mongodb+srv://testuser1:jZGk5M0wcYdyBLPm@doha.xxt8fwd.mongodb.net/?retryWrites=true&w=majority&appName=Doha'
    )
    .then(client => {
        console.log('Connected!');
        callback(client);
        })
        .catch(err => {
        console.log(err);
        });
    };
      
module.exports = mongoConnect;
      