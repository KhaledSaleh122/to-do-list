////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////////////////
import express from 'express';
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import passport from 'passport';
import { Strategy,ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv'
import User from './models/account.js'
/////////.env////////
dotenv.config()



///import allowed origins

import { allowedOrigins } from './config/allowedOrigins.js';

///
////////Mongoose Requires//////////////
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_LINK).catch((err) => { console.log(err) });
//////////////////////

///////Required express Files/////////
import account from './routers/account.js'
import task_operations from './routers/task_operations.js'
import subTask_operations from './routers/subtask_operations.js'
import { corsOptions } from './config/corsOptions.js';
//////////////

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser())



app.use(passport.initialize())

passport.use(new Strategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET
  }, (jwtPayload, done) => {
    // find the user in the database based on the JWT token
    User.findOne({username:jwtPayload.username})
      .then(user => {
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      })
      .catch(err => {
        return done(err, false);
      });
  }));

///////CORS
const credentials = (req,res,next)=>{
  const origin = req.headers.origin;
  if(allowedOrigins.includes(origin)){
    res.header('Access-Control-Allow_Credentials', true)
  }
  next()
}
app.use(credentials)
app.use(cors({origin: 'http://localhost:3000',
methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
allowedHeaders: ['Content-Type', 'Authorization']
}))

///////



const port = process.env.PORT|| 4000;
//////////////////
  app.listen(port, () => {
  console.log(`Server listening at ${port}`);

});

app.use('/account',account);
app.use('/task',task_operations);
app.use('/subtask',subTask_operations);

////////404 Not Found
app.use(function(req, res, next) {
    res.status(404).send('The page you looking for is not exisit.');
});