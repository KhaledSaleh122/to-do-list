import User from "../models/account.js";
import { isUserIdExist, isTaskIdExist, isIdValid } from "../controllers/task_operations.js";
import Task from "../models/Task.js";
import SubTask from "../models/subTask.js";
import mongoose from 'mongoose'
export async function createSubTask(req, res) {
    try {
        const user_id = req.user._id
        const { task_id } = req.body;
        const { index } = req.body;
        const {status} = req.body;
        if (!task_id) { throw 'Task Id is required.' }
        if (!isIdValid(task_id)) { throw 'Please ensure that user id is valid.' }
        if (!isTaskIdExist(task_id)) { throw 'Task not exists.' }
        if(await SubTask.exists({index,parent_id:task_id})){throw 'This priority already exists choose another'};
        ////////////prevent access  on other users tasks
        if (!(await authUser(req, task_id))) { throw 'User is not Valid' };
        ////////////
        const { text } = req.body;
        ////create task
        const data = {
            parent_id: task_id,
            text: text,
            index: index,
            status:status
        }
        await SubTask.create(data);
        ////
        res.send({ msg: 'You Successfully created new sub task.', result: 'SubTask Created' });
    } catch (err) {
        res.send({ error: err.toString() });
    }
}

export async function deleteSubTask(req, res) {
    try {
        const { task_id } = req.body;
        if (!task_id) { throw 'To complete your request, please ensure that all required fields have been entered.' }
        if (!isIdValid(task_id)) { throw 'Please ensure that user id is valid.' }
        if (!isSubTaskIdExist(task_id)) { throw 'Task not exists.' }
        /////////prevent access  on other users tasks
        const subTask = await SubTask.findOne({_id : task_id});
        if (!(await authUser(req, subTask.parent_id))) { throw 'User is not Valid' };
        /////////
        //delete sub task
        const data = {
            _id: task_id
        }
        await SubTask.findOneAndDelete(data).exec();
        res.send({ msg: 'You Successfully deleted the subtask.', result: 'SubTask Deleted' });
    } catch (err) {
        res.send({ error: err.toString() });
    }
}

export async function updateSubTask(req, res) {
    try {
        const { action } = req.body; //here what to update [text,index,status]
        const { task_id } = req.body; //task we want to update
        const { text } = req.body;
        const { status } = req.body;
        const {parent_id} = req.body;
        const index = Number(req.body.index);
        console.log(req.body);
        if (!action || !task_id) { throw 'To complete your request, please ensure that all required fields have been entered.' }
        if (!isSubTaskIdExist(task_id)) { throw 'Task not exists.' }
        ////////////prevent access  on other users tasks
        const subTask = await SubTask.findOne({_id : task_id});
        if (!(await authUser(req, subTask.parent_id))) { throw 'User is not Valid' };
        ////////////
        var data = {};
        if (action === 'text') {
            if (!text) { throw 'Text is required.' }
            data = {
                text: text,
                modified_date: Date.now()
            }
        } else if (action === 'status') {
            if (!status) { throw 'Status is required.' }
            if (status !== 'uncompleted' && status !== 'completed' && status !== 'canceled') { throw 'Wrong status.' }
            data = {
                status: status,
                modified_date: Date.now(),
            }
            if (status === 'completed') { data.completed_date = Date.now() }
        } else if (action === 'index') {
            if (index <= 0) { throw 'Index is required.' }
            let task = await SubTask.findOne({ _id: task_id }).exec();
            let indexedTask = await SubTask.updateOne({ index,parent_id }, { index: task.index }).exec();
            task.index = index;
            await task.save();

        } else {
            throw 'Action required.'
        }
        await SubTask.findOneAndUpdate({ _id: task_id }, data).exec();
        res.send({ msg: 'You Successfully updated the subtask.', result: 'SubTask Updated' });
    } catch (err) {
        res.send({ error: err.toString() });
    }
}

export async function getSubTask(req, res) {
    try {
        const  task_id  = req.query.task_id;
        if (!task_id) { throw 'Task Id is required.' }
        if (!isIdValid(task_id)) { throw 'Please ensure that user id is valid.' }
        if (!isTaskIdExist(task_id)) { throw 'Task not exists.' }
        /////////
        if (!(await authUser(req, task_id))) { throw 'User is not Valid' };
        /////////
        const col_name = req.query.col_name || 'default';
        const order = Number(req.query.order); // if we want to specifiy asc desc 
        const sortOption = {};
        sortOption[col_name] = order || 1;
        const tasks = await SubTask.find({ parent_id: task_id })
            .sort(sortOption)
            .exec();
        res.send({ msg: 'Request Done Successfully', result: JSON.stringify(tasks) });
    } catch (err) {
        res.send({ error: err.toString() });
    }
}

/////////////////////functions
async function isSubTaskIdExist(id) {
    return await SubTask.exists({ _id: id }).exec();
}

async function authUser(req, task_id) {
    let task = await Task.findById(task_id).exec();
    let user_id = task.user_id;
    if (req.user._id.toString() == user_id.toString()) return true;
    else return false;
}