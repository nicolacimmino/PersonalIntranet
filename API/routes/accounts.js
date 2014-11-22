/* accounts.js is part of Personal Intranet API and is responsible to
 *      provide routing for API requests to the accounts resource.
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

/* HTTP GET /accounts/:username?auth_token=auth_token
 * Param username: the username of the user.
 * Param filter: comma separated list of wanted accounts.
 * Query param auth_token: a valid authoerization tolken
 * Returns: all accounts for the specified user.
 * Error: 401 if the auth_token doesn't authorize the operation.
 */
router.get('/:username', function(req, res) {
  
  var db = req.db;
  var accountsFilter = (req.query.filter || '').split(',');
 
  accessControl.authorizeRead(req.params.username, req.query.auth_token, function() {
        try {
              // Expenses transactions are booked as source,destination,amount. Each account balance is the
              //  sum of the amounts where that account was the destination minus the sum of
              //  the amounts where that account was the source. We make that calculation here using
              //  MongoDB map reduction. We:
              //  1) Define a mapping function that splits each transaction into two elements the first
              //     with the source as account and -amount as value, the second with destination as
              //     account and value as value. Here we also filter only the accounts requested
              //     by the caller.
              //  2) Define a reduction function where all elements with the same account have their
              //     amounts saved.
              //
              db.collection('transactions').mapReduce(
                function() {                                                        // Mapping function
                  if(accountsFilter.indexOf(this.source.toLowerCase()) > -1) { 
                    emit(this.source, -this.amount) 
                  };
                  if(accountsFilter.indexOf(this.destination.toLowerCase()) > -1) { 
                    emit(this.destination, this.amount); 
                  }      
                },    
                function(account, amounts) {                                        // Reduction function
                  return Array.sum(amounts); 
                },                            
                {                                                                   // Options
                  out : { inline : 1}, 
                  scope: { accountsFilter:accountsFilter}, 
                  query: { username:req.params.username} 
                },        
                function(e,docs,stats){                                             // Callback
                  try {
                    res.send( docs ); 
                  } catch (err) {
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