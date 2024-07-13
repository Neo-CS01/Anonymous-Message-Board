'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server'); // Ensure the correct path to your server file
const Thread = require('../models/thread'); // Ensure the correct path to your Thread model

chai.use(chaiHttp);
const should = chai.should();

before(function(done) {
  this.timeout(5000); // Increase timeout to 5000ms
  mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Database connected');
      done();
    })
    .catch(err => {
      console.error('Database connection error:', err);
      done(err);
    });
});

describe('API Tests', function() {
  // Your tests go here
  it('should run a sample test', function(done) {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

after(function(done) {
  mongoose.connection.close(() => {
    console.log('Database connection closed');
    done();
  });
});
