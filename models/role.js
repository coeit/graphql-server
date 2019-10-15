'use strict';

const _ = require('lodash');
const Sequelize = require('sequelize');
const dict = require('../utils/graphql-sequelize-types');
const searchArg = require('../utils/search-argument');
const globals = require('../config/globals');
const validatorUtil = require('../utils/validatorUtil');
const fileTools = require('../utils/file-tools');
const helpersAcl = require('../utils/helpers-acl');
const email = require('../utils/email');
const fs = require('fs');
const path = require('path');
const os = require('os');
const uuidv4 = require('uuidv4');
const helper = require('../utils/helper');
const models = require(path.join(__dirname, '..', 'models_index.js'));
// An exact copy of the the model definition that comes from the .json file
const definition = {
    model: 'role',
    storageType: 'SQL',
    attributes: {
        name: 'String',
        description: 'String'
    },
    associations: {
        users: {
            type: 'to_many',
            target: 'user',
            targetKey: 'userId',
            sourceKey: 'roleId',
            keysIn: 'role_to_user',
            targetStorageType: 'sql',
            label: 'email',
            sublabel: 'id',
            name: 'users',
            name_lc: 'users',
            name_cp: 'Users',
            target_lc: 'user',
            target_lc_pl: 'users',
            target_pl: 'users',
            target_cp: 'User',
            target_cp_pl: 'Users'
        }
    }
};

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */

module.exports = class role extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init({
            name: {
                type: Sequelize[dict['String']]
            },
            description: {
                type: Sequelize[dict['String']]
            }


        }, {
            modelName: "role",
            tableName: "roles",
            sequelize
        });
    }

    static associate(models) {
        role.belongsToMany(models.user, {
            as: 'users',
            foreignKey: 'roleId',
            through: 'role_to_user',
            onDelete: 'CASCADE'
        });
    }

    static readById(id) {
        return role.findOne({
            where: {
                id: id
            }
        });
    }

    static countRecords(search) {
        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return super.count(options);
    }

    static readAll(search, order, pagination) {
        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return super.count(options).then(items => {
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            } else if (pagination !== undefined) {
                options['order'] = [
                    ["id", "ASC"]
                ];
            }

            if (pagination !== undefined) {
                options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
            } else {
                options['offset'] = 0;
                options['limit'] = items;
            }

            if (globals.LIMIT_RECORDS < options['limit']) {
                throw new Error(`Request of total roles exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
            }
            return super.findAll(options);
        });
    }

    static addOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
            .then((valSuccess) => {
                return super.create(input)
                    .then(item => {
                        if (input.addUsers) {
                            item.setUsers(input.addUsers);
                        }
                        return item;
                    });
            }).catch((err) => {
                return err
            })
    }

    static deleteOne(id) {
        return super.findByPk(id)
            .then(item => {

                if (item === null) return new Error(`Record with ID = ${id} not exist`);

                return validatorUtil.ifHasValidatorFunctionInvoke('validateForDelete', this, item)
                    .then((valSuccess) => {
                        return item
                            .destroy()
                            .then(() => {
                                return 'Item successfully deleted';
                            });
                    }).catch((err) => {
                        return err
                    })
            });

    }

    static updateOne(input) {
        return validatorUtil.ifHasValidatorFunctionInvoke('validateForUpdate', this, input)
            .then((valSuccess) => {
                return super.findByPk(input.id)
                    .then(item => {
                        if (input.addUsers) {
                            item.addUsers(input.addUsers);
                        }
                        if (input.removeUsers) {
                            item.removeUsers(input.removeUsers);
                        }
                        return item.update(input);
                    });
            }).catch((err) => {
                return err
            })
    }

    static bulkAddCsv(context) {

        let delim = context.request.body.delim;
        let cols = context.request.body.cols;
        let tmpFile = path.join(os.tmpdir(), uuidv4() + '.csv');

        context.request.files.csv_file.mv(tmpFile).then(() => {

            fileTools.parseCsvStream(tmpFile, this, delim, cols).then((addedZipFilePath) => {
                try {
                    console.log(`Sending ${addedZipFilePath} to the user.`);

                    let attach = [];
                    attach.push({
                        filename: path.basename("added_data.zip"),
                        path: addedZipFilePath
                    });

                    email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                        'ScienceDB batch add',
                        'Your data has been successfully added to the database.',
                        attach).then(function(info) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.log(info);
                    }).catch(function(err) {
                        fileTools.deleteIfExists(addedZipFilePath);
                        console.log(err);
                    });

                } catch (error) {
                    console.log(error.message);
                }

                fs.unlinkSync(tmpFile);
            }).catch((error) => {
                email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                    'ScienceDB batch add', `${error.message}`).then(function(info) {
                    console.log(info);
                }).catch(function(err) {
                    console.log(err);
                });

                fs.unlinkSync(tmpFile);
            });

        }).catch((error) => {
            return new Error(error);
        });
    }

    static csvTableTemplate() {
        return helper.csvTableTemplate(role);
    }







    usersFilterImpl({
        search,
        order,
        pagination
    }) {

        let options = {};

        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }

        return this.countUsers(options).then(items => {
            if (order !== undefined) {
                options['order'] = order.map((orderItem) => {
                    return [orderItem.field, orderItem.order];
                });
            } else if (pagination !== undefined) {
                options['order'] = [
                    ["id", "ASC"]
                ];
            }
            if (pagination !== undefined) {
                options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
            } else {
                options['offset'] = 0;
                options['limit'] = items;
            }
            if (globals.LIMIT_RECORDS < options['limit']) {
                throw new Error(`Request of total usersFilter exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
            }
            return this.getUsers(options);
        });
    }

    countFilteredUsersImpl({
        search
    }) {

        let options = {};
        if (search !== undefined) {
            let arg = new searchArg(search);
            let arg_sequelize = arg.toSequelize();
            options['where'] = arg_sequelize;
        }
        return this.countUsers(options);
    }


    static get definition() {
        return definition;
    }

    static base64Decode(cursor) {
        return Buffer.from(cursor, 'base64').toString('utf-8');
    }


    base64Enconde() {
        return Buffer.from(JSON.stringify(this.stripAssociations())).toString('base64');
    }

    stripAssociations() {
        let attributes = Object.keys(role.definition.attributes);
        attributes.push('id');
        let data_values = _.pick(this, attributes);
        return data_values;
    }

}