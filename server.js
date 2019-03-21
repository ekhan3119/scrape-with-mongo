const express = require('express');

//initialize express
const app = express();
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

//const PORT = process.env.PORT || 8080;
const PORT = 8080;
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/scrapeWithMongo", { useNewUrlParser: true });
app.listen(PORT, () => {
    console.log(`Server is listening ${PORT}`);
});

