import User from "../models/account"
import SubTask from "../models/subTask" 
import Task from "../models/Task"

export async function createTask(req,res){
  try{
      const {user_id} = req.body; //owner of task [change it as required]
      const {text} = req.body;
      if(!user_id || !text){throw 'To complete your request, please ensure that all required fields have been entered.'}
      if(!isIdValid(user_id)){throw 'Please ensure that user id is valid.'}
      if(!isUserIdExist(user_id)){throw 'User not exists.'}
      //////////
      if(!authUserFromUserId(req,user_id)){throw 'User is not Valid'};
      /////////
    
      const index = await getMinNextIndex();//get mininmum next index; [Not finished yet]
      ////create task
      const data = {
          user_id : user_id,
          text: text,
          index:index
      } 
      await Task.create(data);
      ////
      res.send({msg:'You Successfully created new task.',result:'Task Created'});
  }catch(err){
      res.send({msg: err});
  }
}

export async function deleteTask(req,res){
  try{
      const {task_id} = req.body;
      if(!task_id){throw 'To complete your request, please ensure that all required fields have been entered.'}
      if(!isIdValid(task_id)){throw 'Please ensure that user id is valid.'}
      if(!isTaskIdExist(task_id)){throw 'Task not exists.'}
      ////////
      if(! (await authUserFromTaskId(req,task_id))){throw 'User is not Valid'}
      ////////
      //delete task
      const data = {
          _id : task_id
      }
      await Task.findOneAndDelete(data).exec();
      //Now delete sub tasks
      await SubTask.deleteMany({parent_id : task_id});
      //
      res.send({msg:'You Successfully deleted the task.',result:'Task Deleted'});
  }catch(err){
      res.send({msg: err});
  }
}

export async function updateTask (req,res){
  try{
      const {action} = req.body; //here what to update [text,index,status]
      const {task_id} = req.body; //task we want to update
      const {text} = req.body;
      const {status} = req.body;
      
      if(!action || !task_id){throw 'To complete your request, please ensure that all required fields have been entered.'}
      if(!isTaskIdExist(task_id)){throw 'Task not exists.'}
      ////////
      if(! (await authUserFromTaskId(req,task_id))){throw 'User is not Valid'}
      ////////
      var data = {};
      if(action === 'text'){
          if(!text){throw 'Text is required.'}
          data = {
              text : text,
              modified_date : Date.now()
          }
      }else if(action === 'status'){
          if(!status){throw 'Status is required.'}
          if(status !== 'uncompleted' && status !== 'completed' && status !== 'canceled'){throw 'Wrong status.'}
          data = {
              status : status,
              modified_date : Date.now(),
          }
          if(status === 'completed'){data.completed_date = Date.now()}
      }else if(action === 'index'){
          /////later we know how we will do it
           let task = await Task.findOne({_id:task_id});
           let indexedTask = await Task.updateOne({index},{task.index});
           task.index = index;
           await task.save();

      }else{
          throw 'Action required.'
      }
      console.log(data);
      await Task.findOneAndUpdate({_id:task_id},data);
      res.send({msg:'You Successfully updated the task.',result:'Task Updated'});
  }catch(err){
      res.send({msg: err});
  }
}

export async function getTasks(req,res){
  try{
      const {user_id} = req.body;//owner
      if(!user_id){throw 'User Id is required.'}
      if(!isIdValid(user_id)){throw 'Please ensure that user id is valid.'}
      if(!isUserIdExist(user_id)){throw 'User not exists.'}
      ////////
      if(! (await authUserFromTaskId(req,task_id))){throw 'User is not Valid'}
      ////////
      const col_name = req.body.col_name || 'default';
      const order = Number(req.body.order); // if we want to specifiy asc desc 
      const sortOption = {};
      sortOption[col_name] = order || 1
      const tasks = await Task.find({user_id:user_id})
      .sort(sortOption);
      res.send({msg:'Request Done Successfully',result: JSON.stringify(tasks)});
  }catch(err){
      res.send({msg: err});
  }
}

///////////////functions
function isIdValid(id){
  return mongoose.Types.ObjectId.isValid(id);
}

async function isUserIdExist(id){
  return await User.exists({_id : id}).exec();
}
async function isTaskIdExist(id){
  return await Task.exists({_id : id}).exec();
}


function authUserFromUserId(req,user_id){
    if(req.user._id == user_id) return true;
    else return false;
}
async function authUserFromTaskId(req,task_id){
    let task = await Task.findById(task_id);
    let user_id = task.user_id;
    if(req.user._id == user_id) return true;
    else return false;
}
    
export {isIdValid,isUserIdExist,isTaskIdExist};
