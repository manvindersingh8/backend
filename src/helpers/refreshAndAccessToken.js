import { User } from "../models/User.js"
import { ApiError } from "./ApiError.js"
import { ApiResponse } from "./ApiResponse.js"
import { asyncHandler } from "./asyncHandler.js"
import jwt from 'jsonwebtoken'

const refreshAndAccessToken = async (userId) =>{
    if(!userId){
        throw new ApiError(400,'Error generating tokens')
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404,'User not found')
    }

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return {accessToken,refreshToken}
}


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRequest = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRequest){
        throw new ApiError(401,'Unauthorized request')
    }
    const decodedToken = jwt.verify(incomingRequest,process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)

    if(!user){
        throw new ApiError(401,'invalid refresh request')
    }

    if(user.refreshToken !== incomingRequest){
        throw new ApiError(401 ,'refresh token mismathc')

    }

    const {accessToken,refreshToken} = await refreshAndAccessToken(user._id)

    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie('accessToken',accessToken,options)
    .cookie('refreshToken',refreshToken,options)
    .json(new ApiResponse(200,'Access Token refreshed'))


})
export {refreshAndAccessToken,refreshAccessToken}