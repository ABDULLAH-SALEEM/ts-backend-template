import express, { Router } from 'express';
const router: Router = express.Router();
import authRouter from './auth';

router.use('/auth', authRouter);

export default router;
