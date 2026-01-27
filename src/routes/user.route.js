import { Router } from "express";
import { userLoginHandler, userRegistrationHandler,userLogout } from "../controllers/user.controller.js";
import { upload } from "../middlewares/mullter.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();
userRouter.post("/register", upload.fields([
    {name:"avatar",maxCount:1},{name:"coverImage",maxCount:1 }
]), userRegistrationHandler);
userRouter.post("/login",userLoginHandler);
userRouter.post("/logout",verifyjwt,userLogout);
export default userRouter;