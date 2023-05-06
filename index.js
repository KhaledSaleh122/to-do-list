////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////////////////
import express from 'express';
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();
///////Required express Files/////////
import account from './routers/account/account.js'
///////////////
const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
/////////.env////////
const port = process.env.PORT|| 3000;
//////////////////
app.listen(port, () => {
    console.log("server started at port " + port);
});

app.use('/account',account);

////////404 Not Found
app.use(function(req, res, next) {
    res.status(404).send('The page you looking for is not exisit.');
});