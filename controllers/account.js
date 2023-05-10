import User from '../models/account.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
export async function postRegister(req,res)
{
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
          password:bcrypt.hashSync(password,bcrypt.genSaltSync(10)),
      }
      ///Create Account Here
      const user = await User.findOne({user:username});
      if(user) return res.send({msg:'username is taken'})
      await User.create(data).then(()=>{
        res.send({msg:'You Successfully created an account.',result:'Account Created'});
      }).catch(err=>{
        return res.sendStatus(403)
      })
      ///
  }catch(err){
    res.send({ error: err.toString() });
  }
}

export async function postLogin(req,res){
  const {username} = req.body;
  const {password} = req.body;
  try{
      if(!username || !password){throw 'Please ensure that you enterd the username and the password'}
      ///Authtincate User Here
      let currentUser = await User.findOne({username:username});

      if(!currentUser) return res.send({msg:'No Such User'})

      if(!bcrypt.compareSync(password,currentUser.password)) return res.send({msg:"You've Entered a Wrong Password"});

      const accessToken = jwt.sign({username:currentUser.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn : '300m'})
      const refreshToken = jwt.sign({username:currentUser.username},process.env.REFRESH_TOKEN_SECRET,{expiresIn : '15d'})
      res.cookie('jwt',refreshToken,{httpOnly:true, maxAge: 15 * 24 * 60 * 60 * 1000, sameSite:'None',secure:true})
      res.json({accessToken}) //Send accessToken to front end
  }catch(err){
      res.send({ error: err.toString() });
  }
}


export  function handleRefershToken(req,res){
  const cookies = req.cookies;
  if(!cookies?.jwt) return res.sendStatus(401)
  const refreshToken = cookies.jwt;
  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,
              (err,decoded)=>{
                if(err) return res.sendStatus(403);
                const accessToken = jwt.sign({"username":decoded.username},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'300s'})
                res.json({accessToken})
              })
  const username = jwt.decode(refreshToken)
  const currentUser = User.find({username})
  if(!currentUser) return res.sendStatus(403);
  }


  export function logout(req,res){
    //delete the access token in the client
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);
    res.clearCookie('jwt',{httpOnly:true, sameSite : 'None', secure:true})
  }
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