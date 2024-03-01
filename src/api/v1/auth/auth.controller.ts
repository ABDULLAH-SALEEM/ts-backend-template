import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import authService from "@src/services/auth.service";
import { manageError } from "@src/helper/response.helper";
import { generateOTP } from "@src/util/util";
const signOptions: SignOptions = {
  expiresIn: process.env.TOKEN_EXPIRE_TIME,
};
const secret: string = process.env.JWT_SECRET || "";
const optLength = 8;
class Controller {
  async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.generateResponse(res, "", 400, "Missing required fields");
        return;
      }
      const user = await authService.login(req.body);
      const token = jwt.sign({ _id: user._id }, secret, signOptions);
      res.generateResponse(res, { token }, 200, "User logged in successfully!");
    } catch (error) {
      const err = manageError(error);
      res.generateResponse(res, "", err.code, err.message);
    }
  }

  async signup(req: Request, res: Response): Promise<any> {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        res.generateResponse(res, "", 400, "Missing required fields");
        return;
      }
      const userData = await authService.getOne({ email });
      if (userData) {
        res.generateResponse(res, "", 400, "Email alredy exists");
        return;
      }
      const otp = generateOTP(optLength);
      await authService.createOTP({ email, otp, userData: req.body });
      // Todo: add email service
      res.generateResponse(res, { otp }, 200, "This is your token for now.");
    } catch (error) {
      const err = manageError(error);
      res.generateResponse(res, "", err.code, err.message);
    }
  }

  async recoverAccount(req: Request, res: Response): Promise<any> {
    try {
      const { email } = req.body;
      if (!email) {
        res.generateResponse(res, "", 400, "Missing required fields");
        return;
      }
      const userData = await authService.getOne({ email });
      if (!userData) {
        res.generateResponse(res, "", 404, "Account not found");
        return;
      }
      const otp = generateOTP(optLength);
      await authService.createOTP({ email, otp });
      // Todo: add email service
      res.generateResponse(
        res,
        { otp },
        200,
        "Acc found. This is your token for now."
      );
    } catch (error) {
      const err = manageError(error);
      res.generateResponse(res, "", err.code, err.message);
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<any> {
    try {
      const { otp, email, verificationMode } = req.body;
      if (!otp || !email || !verificationMode) {
        res.generateResponse(res, "", 400, "Missing required fields");
        return;
      }
      const data = await authService.verifyOtp(req.body);
      if (data?.isNewUser) {
        res.generateResponse(
          res,
          {},
          200,
          "Account successfully created. you can login now."
        );
        return;
      }
      if (data?.isAccRecovery) {
        res.generateResponse(
          res,
          { token: data.token },
          200,
          "OTP verified. You can now reset password."
        );
        return;
      }
    } catch (error) {
      const err = manageError(error);
      res.generateResponse(res, "", err.code, err.message);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      const { password } = req.body;
      if (!password) {
        res.generateResponse(res, "", 400, "Missing required fields");
        return;
      }
      const data = await authService.updateOne({ _id: req.user._id }, req.body);
      res.generateResponse(res, data, 200, "Password changed successfully.");
    } catch (error) {
      const err = manageError(error);
      res.generateResponse(res, "", err.code, err.message);
    }
  }

  async authMe(req: Request, res: Response): Promise<any> {
    try {
      res.generateResponse(
        res,
        req.user,
        200,
        "Logged in user fetched successfully."
      );
    } catch (error) {
      const err = manageError(error);
      res.generateResponse(res, "", err.code, err.message);
    }
  }
}

export default new Controller();
