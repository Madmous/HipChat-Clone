'use strict';

const expressValidation = require ('express-validation');
const bodyParser        = require ('body-parser');
const passport          = require ('passport');
const express           = require ('express');
const winston           = require ('winston');
const helmet            = require ('helmet');

const signUpRoutes = require ('./api/v1/signUp/signUpRoutes');
const loginRoutes  = require ('./api/v1/login/loginRoutes');
const userRoutes   = require ('./api/v1/users/userRoutes');

const config  = require ('./config/config');
const dbTest  = require ('./config/dbTest');
const port    = require ('./config/config').port;
const cors    = require ('cors');
const log     = require ('./libs/winston')(module);
const db      = require ('./config/db');

const passportMiddleweare = require ('./utils/passportMiddleweare');

const app = express ();

app.use(cors());
app.use(passport.initialize());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.disable('x-powered-by');

app.use('/api/v1/signup', signUpRoutes);

app.use('/api/v1/login', passportMiddleweare.isAuthenticatedWithBasic, loginRoutes);

app.use('/api/v1/users', passportMiddleweare.isAuthenticatedWithToken, userRoutes);

app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
    const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');

    return res.status(err.status).json({
      message: unifiedErrorMessage
    });
  }
});

app.use((req, res) => {
	res.status(404).json({
		status: 404,
		message: 'The requested URL ' + req.originalUrl + ' was not found on the server.'
	});
});

let server = app.listen(port, (err) => {
  server.address().port;

  if (err) {
    log.error('something bad happened', err);
  } else if (process.env.NODE_ENV === 'test') {
     dbTest.connect();
  } else {
    db.connect();
  }

  log.info(`server is listening on ${port}`);
});

module.exports = server;