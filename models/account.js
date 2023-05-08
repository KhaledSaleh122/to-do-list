import mongoose from 'mongoose'
/////////schema and model//
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  fname: String,
  lname: String,
  createdDate : {type : Date,default:Date.now}
});
export default mongoose.model("account", userSchema);