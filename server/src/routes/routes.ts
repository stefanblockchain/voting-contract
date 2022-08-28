import { Router } from 'express';
import candidateRouter from './candidate.router';

const routes = Router();

routes.use('/candidate', candidateRouter);

export default routes;