import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import { uploadImage } from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken";

const generateAccessAndRefershToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }
        const accessToken =  user.generateAccessToken();
        const refreshToken =  user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("TOKEN GENERATION ERROR 👉", error.message);
       // throw new ApiError(500, "something went wrong");
       throw error; // DO NOT WRAP IT
    }
}

export const userRegistrationHandler = asyncHandler(async (req, res) => {
    // Registration logic here

    const { fullName, email, username, password } = req.body;
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existingUser) {
        throw new ApiError(409, "User with given email or username already exists");
    }
    // Check for avatar file presence and give clear error if missing
    const avatarLocalPath = req.files.avatar[0].path;
const coverImageLocalPath = req.files.coverImage?.[0]?.path;

    if (!req.files || !req.files.avatar || !Array.isArray(req.files.avatar) || !req.files.avatar[0]) {
        throw new ApiError(400, "Avatar file is required and must be uploaded with the field name 'avatar'.");
    }
    const avatar = await uploadImage(avatarLocalPath);
    //console.log("AVATAR UPLOAD RESULT:", avatar);
    const coverImage = await uploadImage(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");

    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "User registration failed, please try again later");
    }
    return res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser));


});
export const userLoginHandler = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!(username || email)) {
        throw new ApiError(400, "username or email are required");
    }
    const user = await User.findOne({
        $or: [{ username}, {email }]
    })
    if (!user) {
        throw new ApiError(404, "user not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefershToken(user._id);
    const options = {
        httpOnly: true,
        secure: false
    }
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
            200, {
            user: loggedInUser, accessToken, refreshToken
        },
            "User logged In successfully"
        )
    )





})
export const userLogout = asyncHandler(async(req,res)=>{
 User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        }
    },
    {
        new :true
    }
    
 )

    const options = {
        httpOnly: true,
        secure: false
    } 
   return  res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
    new ApiResponse(200,{},"User logged out")
   )
})

export const refresAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken=  req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"unaurthorized request");
    }
    try {
        const decodedToken= jwt.verify(incomingRefreshToken.process.env.REFRESH_TOKEN_SECRET);
        const user= decodedToken?._id;
        if(!user){
            throw new ApiError(401,"Invlaid RefreshToken");
        }
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"refreshToken Expired");
    
        }
        const options = {
            httpOnly: true,
            secure: false
        }
       const {accessToken,newRefreshToken}= await generateAccessAndRefershToken(user._id);
       return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options).json(
          new ApiResponse(200,
            {accessToken,newRefreshToken},"AccessToken Refreshed Successfully"
         )
       );
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid RefreshToken")
    }


})
export const changeCurrentPassword=asyncHandler(async(req,res)=>{
   const {oldpassword,newpassword} =  req.body;
   const user = await User.findById(req.user?._id);
   const comparePassword= await user.isPasswordCorrect(oldpassword);
   if(!comparePassword){
    throw new ApiError(400,"Incorrect Password");

   }
   user.password=newpassword;
   await user.save({validateBeforeSave: false});
   return res.status(200).json(
    new ApiResponse(200,{},"password changed succefully")
   );


})
export const geturrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,req.user,"succesfully fetched current user")
    )
})
export const upadteAccount = asyncHandler(async(req,res)=>{
    const {fullName,username} = req.body;
    if(!fullName || !username){
        throw new ApiError(400,"Enter fullName or email");
    }
  const user =  await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName,
            username
        }
    },{
        new : true
    }).select("-password")
    return res.status(200).json(
        new ApiResponse(200,user,"Account details updated succesfully")
    )
})
export const avatarUpdate=asuncHandler(async(req,res)=>{
   const avatarPath= req.file?.path;
   if(!avatarPath){
    throw new ApiError(400,"avatar feild is required");
   }
  const avatar=  await uploadImage(avatarPath);
  if(!avatar){
    throw new ApiError(400,"Error while uloading avatar");
  }
  const user = await User.findByIdAndUpdate(req.user?._id,{
    
    $set:{
        avatar:avatar.url
    }
  },{
    new :true
  }).select("-password")
  return res.status(200).json(
    new ApiResponse(200,user,"Avatar image is succefully updated")
  )
})
export const coverImageUpdate=asuncHandler(async(req,res)=>{
   const coverPath= req.file?.path;
   if(!coverPath){
    throw new ApiError(400,"cover feild is required");
   }
  const cover=  await uploadImage(coverPath);
  if(!cover){
    throw new ApiError(400,"Error while uloading coverImage");
  }
  const user = await User.findByIdAndUpdate(req.user?._id,{
    
    $set:{
        coverImage:cover.url
    }
  },{
    new :true
  }).select("-password")
  return res.status(200).json(
    new ApiResponse(200,user,"coverImage is succefully updated")
  )
})