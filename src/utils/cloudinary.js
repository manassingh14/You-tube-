import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'my_cloud', 
  api_key: process.env.CLOUDINARY_API_KEY || 'my_key', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'my_secret'
});
const uploadImage = async (filePath) => {
    try {
        if(!filePath) return null;
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
        });
        return result;   
    }
    catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
};
export { uploadImage };