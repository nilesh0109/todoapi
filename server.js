var express = require('express');
var app = express();
var PORT = process.env.PORT || 3002;

var todos = [{
    id: 1,
    description: 'Meet Mom for lunch',
    completed: false
}, {
    id: 2,
    description: 'Go to market today',
    completed: false
}];

Array.prototype.getEleById = function(id) {
    return this.filter(function(v) {
        return v.id === parseInt(id);
    })[0];
}

app.get('/', function(req, res) {
    res.send('TODO API ROOT');
});

// GET TODOs Request
//  get/todos

app.get('/todos', function(req, res) {
    res.json(todos);
});

app.get('/todo/:id', function(req, res) {
    var ele = todos.getEleById(req.params.id);
    console.log(ele);
    if (ele)
        res.json(ele);
    else
        res.status(404).send();
});

// GET Todo request /
//  get/todo:id

app.listen(PORT, function() {
    console.log('Express is listening to port ' + PORT);
});