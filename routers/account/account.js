////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();
////////Mongoose Requires//////////////
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_LINK).catch((err) => { console.log(err) });
//////////////////////
const router = express.Router();
/////////////////////////.env
/////////schema and model//
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    fname: String,
    lname: String,
    createdDate : {type : Date,default:Date.now}
});

const User = new mongoose.model("account", userSchema);
///////////////Register///////////
router.post('/register',async (req,res)=>{
    console.log(req.body);
    const {firstname} = req.body;
    const {lastname} = req.body;
    const {email} = req.body;
    const {username} = req.body;
    const {password} = req.body;
    const {confirm_password} = req.body;
    try{
        if(!firstname || !lastname || !email || !username || !password || !confirm_password){throw 'To complete your request, please ensure that all required fields have been entered.'}
        if(!isNameValid(firstname)){throw 'Please ensure that the first name field only contains letters, and less than 25 character.'}
        if(!isNameValid(lastname)){throw 'Please ensure that the first name field only contains letters, and less than 25 character.'}
        if(!isEmailValid(email)){throw 'Please enter a valid email address in the correct email format.'}
        if(!isUserNameValid(username)){throw 'Please ensure that the Username field only contains letters and numbers.'}
        if(!isPasswordLengthValid(password)){throw 'Please ensure that password length more than 5 characters.'}
        if(!isPasswordConfimared(password,confirm_password)){throw 'Please ensure that password and confirm password is same.'}
        const data = {
            username:username,
            fname:firstname,
            lname:lastname,
            email:email,
            password:password,
        }
        ///Create Account Here
        
        ///
        res.send({msg:'You Successfully created an account.',result:'Account Created'});
    }catch(err){
        res.send({msg: err});
    }
});
///////////Login////////
router.post('/login',async(req,res)=>{
    const {name} = req.body;
    const {password} = req.body;
    try{
        if(!name || !password){throw 'Please ensure that you enterd the username and the password'}
        ///Authtincate User Here
        ///
        res.send({msg:'You Successfully login to your account.',result:'User Authtintcated'});
    }catch(err){
        res.send({msg: err});
    }
});



//////////////functions
function isNameValid(name){
    return !(/[^A-Za-z]/g.test(name)) && name.length < 25;
}


function isEmailValid(email){
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && email.length < 50;
}

function isUserNameValid(username){
    const hasNonAlphaNumericChars = /[^A-Za-z0-9]/g.test(username);
    return (!hasNonAlphaNumericChars) && username.length < 25;
}

function isPasswordLengthValid(password){
    return (password.length >= 6);
}

function isPasswordConfimared(password,cpassword){
    return password === cpassword;
}
//////////Exports
export default router
export {User}
