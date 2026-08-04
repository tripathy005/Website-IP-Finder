import type { Request, Response } from 'express';
import app from '../src/server/app';

export default (req: Request, res: Response) => {
  return app(req, res);
};
