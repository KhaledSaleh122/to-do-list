////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
///////////////////////////////////////
import {createTask, updateTask} from '../controllers/task_operations'
//////////////////////
const router = express.Router();

router.post('/create',createTask);
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

router.patch('/update',updateTask)

//////////Exports
export default router