import { Router } from 'express';
import candidateRouter from './candidate.router';
import tokenRouter from './token.router';

const routes = Router();

routes.use('/candidate', candidateRouter);
routes.use('/token', tokenRouter);

export default routes;