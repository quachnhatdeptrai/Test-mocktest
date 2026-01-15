/**
* RMIT University Vietnam
* Course: COSC3060 Web Programming Studio
* Semester: 2025B
* Assessment: Fullstack in-class Lab Test
* Author: Your names (e.g. Nguyen Van Minh)
* ID: Your student ids (e.g. s1234567)
* Acknowledgement: Acknowledge the resources that you use here.
*/

// Declare packages used for this server file
const express = require('express');
require('dotenv').config();
const path = require('path');

// Setup server
const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets
app.use(express.static(path.join(__dirname, 'materials/public')));

/** Routes */
// Homepage endpoint that when accessed will produce a random reading list for a week
app.get('/', function (req, res) {
    res.render('list');
})

// Book endpoint that when accessed will show detail information about a book and related books found in the database
app.get('/book/:title', function (req, res) {
    res.render('book');
});

// Port number
const port = process.env.PORT || 4000;

// Start the server
app.listen(port, () => {
    console.log(`Server started and is running on: http://localhost:${port}`);
});