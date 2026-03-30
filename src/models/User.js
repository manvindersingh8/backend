import mongoose, { Schema } from "mongoose";
import { ROLES } from "../constants/constants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      minLength: 6,
      maxLength: 32,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^[\w.-]+@[\w.-]+\.\w{2,4}$/, "Please enter a valid email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 chars"],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.JOBSEEKER,
    },
    refreshToken: {
      type: String,
    },
    fullname: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

userSchema.set('toJSON',{
    transform:(doc,ret)=>{
        delete ret.refreshToken
        delete ret.password
        return ret
    }
})

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  return (this.password = await bcrypt.hash(this.password, 10));
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username.toLowerCase(),
      email: this.email.toLowerCase(),
      role: this.role.toLowerCase(),
      fullname: this.fullname.toLowerCase(),
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id
    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User = mongoose.model('User',userSchema)