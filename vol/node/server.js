const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')

const port = 3001

const corsOption = {
    origin: `http://localhost:${port}`,
    credential: true
};

app.use(cors(corsOption));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const api = require('./service/api');
app.use(api);

app.use(express.static(__dirname + '/www'));


app.listen(port, () => {
    console.log(`running on http://localhost:${port}`)
});

