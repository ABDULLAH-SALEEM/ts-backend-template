import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel, UserDocument } from "@src/models/user.model";
import { generateErrorObject } from "@src/helper/response.helper";
import { OTPDocument, OTPModel } from "@src/models/otp.model";
import { OTP_VERIFICATION_MODE } from "@src/common/enum";

interface OTPData {
  otp: string;
  email: string;
  userData?: UserDocument;
}

const secret: string = process.env.JWT_SECRET || "";
class AuthService {
  private dataHasher(data: string): string {
    const salt = bcrypt.genSaltSync(10);
    const hashedData = bcrypt.hashSync(data, salt);
    return hashedData;
  }

  private userDataToken(data: UserDocument): string {
    const token = jwt.sign(data, secret, {
      expiresIn: "3m",
    });
    return token;
  }

  getOne(filter: any, select: any = {}) {
    return UserModel.findOne(filter, select);
  }

  updateOne(filter: any, update: any) {
    if (update?.password) {
      update.password = this.dataHasher(update.password);
    }
    console.log(update);
    return UserModel.findOneAndUpdate(filter, update, { new: true });
  }

  create(data: UserDocument) {
    const { lastName, firstName, email, password } = data;
    const user = new UserModel({
      lastName,
      firstName,
      email,
      password: this.dataHasher(password),
    });
    return user.save();
  }

  createOTP(data: OTPData) {
    const { otp, email } = data;
    let userDataToken;
    if (data?.userData) {
      userDataToken = this.userDataToken(data.userData);
    }
    const otpDoc = new OTPModel({
      email,
      otp: this.dataHasher(otp),
      userToken: userDataToken,
    });
    return otpDoc.save();
  }

  async login(userData: { email: string; password: string }): Promise<any> {
    const errorMsg = "Invalid email or password!";
    const { email, password } = userData;
    const user = await this.getOne({ email });
    if (!user) {
      throw generateErrorObject(401, errorMsg);
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (comparePassword) {
      return user;
    }
    throw generateErrorObject(401, errorMsg);
  }

  async verifyOtp(data: any) {
    const { email, otp, verificationMode } = data;
    const otpData = await OTPModel.findOne({ email }).sort({ createdAt: -1 });
    if (!otpData) {
      throw generateErrorObject(404, "OTP not found.");
    }
    const isMatch = await bcrypt.compare(otp, otpData.otp);
    if (!isMatch) {
      throw generateErrorObject(404, "Invalid OTP");
    }

    if (verificationMode === OTP_VERIFICATION_MODE.NEW_USER) {
      const token: any = otpData.userToken;
      const data = jwt.verify(token, secret) as UserDocument;
      const user = this.create(data);
      return { user, isNewUser: true };
    }
    if (verificationMode === OTP_VERIFICATION_MODE.ACCOUNT_RECOVERY) {
      const user: any = await this.getOne({ email });
      const token = jwt.sign({ _id: user._id, isAccRecovery: true }, secret, {
        expiresIn: "5m",
      });
      return { isAccRecovery: true, token };
    }
    throw generateErrorObject(400, "Invalid option");
  }
}

export default new AuthService();
