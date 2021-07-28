const path = require('path');
const express = require('express');
const { config } = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const expressSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const xss = require('xss-clean');
const { limitRequest } = require('../middleware/rateLimiter.mw');
const hpp = require('hpp');
const cors = require('cors');
var userAgent = require('express-useragent');

// files
const errorHandler = require('../middleware/error.mw');

//load the config file
// dotenv.config({ path: './config/.env' });
config();

// route files
const v1Routers = require('../routes/v1/routes.router');

const app = express();

//set the view engine
app.set('view engine', 'ejs');

// cookie parser
app.use(cookieParser());

// body parser
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: false }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json 
app.use(bodyParser.json());

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/*+json' }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  // app.use(logger); // custom logger
}

// File upload  :set the options
app.use(fileupload({useTempFiles: true, tempFileDir: path.join(__dirname,'tmp')}));

// const upload = multer({ dest: 'tmp/csv/' });

// Sanitize data
// Secure db against SQL injection
app.use(expressSanitize());

// Set security headers ::: adds more headers
app.use(helmet());

// Prevent cross-site scripting attacks
app.use(xss());

// Rate limiting
// Make 100 requests in 10 mins
app.use(limitRequest);

// Prevent http parameter pollution
app.use(hpp());

// Enable CORS
// Communicate with API on multiple domains
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// user agent
app.use(userAgent.express());

//Mount Routers
app.get('/', (req, res, next) => {

  res.status(200).json({
    status: 'success',
    data: {
      name: 'todo-todo-service',
      version: '0.1.0'
    }
  })
  
});

app.use('/api/todo/v1', v1Routers);

// error handler must be after you mount routers
app.use(errorHandler);

module.exports = app;