import { Router } from "express";
import { userRegistrationHandler } from "../controllers/user.controller.js";
const userRouter = Router();
userRouter.post("/register", userRegistrationHandler);
export default userRouter;