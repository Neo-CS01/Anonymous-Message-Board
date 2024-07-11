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
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const rootDir = process.cwd();

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true // Ensure index creation during schema compilation
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if MongoDB connection fails
});

// Helmet middleware configurations
app.use(helmet({
  referrerPolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "sameorigin" }
}));

// Serving static files
app.use('/public', express.static(`${rootDir}/public`));

// CORS middleware (for FCC testing purposes only)
app.use(cors({ origin: '*' }));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample front-end routes
app.route('/b/:board/')
  .get((req, res) => res.sendFile(`${rootDir}/views/board.html`));

app.route('/b/:board/:threadid')
  .get((req, res) => res.sendFile(`${rootDir}/views/thread.html`));

// Index page (static HTML)
app.route('/')
  .get((req, res) => res.sendFile(`${rootDir}/views/index.html`));

// For FCC testing purposes
fccTestingRoutes(app);

// API routes
apiRoutes(app);

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start server and tests
const listener = server.listen(PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
  if (NODE_ENV === 'test') {
    console.log('Running Tests...');
    try {
      runner.run();
    } catch (e) {
      console.log('Tests are not valid:');
      console.error(e);
    }
  }
});

// Handle process termination gracefully
const exitHandler = terminate(server, { coredump: false, timeout: 500 });

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));

module.exports = server; // Export server for testing purposes
