import {asyncHandler} from '../utils/asyncHandler.js';

export const userRegistrationHandler = asyncHandler(async (req, res) => {
    // Registration logic here
    res.status(201).json({ message: 'User registered successfully' });
});