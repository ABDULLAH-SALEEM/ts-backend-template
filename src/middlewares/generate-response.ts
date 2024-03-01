import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Response {
      generateResponse?: any;
    }
  }
}

const generateResponse = (
  res: Response,
  data: any,
  statusCode: number,
  message: string,
  respType: string = 'json',
) => {
  const responseObject: any = {};
  responseObject.data = data || '';
  responseObject.message = message || '';
  if (respType === 'raw') {
    return res.status(statusCode).send(data);
  } else {
    res.status(statusCode).json(responseObject);
  }
};

const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  res.generateResponse = generateResponse;
  next();
};

export default responseHandler;
