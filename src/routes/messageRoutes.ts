import { Router, type Request, type Response } from 'express';
import isAuthorized from '../validators/requests/isAuthorized';
import getErrorResponseJson from '../utils/getErrorResponseJson';

const router = Router();

router.get('', isAuthorized, (req: Request, res: Response) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    return getErrorResponseJson(error, res);
  }
});

export default router;
