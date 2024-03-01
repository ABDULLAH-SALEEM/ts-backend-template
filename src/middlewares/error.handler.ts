import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(err.status || 500);
  res.send(`<h1>${err.status || 500} Error</h1>` + `<pre>${err.message}</pre>`);
  next();
};

export default errorHandler;
