'use strict';

const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const chai     = require('chai');

const models = require('../../src/models/index');

const userModel = models.userModel;

const log = require('../../src/libs/winston')(module);
const app	= require('../../src/index');

chai.use(chaiHttp);

const loginUrl = '/api/v1/login/';
const assert   = chai.assert;

describe('Login' , () => {

  before(done => {
    const userTest = new userModel({
      name: 'testName',
      fullname: 'testFullname',
      password: 'testPassword',
      initials: 'testInitials',
      email: 'testEmail@email.com'
    });

    userTest.save(err => {
      done();
    });
  });

	after(done => {
		userModel.find().remove().exec();

		done();
	});

	describe('/POST', () => {

		it ('should login - success', done => {
			chai.request(app)
				.post(loginUrl)
				.auth('testName', 'testPassword')
				.end((err, res) => {
					assert.equal(res.status, '200', 'status equals 200');

					done();
				});
		});

		it ('should login - fail', done => {
			chai.request(app)
				.post(loginUrl)
				.auth('testName')
				.end((err, res) => {
					assert.equal(res.status, '401', 'status equals 401 because second argument is missing');

					done();
				});
		});

		it ('should login - fail', done => {
			chai.request(app)
				.post(loginUrl)
				.auth('name', 'testPassword')
				.end((err, res) => {
					assert.equal(res.status, '401', 'status equals 401 because username is invalid');

					done();
				});
		});

    it ('should login - fail', done => {
			chai.request(app)
				.post(loginUrl)
				.auth('testName', 'password')
				.end((err, res) => {
					assert.equal(res.status, '401', 'status equals 401 because password is invalid');

					done();
				});
		});

    it ('should login - fail', done => {
			chai.request(app)
				.post(loginUrl)
				.end((err, res) => {
					assert.equal(res.status, '401', 'status equals 401 because arguments are missing');

					done();
				});
		});
	});
});