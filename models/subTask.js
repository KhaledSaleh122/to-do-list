import mongoose from 'mongoose'
/////////schema and model//

const subTaskSchema = new mongoose.Schema({
  parent_id : {type : mongoose.Schema.Types.ObjectId,ref:'task'},
  text : String,
  index : Number,
  status: {type:String,default:"uncompleted"},
  modified_date : {type : Date,default:Date.now},
  completed_date : {type: Date},
  created_date : {type : Date,default:Date.now}
})

export default mongoose.model("subtask",subTaskSchema);