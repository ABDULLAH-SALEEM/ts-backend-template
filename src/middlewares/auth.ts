import { Request, Response, NextFunction } from "express";
import authService from "@src/services/auth.service";
import jwt from "jsonwebtoken";

const secret: string = process.env.JWT_SECRET || "";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const unauthorizedErrorMsg: string = "Please provide a valid token!";
  const token: string | undefined = req.header("authorization");

  if (!token) {
    res.status(401).json({ message: unauthorizedErrorMsg });
    return;
  }

  try {
    if (token.includes("Bearer")) {
      const origirnalToken: string = token.split("Bearer ").pop() || "";
      const data: any = jwt.verify(origirnalToken, secret);
      const user = await authService.getOne(
        {
          _id: data._id,
        },
        { password: 0, createdAt: 0, updatedAt: 0, __v: 0 }
      );

      if (user && !data?.isAccRecovery) {
        req.user = {
          ...user.toJSON(),
        };
        next();
      } else if (data?.isAccRecovery && data._id) {
        req.user = {
          _id: data._id,
        };
        next();
      } else {
        res.status(401).json({ message: "Please verify your account!" });
        return;
      }
    } else {
      res.status(401).json({ message: unauthorizedErrorMsg });
    }
  } catch (error) {
    res.status(401).json({ message: unauthorizedErrorMsg });
  }
};

export default authMiddleware;
