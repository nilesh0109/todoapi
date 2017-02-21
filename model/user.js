var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

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
            },
            generateToken: function(type) {
                if (!_.isString(type)) {
                    return undefined;
                }
                try {
                    var stringData = JSON.stringify({
                        id: this.get('id'),
                        type: type
                    });
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString();
                    var token = jwt.sign({
                        token: encryptedData
                    }, 'qwerty09a');
                    return token;
                } catch (e) {
                    console.log(e);
                    return undefined;
                }
            }
        }
    });
    return user;
}