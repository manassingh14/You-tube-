import { Router } from "express";
import { userLoginHandler, userRegistrationHandler,userLogout,refresAccessToken, changeCurrentPassword, getCurrentUser, upadteAccount,avatarUpdate, coverImageUpdate, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/mullter.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();
userRouter.post("/register", upload.fields([
    {name:"avatar",maxCount:1},{name:"coverImage",maxCount:1 }
]), userRegistrationHandler);
userRouter.post("/login",userLoginHandler);
userRouter.post("/logout",verifyjwt,userLogout);
userRouter.post("/refres-Token",refresAccessToken);
userRouter.post("/change-password",verifyjwt,changeCurrentPassword);
userRouter.get("/current-user",verifyjwt,getCurrentUser);
userRouter.patch("/update-account",verifyjwt,upadteAccount);
userRouter.patch("/update-avatar",verifyjwt,upload.single("avatar"),avatarUpdate);
userRouter.patch("/cover-image",verifyjwt,upload.single("/coverImage"),coverImageUpdate);
userRouter.get("/channel/:username",verifyjwt,getUserChannelProfile);
userRouter.get("/watch-history",verifyjwt,getWatchHistory)
export default userRouter;