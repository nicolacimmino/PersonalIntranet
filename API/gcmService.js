/* gcmService.js is part of Personal Intranet API and is responsible to
 *      provide access to Google Cloud Messaging service.
 *
 *   Copyright (C) 2014 Nicola Cimmino
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see http://www.gnu.org/licenses/.
 *
*/

var GCM = require('gcm').GCM;
var GCMapiKey = require('./applicationSecrets').GCMapiKey;
var gcm = new GCM(GCMapiKey);

module.exports.notifyUserMobiles = function(db, username, reporter_gcm_reg_id) {
  db.collection('mobiles').find({ username: username },{}, function(e,docs){
       
        try {
          for(ix=0; ix<docs.length; ix++) {
            if(docs[ix].gcmRegistrationId != reporter_gcm_reg_id) {
              var message = {
                  registration_id: docs[ix].gcmRegistrationId,
                  collapse_key: 'expenses_update', 
                  'data.key1': 'none',
                  'data.key2': 'none'
              };

              gcm.send(message, function(err, messageId){
                  if (err) {
                      console.log("Something has gone wrong sending GCM message!");
                  }
              });
              
              db.collection('mobiles').update({_id:docs[ix]._id}, { $inc: { notifications:1 }}, {safe:true}, function(err, result) { console.log(err);});
            }
          }
        } catch (e) {
          res.send(401);
        }
  });
};