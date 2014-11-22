/* users.js is part of Personal Intranet API and is responsible to
 ~      provide routing for API requests to the users resource.
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

/* HTTP POST /users/:username/auth_token
 * POST data: username and password
 * Param username: the username id of the user.
 * Returns: an authentication token.
 * Error: 404 if the specified user doesn't exist.
 * Error: 401 if the suppliced username/password don't match.
 */
router.post('/:username/auth_token', function(req, res) {

  var username = req.params.username;
  var password = req.body.password;
  
  accessControl.getAuthToken(username, password, 
      function onAllowed(auth_token) {
        res.json(auth_token);
      },
      function onDenied() {
        res.send(401);
      });
  
});

module.exports = router;
