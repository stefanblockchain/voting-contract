
import { Router, Request, Response } from 'express';
import WKNDContractService from '../services/wknd.contract.service';

const tokenRouter = Router();

const wkndContractService = new WKNDContractService();

tokenRouter.post('/claim', async (request: Request, response: Response) => {
  try {
    await wkndContractService.claimToken(request.body.address);
    return response.json({ message: 'Claimed token' });
  }
  catch (error: any) {
    console.error(`${error.message}`);
    response.json({ message: error.message });
  }
});

export default tokenRouter;