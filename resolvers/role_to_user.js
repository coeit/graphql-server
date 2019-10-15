/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const role_to_user = require(path.join(__dirname, '..', 'models_index.js')).role_to_user;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');








module.exports = {

    /**
     * role_to_users - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    role_to_users: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'role_to_user', 'read').then(authorization => {
            if (authorization === true) {
                return role_to_user.readAll(search, order, pagination);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * readOneRole_to_user - Check user authorization and return one record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneRole_to_user: function({
        id
    }, context) {
        return checkAuthorization(context, 'role_to_user', 'read').then(authorization => {
            if (authorization === true) {
                return role_to_user.readById(id);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * addRole_to_user - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addRole_to_user: function(input, context) {
        return checkAuthorization(context, 'role_to_user', 'create').then(authorization => {
            if (authorization === true) {
                return role_to_user.addOne(input);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * bulkAddRole_to_userCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddRole_to_userCsv: function(_, context) {
        return checkAuthorization(context, 'role_to_user', 'create').then(authorization => {
            if (authorization === true) {
                return role_to_user.bulkAddCsv(context);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteRole_to_user - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteRole_to_user: function({
        id
    }, context) {
        return checkAuthorization(context, 'role_to_user', 'delete').then(authorization => {
            if (authorization === true) {
                return role_to_user.deleteOne(id);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * updateRole_to_user - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateRole_to_user: function(input, context) {
        return checkAuthorization(context, 'role_to_user', 'update').then(authorization => {
            if (authorization === true) {
                return role_to_user.updateOne(input);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * countRole_to_users - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countRole_to_users: function({
        search
    }, context) {
        return checkAuthorization(context, 'role_to_user', 'read').then(authorization => {
            if (authorization === true) {
                return role_to_user.countRecords(search);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * vueTableRole_to_user - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableRole_to_user: function(_, context) {
        return checkAuthorization(context, 'role_to_user', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, role_to_user, ["id"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * csvTableTemplateRole_to_user - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateRole_to_user: function(_, context) {
        return checkAuthorization(context, 'role_to_user', 'read').then(authorization => {
            if (authorization === true) {
                return role_to_user.csvTableTemplate();
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    }

}