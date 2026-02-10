import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyjwt=asyncHandler(async(req,res,next)=>{
try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    //console.log("COOKIES RECEIVED:", req.cookies);

    if(!token){
        throw new ApiError(404,"Unauthorized request");
    }
    const decode=jwt.verify(token ,process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decode?._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(401,"Invalid AccessToken");
    }
     req.user=user;
     next();
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid access Token");
}

})