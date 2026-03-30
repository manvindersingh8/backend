import mongoose from "mongoose";

const connectDB= async function () {
    try {
        const connection = mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB conneciton successfull')
    } catch (error) {
        console.log(` MongoDB connection failed, ${error}`)
        process.exit(1) 
    }
}

export default connectDB