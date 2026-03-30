import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiResponse } from "../helpers/ApiResponse.js";


const healthcheck = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,'OKay','The health check has been passed'))
})

export default healthcheck