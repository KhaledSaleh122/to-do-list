////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
import passport from 'passport';
import {createTask,deleteTask,getTasks,updateTask} from "../controllers/task_operations.js"
//////////////////////
const router = express.Router();


////////////////////////////////
router.post('/create',passport.authenticate('jwt', { session: false }),createTask);
///only delete one task
router.delete('/delete',passport.authenticate('jwt', { session: false }),deleteTask);

router.patch('/update',passport.authenticate('jwt', { session: false }),updateTask);

router.get('/',passport.authenticate('jwt', { session: false }),getTasks)


//////////Exports
export default router
