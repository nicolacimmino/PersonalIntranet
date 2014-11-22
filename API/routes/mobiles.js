/* mobiles.js is part of Personal Intranet API and is responsible to
 *      provide routing for API requests to the mobiles resource.
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

var express = require('express');
var router = express.Router();
var accessControl = require('../accessControl.js');

/* HTTP POST /mobiles/:username?auth_token=auth_token
 * Param username: the username of the user..
 * Query param auth_token: a valid authoerization tolken
 * Returns: 200 on success.
 * Error: 401 if the auth_token doesn't authorize the operation.
 * Registers a GCM registration id for the given user.
 */
router.post('/:username', function(req, res) {
  
  var db = req.db;
 
  accessControl.authorizeCreate(req.params.username, req.query.auth_token, function() {
        try {
              db.collection('mobiles').update(
                { gcmRegistrationId:req.body.gcmRegistrationId },
                { $set: { username:req.params.username, gcmRegistrationId:req.body.gcmRegistrationId, mobile:req.body.mobile, last_seen:new Date().toJSON() }},
                { upsert: true}
              );
       } catch (err) {
         res.send(401);
       }
     },
     function() {
        res.send(401);
     });
});


/* HTTP GET /mobiles/:username?auth_token=auth_token
 * Param username: the username of the user..
 * Query param auth_token: a valid authoerization tolken
 * Returns: A list of mobiles.
 * Error: 401 if the auth_token doesn't authorize the operation.
 * Gets a list of all mobiles registered for a user.
 */
router.get('/:username', function(req, res) {
  
  var db = req.db;
 
  accessControl.authorizeCreate(req.params.username, req.query.auth_token, function() {
        try {
              db.collection('mobiles').find(
                { username:req.params.username },
                {}, 
                function(e,docs){
                  try {
                    res.json( docs );
                  } catch (e) {
                    res.send(401);
                  }
                }
              );
       } catch (err) {
         res.send(401);
       }
     },
     function() {
        res.send(401);
     });
});
module.exports = router;