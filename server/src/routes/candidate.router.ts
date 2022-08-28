
import { Router, Request, Response } from 'express';
import CandidateService from '../services/candidate.service';

const candidateRouter = Router();

const candidateService = new CandidateService();

candidateRouter.get('/', async (request: Request, response: Response) => {
    const result = await candidateService.getCandidatesList();
    return response.json({candidates: result.candidates});
    
  });

candidateRouter.get('/leaderboard', async (request: Request, response: Response) => {
    const leaderBoard = await candidateService.getLeaderboard();
    return response.json({leaderboard: leaderBoard});
    
  });

  candidateRouter.post('/vote', async (request: Request, response: Response) => {
    const voted = await candidateService.vote(request.body);
    return response.json({voted: voted});
    
  });

export default candidateRouter;