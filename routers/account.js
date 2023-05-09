////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
const router = express.Router();

import passport from 'passport';
////importing the Account Controller
import {postRegister,postLogin, handleRefershToken} from "../controllers/account.js"
////

///////////////Register///////////
router.post('/register',postRegister);

///////////Login////////
router.post('/login',postLogin);
router.get('/refresh',handleRefershToken)
//////////Exports
export default router