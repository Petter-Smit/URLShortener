require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(function(req, res, next){
  console.log(`${req.method}`);
  next();
})

// short url = index, long url = entry
let savedURLs = [];

app.post('/api/:shorturl?', (req, res) => {
  let hostNameVar = new URL(req.body.url).hostname;
  let url = req.body.url;
  dns.lookup(hostNameVar, {family: 4}, (error) => {
    if (error) {
      res.json({ error: 'invalid url' });
    } else {
      let index = savedURLs.findIndex((e) => e === url);
      if (index !== -1) {
        res.json({"original_url" : savedURLs[index], "short_url" : index});
      } else {
        savedURLs.push(url);
        console.log(savedURLs);
        res.json({"original_url" : url, "short_url" : savedURLs.length-1})
      }
    }
  });
})

app.get('/api/shorturl/:id?', (req, res) => {
  console.log('Getting');
  index = req.originalUrl.slice(14)
  if (index < savedURLs.length){
    res.redirect(301, savedURLs[index]);
  } else {
    res.json({error: 'bad request'});
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
