/*
    Resolvers for basic CRUD operations
*/

const path = require('path');
const role = require(path.join(__dirname, '..', 'models_index.js')).role;
const helper = require('../utils/helper');
const checkAuthorization = require('../utils/check-authorization');
const fs = require('fs');
const {
    handleError
} = require('../utils/errors');
const os = require('os');


/**
 * role.prototype.usersFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
role.prototype.usersFilter = function({
    search,
    order,
    pagination
}, context) {

    return this.usersFilterImpl({
        search,
        order,
        pagination
    });
}
/**
 * role.prototype.countFilteredUsers - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
role.prototype.countFilteredUsers = function({
    search
}, context) {
    return this.countFilteredUsersImpl({
        search
    });
}







module.exports = {

    /**
     * roles - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    roles: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'role', 'read').then(authorization => {
            if (authorization === true) {
                return role.readAll(search, order, pagination);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * readOneRole - Check user authorization and return one record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneRole: function({
        id
    }, context) {
        return checkAuthorization(context, 'role', 'read').then(authorization => {
            if (authorization === true) {
                return role.readById(id);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * addRole - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addRole: function(input, context) {
        return checkAuthorization(context, 'role', 'create').then(authorization => {
            if (authorization === true) {
                return role.addOne(input);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * bulkAddRoleCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddRoleCsv: function(_, context) {
        return checkAuthorization(context, 'role', 'create').then(authorization => {
            if (authorization === true) {
                return role.bulkAddCsv(context);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteRole - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteRole: function({
        id
    }, context) {
        return checkAuthorization(context, 'role', 'delete').then(authorization => {
            if (authorization === true) {
                return role.deleteOne(id);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * updateRole - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateRole: function(input, context) {
        return checkAuthorization(context, 'role', 'update').then(authorization => {
            if (authorization === true) {
                return role.updateOne(input);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * countRoles - Counts number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countRoles: function({
        search
    }, context) {
        return checkAuthorization(context, 'role', 'read').then(authorization => {
            if (authorization === true) {
                return role.countRecords(search);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * vueTableRole - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableRole: function(_, context) {
        return checkAuthorization(context, 'role', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, role, ["id", "name", "description"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * csvTableTemplateRole - Returns table's template
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {Array}         Strings, one for header and one columns types
     */
    csvTableTemplateRole: function(_, context) {
        return checkAuthorization(context, 'role', 'read').then(authorization => {
            if (authorization === true) {
                return role.csvTableTemplate();
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    }

}