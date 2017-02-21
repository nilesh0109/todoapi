var express = require('express');
var bodyparser = require('body-parser');
var db = require('./db.js');
var _ = require('underscore');
var bcrypt = require('bcrypt');
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
}, {
    id: 3,
    description: 'walk the dog',
    completed: true
}];
todos = [];

Array.prototype.getEleById = function(id) {
    return this.filter(function(v) {
        return v.id === parseInt(id);
    })[0];
}

Array.prototype.getEleByProp = function(prop, val) {
    return this.filter(function(v) {
        return v[prop].toString() === val;
    });
}

Array.prototype.removeEleById = function(id) {
    return this.filter(function(v) {
        return v.id !== parseInt(id);
    });
}

Array.prototype.getIndexOfEle = function(id) {
    var ind = -1;
    this.filter(function(v, index) {
        if (v.id == parseInt(id)) {
            ind = index;
        }
        return v.id == parseInt(id);
    });
    return ind;
}

Array.prototype.updateEleById = function(ele) {
    this[this.getIndexOfEle(ele.id)] = ele;
}

app.use(bodyparser.json());

app.get('/', function(req, res) {
    res.send('TODO API ROOT');
});

// GET TODOs Request
//  get/todos

app.get('/todos', function(req, res) {
    var eles = todos;
    var where = {};
    if (req.query.hasOwnProperty('q')) {
        where.description = {
            $like: '%' + req.query.q + '%'
        }
    }
    if (req.query.hasOwnProperty('completed')) {
        where.completed = req.query.completed === 'true'
    }
    db.todo.findAll({
        where: where
    }).then(function(todos) {

        res.json(todos);
        //    todos.forEach(function(todo) {
        //        todo.toJSON()
        //    });
    }).catch(function(e) {
        res.status(500).json(e);
    });
    /*   if (req.query.hasOwnProperty('completed')) {
           eles = todos.getEleByProp('completed', req.query.completed);
       }
       if (req.query.hasOwnProperty('q')) {
           eles = eles.filter(function(elem) {
               return elem.description.indexOf(req.query.q) > -1;
           });
       }
       if (eles && eles.length > 0)
           res.json(eles);
       else
           res.status(404).send();

       */

});

app.get('/todos/:id', function(req, res) {
    //  var ele = todos.getEleById(req.params.id);
    /*  if (ele)
          res.json(ele);
      else
          res.status(404).send();  */

    db.todo.findById(parseInt(req.params.id)).then(function(todo) {
        if (todo)
            res.json(todo.toJSON());
        else
            res.status(404).send();
    }).catch(function(e) {
        res.status(500).json(e);
    });
});


// POST todos
app.post('/todos', function(req, res) {
    /*   var body = req.body;
       var item = {
           'id': nextItemId++,
           'description': body.description,
           'completed': body.completed
       };
       todos.push(item);
       res.json(item.id);  */
    db.todo.create(req.body).then(function(todo) {
        res.json(todo.toJSON());
    }).catch(function(e) {
        res.status(400).json(e);
    });
});

// DELETE todos
app.delete('/todos/:id', function(req, res) {
    /*
        var len = todos.length;
        todos = todos.removeEleById(req.params.id);
        if (todos.length === len)
            res.json('item not found');
        else
            res.json('item with id ' + req.params.id + ' is removed');
    */
    db.todo.destroy({
        where: {
            id: req.params.id
        }
    }).then(function(deletedRowsCount) {
        if (deletedRowsCount != 0) {
            res.json('item with id ' + req.params.id + ' is removed');
        } else {
            res.json('item with id ' + req.params.id + ' does not found');
        }
    }, function(e) {
        res.status(500).send();
    })

});
// UPDATE todos
app.put('/todos/:id', function(req, res) {
    var updateFields = {};
    var body = req.body;
    if (body.hasOwnProperty('completed')) {
        updateFields.completed = req.body.completed;
    }
    if (body.hasOwnProperty('description')) {
        updateFields.description = req.body.description;
    }
    db.todo.findById(req.params.id).then(function(todo) {
        todo.update(updateFields).then(function(rowUpdatedCount) {
            res.json('item with id ' + req.params.id + ' is updated');
        }, function(error) {
            res.status(500).send();
        });
    }, function() {
        res.json('item with id ' + req.params.id + ' is not found');
    });
    /*
    db.todo.update(updateFields, {
        where: {
            id: req.params.id
        }
    }).then(function(updatedRowsCount) {
        if (updatedRowsCount == 0)
            res.json('item with id ' + req.params.id + ' is not found');
        else
            res.json('item with id ' + req.params.id + ' is updated');
    }, function(error) {
        res.status(500).send();
    }); */
    /*  var ele = todos.getEleById(req.params.id);
      if (ele) {
          var body = req.body;
          var ele = {
              'id': parseInt(req.params.id),
              'description': body.description,
              'completed': body.completed
          }
          todos.updateEleById(ele);
          res.json('item with id ' + req.params.id + ' is updated');
      } else
          res.json('item with id ' + req.params.id + ' is not found');
          */
});

/* ---------------------- users database ----------------------------------- */

app.post('/users', function(req, res) {
    var body = _.pick(req.body, "email", "password");
    db.user.create(body).then(function(data) {
        res.json(data.getPublicJSON());
    }, function(error) {
        res.status(400).json(error);
    });
});

app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, "email", "password");
    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');
        if (token)
            res.header('Auth', token).json(user.getPublicJSON());
    }, function() {
        res.status(401).send();
    });
});

db.sequelize.sync({
    force: true
}).then(function() {
    console.log('database is synced');
    app.listen(PORT, function() {
        console.log('Express is listening to port ' + PORT);
    });
});