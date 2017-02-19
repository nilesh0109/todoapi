var Sequelize = require('sequelize');

var seq = new Sequelize(undefined,undefined,undefined,{
	'dialect' : 'sqlite',
	'storage' : __dirname+'/sequelize-test.sqlite'
});

var todos = seq.define('todos',{
	description:{
		type: Sequelize.STRING
		},
	completed: {
		type:Sequelize.BOOLEAN
		}
});

seq.sync({force:true}).then(function(){
	console.log('database is synced');
	todos.create({
		description:'walk my dog',
		completed: false
	})
});