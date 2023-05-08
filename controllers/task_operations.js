import User from '../models/account'

export async function createTask(req,res){
  try{
      const {user_id} = req.body; //owner of task [change it as required]
      const {text} = req.body;
      if(!user_id || !text){throw 'To complete your request, please ensure that all required fields have been entered.'}
      if(!isIdValid(user_id)){throw 'Please ensure that user id is valid.'}
      if(!isUserIdExist(user_id)){throw 'User not exists.'}
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

export async function updateTask(req,res){
  try{
      const {action} = req.body; //here what to update [text,index,status]
      const {task_id} = req.body; //task we want to update
      const {text} = req.body;
      if(!action || !task_id){throw 'To complete your request, please ensure that all required fields have been entered.'}
      if(action === 'text'){
          if(!text){throw 'Text is required.'}
          const data = {
              text : text,
              modified_date : Date.now()
          }
          await Task.findOneAndUpdate({_id:task_id},data);
          res.send({msg:'You Successfully updated the task.',result:'Task Updated'});
      }else{
          throw 'Action required.'
      }
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