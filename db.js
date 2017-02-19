var Sequelize = require('sequelize');

var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/todoapi.sqlite'
});

var db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.todo = sequelize.import(__dirname + '/model/todo.js');


module.exports = db;