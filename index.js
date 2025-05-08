const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// First api
app.get('/', function(req, res) {
    res.send("Hello");
});







const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('App is listening on port ' + listener.address().port)
});