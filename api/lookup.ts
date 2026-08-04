import type { Request, Response } from 'express';
import app from '../src/server/app';

export default (req: Request, res: Response) => {
  if (!req.url || req.url === '/' || req.url === '/lookup' || req.url === '/api/lookup') {
    req.url = '/api/lookup';
  }
  return app(req, res);
};
