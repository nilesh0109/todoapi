var express = require('express');
var bodyparser = require('body-parser');
var app = express();
var PORT = process.env.PORT || 3002;
var nextItemId = 1;
var todos = [{
    id: 1,
    description: 'Meet Mom for lunch',
    completed: false
}, {
    id: 2,
    description: 'Go to market today',
    completed: false
}];
todos = [];

Array.prototype.getEleById = function(id) {
    return this.filter(function(v) {
        return v.id === parseInt(id);
    })[0];
}

app.use(bodyparser.json());

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

app.post('/todos', function(req, res) {
    var body = req.body;

    body.id = nextItemId++;
    todos.push(body);
    res.json(body.id);
});

// GET Todo request /
//  get/todo:id

app.listen(PORT, function() {
    console.log('Express is listening to port ' + PORT);
});