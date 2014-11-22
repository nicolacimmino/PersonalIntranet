/* expenses.js is part of Personal Intranet API and is responsible to
 *      provide routing for API requests to the expenses resource.
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
var ObjectId = require('mongodb').ObjectID;
var accessControl = require('../accessControl.js');
var gcmService = require('../gcmService.js');

/* HTTP GET /expenses/:username?auth_token=auth_token
 * Param username: the username of the owner of the expenses.
 * Query param auth_token: a valid authoerization tolken
 * Returns: all expenses for the specified user.
 * Error: 401 if the auth_token doesn't authorize the operation.
 */
router.get('/:username', function(req, res) {
  
  var db = req.db;
  var username = req.params.username;
  var auth_token =  req.query.auth_token;
  
  accessControl.authorizeRead(username, auth_token, 
      function onAllowed() {
        db.collection('transactions').find({ username: req.params.username },{}).sort({ timestamp:-1}, function(e,docs){
          try {
            res.json( docs );
          } catch (e) {
            res.send(401);
          }
        })},
      function onDenied() {
        res.send(401);
      });
});

/* HTTP GET /expenses/:username/:id?auth_token=auth_token
 * Param username: the username of the user.
 * Param id: the id of the expense.
 * Query param auth_token: a valid authoerization tolken
 * Returns: a specific expense assuming it belogs to the user.
 * Error: 401 if the auth_token doesn't authorize the operation.
 */
router.get('/:username/:id', function(req, res) {

  var db = req.db;
  var username = req.params.username;
  var auth_token =  req.query.auth_token;
  
  accessControl.authorizeRead(username, auth_token, 
      function onAllowed() {
        db.collection('transactions').find({ username: req.params.username , _id:new ObjectId(req.params.id) },{}, function(e,docs){
          try {
            res.json( docs );
          } catch (e) {
            res.send(401);
          }
        })},
      function onDenied() {
        res.send(401);
      });
});

/* HTTP POST /expenses/:username?auth_token=auth_token
 * Param username: the username of the user owning the expense.
 * Query param auth_token: a valid authoerization tolken
 * POST data: a json document describing the expense
 * Returns: 200 on success.
 * Error: 401 if the auth_token doesn't authorize the operation.
 */
router.post('/:username', function(req, res) {

  var db = req.db;
  var username = req.params.username;
  var auth_token =  req.query.auth_token;
  var reporter_gcm_reg_id = req.body.reporter_gcm_reg_id;
  
  accessControl.authorizeCreate(username, auth_token, 
      function onAllowed() {
        try {
          expense = {};
          expense.username = req.params.username;
          expense.amount = parseFloat((req.body.amount || '0').replace('"',''));
          expense.source = req.body.source || '';
          expense.destination = req.body.destination || '';
          expense.notes = req.body.notes || '';
          expense.timestamp = req.body.timestamp;
          
          db.collection('transactions').insert(expense,{}, function(e,docs){
            gcmService.notifyUserMobiles(db,username, reporter_gcm_reg_id);
            res.send(200);
          });
        } catch (Exception) {
             res.send(401);
        }            
      },
      function onDenied() {
        res.send(401);
      });
});

/* HTTP PUT /expenses/:username/:id?auth_token=auth_token
 * Param username: the username of the user owning the expense.
 * Param id: the id of the expense to modify.
 * Query param auth_token: a valid authoerization tolken
 * POST data: a json describing the updated expense.
 * Returns: 200 on success.
 * Error: 401 if the auth_token doesn't authorize the operation.
 */
router.put('/:username/:id', function(req, res) {
    
  var db = req.db;
  var username = req.params.username;
  var auth_token =  req.query.auth_token;
  var transactionId = req.params.id;
  
  accessControl.authorizeUpdate(username, auth_token, 
      function onAllowed() {
        try {
          expense = {};
          expense.username = req.params.username;
          expense.amount = req.body.amount;
          expense.source = req.body.source || '';
          expense.destination = req.body.destination || '';
          expense.notes = req.body.notes || '';
          expense.timestamp = req.body.timestamp;
          
          db.collection('transactions').update({'_id':new ObjectId(transactionId)}, expense, {safe:true}, function(err, result) {
            gcmService.notifyUserMobiles(db,username);
            res.send(200);
          });
        } catch (err) {
             res.send(401);
        }            
      },
      function onDenied() {
        res.send(403);
      });
});

/* HTTP DELETE /expenses/:username/:id?auth_token=auth_token
 * Param username: the username of the user owning the expense.
 * Param id: the id of the expense to delete.
 * Query param auth_token: a valid authoerization tolken
 * Returns: 200 on success.
 * Error: 401 if the auth_token doesn't authorize the operation.
 */
router.delete('/:username/:id', function(req, res) {
    
  var db = req.db;
  var username = req.params.username;
  var auth_token =  req.query.auth_token;
  var transactionId = req.params.id;
  
  accessControl.authorizeDelete(username, auth_token, 
      function onAllowed() {
        try {
          db.collection('transactions').remove({'_id':new ObjectId(req.params.id)}, {safe:true}, function(err, result) {
            if (err) {
              res.send(401);
            } else {
              gcmService.notifyUserMobiles(db,username);
              res.send(200);
            }
          });
        } catch (Exception) {
          res.send(401);
        }
      });
});

module.exports = router;
