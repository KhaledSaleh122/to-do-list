////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();
///////////////////////////////////////
import { User } from '../account/account';
////////Mongoose Requires//////////////
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_LINK).catch((err) => { console.log(err) });
//////////////////////
const router = express.Router();
/////////////////////////.env
/////////schema and model//
const taskSchema = new mongoose.Schema({
    user_id : {type : Schema.Types.ObjectId,ref:'account'},//owner of task
    text : {type: String},//task text
    status: {type:String,default:'uncompleted'}, // status uncompleted,completed,canceled
    index : Number,
    modified_date : {type : Date,default:Date.now}, //updated when ever you edit task
    completed_date : {type: Date}, // when task completes update this
    created_date : {type : Date,default:Date.now}//when task created
});

const Task = new mongoose.model("task", taskSchema);
////////////////////////////////
router.post('/create',async(req,res)=>{
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
});
///only delete one task
router.delete('/delete',async(req,res)=>{
    try{
        const {task_id} = req.body;
        if(!task_id){throw 'To complete your request, please ensure that all required fields have been entered.'}
        if(!isIdValid(task_id)){throw 'Please ensure that user id is valid.'}
        if(!isTaskIdExist(task_id)){throw 'Task not exists.'}
        //delete task
        const data = {
            _id : task_id
        }
        await Task.findOneAndDelete(data).exec();
        //Now delete sub tasks
        //
        res.send({msg:'You Successfully deleted the task.',result:'Task Deleted'});
    }catch(err){
        res.send({msg: err});
    }
});

router.patch('/update',async(req,res)=>{
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
})
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
//////////Exports
export default router