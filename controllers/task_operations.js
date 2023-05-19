import User from "../models/account.js"
import SubTask from "../models/subTask.js"
import Task from "../models/Task.js"
import mongoose from 'mongoose'

export async function createTask(req, res) {
    try {
        const user_id = req.user._id; //owner of task [change it as required]
        const { text } = req.body;
        const { index } = req.body; // this priority of task
        //check if index exist
        if(await Task.exists({index,user_id:user_id})){throw 'This priority already exists choose another'};
        if (!text) { throw 'To complete your request, please ensure that all required fields have been entered.' }
        const data = {
            user_id: user_id,
            text: text,
            index: index
        }
        await Task.create(data);
        res.send({ msg: 'You Successfully created new task.', result: 'Task Created' });
    } catch (err) {
        res.send({ error: err.toString() });
    }
}

export async function deleteTask(req, res) {
    try {
        const { task_id } = req.body;
        if (!task_id) { throw 'To complete your request, please ensure that all required fields have been entered.' }
        if (!await isIdValid(task_id)) { throw 'Please ensure that user id is valid.' }
        if (!await isTaskIdExist(task_id)) { throw 'Task not exists.' }
        ////////prevent access  on other users tasks
        if (!(await authUserFromTaskId(req, task_id))) { throw 'User is not Valid' }
        ////////
        //delete task
        const data = {
            _id: task_id
        }
        await Task.findOneAndDelete(data).exec();
        //Now delete sub tasks
        await SubTask.deleteMany({ parent_id: task_id });
        //
        res.send({ msg: 'You Successfully deleted the task.', result: 'Task Deleted' });
    } catch (err) {
        res.send({ error: err.toString() });
    }
}

export async function updateTask(req, res) {
    try {
        const { action } = req.body; //here what to update [text,index,status]
        const { task_id } = req.body; //task we want to update
        const { text } = req.body;
        const { status } = req.body;
        const index = Number(req.body.index);
        const user_id = req.user._id;
        console.log(action);
        if (!action || !task_id) { throw 'To complete your request, please ensure that all required fields have been entered.' }
        if (!await isTaskIdExist(task_id)) { throw 'Task not exists.' }
        ////////prevent access  on other users tasks
        if (!(await authUserFromTaskId(req, task_id))) { throw 'User is not Valid' }
        ////////
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
            let task = await Task.findOne({ _id: task_id }).exec();
            let indexedTask = await Task.updateOne({ index,user_id }, { index: task.index }).exec();
            task.index = index;

            await task.save();
        } else {
            throw 'Action required.'
        }
        await Task.findOneAndUpdate({ _id: task_id }, data).exec();
        res.send({ msg: 'You Successfully updated the task.', result: 'Task Updated' });
    } catch (err) {
        res.send({ error: err.toString() });
    }
}

export async function getTasks(req, res) {
    try {
        const user_id = req.user._id;
        const col_name = req.query.col_name || 'default';
        const order = Number(req.query.order); // if we want to specifiy asc desc 
        const sortOption = {};
        sortOption[col_name] = order || 1 // default is asc
        console.log(req.query)
        const tasks = await Task.find({ user_id: user_id })
            .sort(sortOption)
            .exec();
        res.send({ msg: 'Request Done Successfully', result: JSON.stringify(tasks) });
    } catch (err) {
        res.send({ error: err.toString() });
    }
}

///////////////functions
function isIdValid(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

async function isUserIdExist(id) {
    return await User.exists({ _id: id }).exec();
}
async function isTaskIdExist(id) {
    return await Task.exists({ _id: id }).exec();
}


function authUserFromUserId(req, user_id) {
    if (req.user._id == user_id) return true;
    else return false;
}
async function authUserFromTaskId(req, task_id) {
    let task = await Task.findById(task_id).exec();
    let user_id = task.user_id;
    if ((req.user._id).toString() == user_id.toString()) return true;
    else return false;
}

export { isIdValid, isUserIdExist, isTaskIdExist };
