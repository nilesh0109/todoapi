var bcrypt = require('bcrypt');
var _ = require('underscore');
module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        hashedPassword: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 30]
            },
            set: function(value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('hashedPassword', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function(user, options) {
                if (typeof user.email === 'string')
                    user.email = user.email.toLowerCase().trim();
            }
        },
        classMethods: {
            authenticate: function(body) {
                return new Promise(function(resolve, reject) {
                    if (typeof body.email !== 'string' || typeof body.password !== 'string')
                        return reject();
                    else {
                        user.findOne({
                            where: {
                                email: body.email
                            }
                        }).then(function(user) {
                            if (user) {
                                if (bcrypt.compareSync(body.password, user.get('hashedPassword'))) {
                                    return resolve(user);
                                } else {
                                    return reject();
                                }
                            } else {
                                return reject();
                            }
                        }, function(error) {
                            return reject();
                        })
                    }
                });

            }
        },
        instanceMethods: {

            getPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            }
        }
    });
    return user;
}