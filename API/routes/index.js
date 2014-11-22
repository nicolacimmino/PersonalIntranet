/* index.js is part of Pesonal Intranet API and is responsible to
 *      provide routing for API requests to the index resource.
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

/* GET root document. 
   This is not technically part of the API but can be used as
   an info page with some information on the API meant for human
   readers.
*/
router.get('/', function(req, res) {
  res.render('index', { title: 'Expenses Tracker API' });
});

module.exports = router;
