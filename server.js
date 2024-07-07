'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const terminate = require('./terminate');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const rootDir = process.cwd();

// Security setup using Helmet
app.use(helmet({
  referrerPolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "sameorigin" },
  hidePoweredBy: { setTo: 'PHP 4.2.0' }, // Example of hiding X-Powered-By
  hsts: { maxAge: 63072000, includeSubDomains: true } // Example of HSTS
}));

// Middleware setup
app.use('/public', express.static(`${rootDir}/public`));
app.use(cors({ origin: '*' })); // For FCC testing purposes only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route for sample front-end
app.route('/b/:board/')
  .get((req, res) => res.sendFile(`${rootDir}/views/board.html`));

app.route('/b/:board/:threadid')
  .get((req, res) => res.sendFile(`${rootDir}/views/thread.html`));

// Route for index page
app.route('/')
  .get((req, res) => res.sendFile(`${rootDir}/views/index.html`));

// FCC testing routes
fccTestingRoutes(app);

// API routes
apiRoutes(app);

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start server and run tests if in test environment
const listener = app.listen(PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
  if (NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

// Graceful shutdown setup
const exitHandler = terminate(server, { coredump: false, timeout: 500 });

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));

module.exports = server; // for testing
