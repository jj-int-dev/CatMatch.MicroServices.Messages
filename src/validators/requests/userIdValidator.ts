import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../../utils/supabaseClient';

/**
 *
 * @param req the request
 * @param res the response
 * @param next the function that releases control to the next middleware or route handler
 * @returns
 */
export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.params.userId;

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    console.log(`Invalid user ID: ${userId}`);
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const authHeader = req.headers['authorization'] as string;
    const accessToken = authHeader.replace('Bearer ', '');

    const userData = await supabase.auth.getUser(accessToken);
    if (
      !userData.error &&
      userData.data?.user?.aud === 'authenticated' &&
      userData.data?.user?.id === userId
    ) {
      return next();
    }

    console.log(
      `The user ID from the request URL does not match the user ID derived from the access token.` +
        `\nUser ID from request URL: ${userId}\nAccess token from request headers: ${accessToken}` +
        `\nUser data derived from access token:\n${userData}`
    );

    return res.status(401).json({ message: 'Insufficient access' });
  } catch (err) {
    console.log(
      `Error during user ID validation middleware: ${(err as Error).message}`
    );
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
