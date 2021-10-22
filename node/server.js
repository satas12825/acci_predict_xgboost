const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')

app.use(cors());
app.options('*', cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const api = require('./service/api');
app.use(api);

app.use(express.static(__dirname + '/www'));

app.listen(3700, () => {
    console.log('running on http://localhost:3700')
});

