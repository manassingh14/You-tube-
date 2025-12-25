import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import {uploadImage} from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

export const userRegistrationHandler = asyncHandler(async (req, res) => {
    // Registration logic here
   
   const {fullName, email, username, password} = req.body;
   if([fullName, email, username, password].some((field) => field?.trim() ==="")){
            throw new ApiError(400,"All fields are required");
   } 
  const existingUser = await User.findOne({
    $or:[{email},{username}]
})
    if(existingUser){
        throw new ApiError(409,"User with given email or username already exists");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }
    const avatar = await uploadImage(avatarLocalPath);
    console.log("AVATAR UPLOAD RESULT:", avatar);
    const coverImage = await uploadImage(coverImageLocalPath);
    if(!avatar){
        //throw new ApiError(400,"Avatar file is required");

    }
   

  const user= await User.create({
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
    if(!createdUser){
        throw new ApiError(500,"User registration failed, please try again later");
    }
    return res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser));
   
   
});