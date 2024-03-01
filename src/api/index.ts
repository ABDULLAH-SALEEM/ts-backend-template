import express, { Request, Response, Router } from "express";
const router: Router = express.Router();

import v1 from "./v1";

router.use("/v1", v1);

router.get("/", (req: Request, res: Response) => {
  generateResponse(res, { data: "Yo ! what up" }, 200, "Got it successfully!");
});

function generateResponse(
  res: Response,
  data: any,
  statusCode: number,
  message: string
): void {
  res.status(statusCode).json({ data, message });
}

export default router;
