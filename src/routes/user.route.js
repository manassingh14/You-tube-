import { Router } from "express";
import { userRegistrationHandler } from "../controllers/user.controller.js";
import { upload } from "../middlewares/mullter.middleware.js";
const userRouter = Router();
userRouter.post("/register", upload.fields([
    {name:"avatar",maxCount:1},{name:"coverImage",maxCount:1 }
]), userRegistrationHandler);
export default userRouter;