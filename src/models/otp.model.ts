import mongoose, { Document, Schema } from "mongoose";

interface OTPDocument extends Document {
  email: string;
  otp: string;
  userToken?: string;
  createdAt: Date;
}

const OTPSchema: Schema<OTPDocument> = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  userToken: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 120 }, // document will automatically be deleted after three mins
});

const OTPModelName = "otp";

const OTPModel = mongoose.model<OTPDocument>(OTPModelName, OTPSchema);

export { OTPModel, OTPModelName, OTPDocument };
