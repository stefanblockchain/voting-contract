
import { Router, Request, Response } from 'express';
import CandidateService from '../services/candidate.service';

const candidateRouter = Router();

const candidateService = new CandidateService();

candidateRouter.get('/', async (request: Request, response: Response) => {
  const result = await candidateService.getCandidatesList();
  return response.json({ candidates: result.candidates });

});

candidateRouter.get('/leaderboard', async (request: Request, response: Response) => {
  try {
    const leaderBoard = await candidateService.getLeaderboard();
    return response.json({ leaderboard: leaderBoard });
  }
  catch (error: any) {
    console.error(`Leaderboard error occured: ${error.message}`);
    response.status(500).json({ message: 'Error occured in fetchin candidates leaderboard' });
  }
});

candidateRouter.post('/vote', async (request: Request, response: Response) => {
  try {
    const voted = await candidateService.vote(request.body);
    return response.json({ voted: voted });
  }
  catch (error: any) {
    console.error(`${error.message}`);
    response.json({ message: error.message });
  }
});

export default candidateRouter;