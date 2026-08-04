import type { Request, Response } from 'express';
import app from '../src/server/app';

export default (req: Request, res: Response) => {
  if (req.url && !req.url.startsWith('/api/whois') && !req.url.startsWith('/whois')) {
    req.url = '/api/whois' + req.url;
  }
  return app(req, res);
};
