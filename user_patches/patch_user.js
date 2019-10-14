--- user.js	2019-10-14 17:26:56.888297502 -0500
+++ user_create.js	2019-10-14 17:31:43.465976962 -0500
@@ -15,6 +15,9 @@
 const uuidv4 = require('uuidv4');
 const helper = require('../utils/helper');
 const models = require(path.join(__dirname, '..', 'models_index.js'));
+const bcrypt = require('bcrypt');
+const salt_rounds = 10;
+
 // An exact copy of the the model definition that comes from the .json file
 const definition = {
     model: 'User',
@@ -135,13 +138,16 @@
     static addOne(input) {
         return validatorUtil.ifHasValidatorFunctionInvoke('validateForCreate', this, input)
             .then((valSuccess) => {
-                return super.create(input)
+              return bcrypt.hash(input.password, salt_rounds).then( hash=>{
+                  input.password = hash;
+                  return super.create(input)
                     .then(item => {
                         if (input.addRoles) {
                             item.setRoles(input.addRoles);
                         }
                         return item;
                     });
+                  });
             }).catch((err) => {
                 return err
             })
