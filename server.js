const express = require('express');

//initialize express
const app = express();
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const db = require("./models");
const PORT = process.env.PORT || 8080;
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//set public as static folder
app.use(express.static("public"));
//connect to db
//const MONGODB_URI = process.env.MONGODB_URI || 

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrapeWithMongo";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(function () {
        console.log('MongoDB Conected....');
    })
    .catch(function (err) {
        console.log(err + 'Something went wrong!');
    });


//Routes

//Create GET route for buzzfeed
app.get('/scrape', function (req, res) {
    axios.get("https://www.nytimes.com/").then(function (res) {
        const $ = cheerio.load(res.data);
        $("article h2").each(function (i, ele) {
            let result = {};
            result.title = $(this).parent().text();
            result.link = $(this).children("a").attr("href");

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                }).catch(function (err) {
                    console.log(err);
                });
            res.send("I have scraped my first website");
        });
    });
});
// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});



//connect to server
app.listen(PORT, () => {
    console.log(`Server is listening ${PORT}`);
});

