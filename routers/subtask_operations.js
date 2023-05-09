////////ES6 __dirname + __filename///////////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
////////Every File need this////////////
import express from 'express';
import passport from 'passport';
import { createSubTask, deleteSubTask, getSubTask, updateSubTask } from '../controllers/subtask_operations.js';

//////////////////////
const router = express.Router();
/////////////////////////.env



////////////////////////////////
router.post('/create',passport.authenticate('jwt', { session: false }),createSubTask);

router.delete('/delete',passport.authenticate('jwt', { session: false }),deleteSubTask);

router.patch('/update',passport.authenticate('jwt', { session: false }),updateSubTask)



router.get('/',passport.authenticate('jwt', { session: false }),getSubTask)


//////////Exports
export default router
