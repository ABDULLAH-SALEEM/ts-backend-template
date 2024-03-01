import { Request, Response, NextFunction } from 'express';

const hasAccess = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return res.status(403).json({ message: 'Access Denied!' });
    }
  };
};

export default hasAccess;
