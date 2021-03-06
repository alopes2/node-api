const path = require('path');
const fs = require('fs');

const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const keys = require('./config/keys');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

// -- This is only needed if you need to set this manually --
// -- Usually your hosting provider already sets SSL connection for public traffic -- 
// for generating the private key and the certificate use the following command with OpenSSL
// openssl req -nodes -new -x509 -keyout onfig/ssl/server.key -out onfig/ssl/server.cert
// const privateKey = fs.readFileSync(
//   path.join(__dirname, 'config/ssl/server.key')
// );
// const certificate = fs.readFileSync(
//   path.join(__dirname, 'config/ssl/server.cert')
// );

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs/access.log'),
  { flags: 'a' }
);

app.use(helmet());
app.use(compression());

// if you remove the second argument, logs will be written to the console
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(keys.mongoUri)
  .then(result => {
    const port = process.env.PORT || 8080;
    const server = app.listen(port, () => {
      console.log('-----------------------');
      console.log('Listening on port ' + port);
      console.log('-----------------------');
    });

    // Usually your hosting provider already sets https for public traffic
    // This is only needed if you need to set manually by some reason
    // const server = https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 8080, () => {
    //     console.log('Listening on port 8080');
    //   });

    const io = require('./socket').init(server);

    io.on('connection', socket => {
      console.log('Client connected')
    });
  })
  .catch(err => {
    console.log(err);
  });
