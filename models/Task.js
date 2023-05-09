import mongoose from 'mongoose'


/////////schema and model//
const taskSchema = new mongoose.Schema({
  user_id : {type : mongoose.Schema.Types.ObjectId,ref:'account'},//owner of task
  text : {type: String},//task text
  status: {type:String,default:'uncompleted'}, // status uncompleted,completed,canceled
  index : Number,
  modified_date : {type : Date,default:Date.now}, //updated when ever you edit task
  completed_date : {type: Date}, // when task completes update this
  created_date : {type : Date,default:Date.now}//when task created
});
export default  mongoose.model("task", taskSchema);
////////////////////////////////