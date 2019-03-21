const express = require('express');

//initialize express
const app = express();
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const db = require("./models");
//const PORT = process.env.PORT || 8080;
const PORT = 8080;
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//set public as static folder
app.use(express.static("public"));
//connect to db
//const MONGODB_URI = process.env.MONGODB_URI || 
mongoose.connect("mongodb://localhost/scrapeWithMongo", { useNewUrlParser: true })
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
        $("article").each(function (i, ele) {
            let result = {};
            result.title = $(this).children("a").text();
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



//connect to server
app.listen(PORT, () => {
    console.log(`Server is listening ${PORT}`);
});

