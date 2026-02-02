import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../../utils/supabaseClient';

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers['authorization'] ?? '';
    const refreshToken = req.headers['refresh-token'] ?? '';
    const accessToken = authHeader.replace('Bearer ', '');
    let errorMsg: string | undefined = undefined;

    if (accessToken && refreshToken) {
      const userData = await supabase.auth.getUser(accessToken);
      if (!userData.error && userData.data?.user?.aud === 'authenticated') {
        return next();
      }
      errorMsg = `Unauthorized request:\nAccessToken=${accessToken}\nRefreshToken=${refreshToken}\nUser Data:\n${userData}`;
    }

    errorMsg ??= `Unauthorized request: Invalid/missing access token and/or refresh token. Headers sent from request:\n${req.headers}`;
    console.log(errorMsg);
    return res.status(401).json({ message: 'Unauthorized request' });
  } catch (err) {
    console.log(`Error during authentication middleware: ${err}`);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
