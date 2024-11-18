const express=require("express");
const asyncHandler=require("express-async-handler");
// const { use } = require("../routes/userRoutes");
const User=require("../models/userModels.js");  
const jwt=require("jsonwebtoken") //16
const bcrypt= require("bcrypt");
const nodemailer=require("nodemailer");
const randomstring=require("randomstring");
const dotenv=require("dotenv").config();//3
const { google } = require('googleapis');

//Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

//@desc Register a User
//@route POST /api/user/register
//@access public

const registerUser=asyncHandler (async (req,res)=>{

    const{username,email,password}=req.body;    //15.1

    if(!username || !email.endsWith('@gmail.com') || !password){
        res.status(400);
        throw new Error("All fields are mandatory and only gmail users are allowed");

    }
    //Checking if we already have an existing database for that email

    const userAvailable=await User.findOne({email}) //using .findOne we get the same email and if it's true then the user already present
    if(userAvailable){
        res.status(400);
        throw new Error("User already present");
    }

    //15.2
            //Creating a new user
    // Hash password
    const hashedPassword= await bcrypt.hash(password,10);

    const user= await User.create({
        username,
        email,  
        password:hashedPassword
    });


    console.log(`User created ${user}`);

    //Sending information to the useruser but not sharing the password
    if(user){
        res.status(200).json({_id:user.id,email:user.email});
    }
    else{
        res.status(400);
        throw new Error("User data not valid");
    }

    res.json({message:"Register the user"});
});  //After async rest all copied and pasted form userRoutes and the same is for all


//@desc Login a User
//@route POST /api/User/login
//@access public
const loginUser=asyncHandler (async (req,res)=>{

    const{email,password}=req.body
    if(!email || !password){
        res.status(400);
        throw new Error("All fields are mandatory");

    }
    const user=await User.findOne({email})
    // 16.2 //Comparing the password recieved from the user and password stored in database 
    if(user && (await bcrypt.compare(password,user.password))){

        const accessToken=jwt.sign({
            user:{
                username:user.username,
                email:user.email,
                id:user.id,
            }
        },
        //16.4, fetching accessTokenSecret from the .env file
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:"15m"
        }
    )
        
        res.status(200).json({accessToken});
    }
    else{
        res.status(401);
        throw new Error("Credentials not valid");
    }

    res.json({message:"Login the user"});
});


//@desc Current User
//@route GET /api/User/current
//@access private  //Only a logged in user will have the current info of a user 
const currentUser=asyncHandler (async (req,res)=>{     //Tells which user is currently loggedin

    res.json(req.user);
});


//@desc Forgot password
//@route post /api/User/forgotpassword
//@access public 

// Mail to send reset email using Gmail OAuth2
// Function to generate OAuth2 authorization URL and refresh token if needed
const getOAuth2Client = async () => {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI
    );
  
    // Check if REFRESH_TOKEN exists in .env
    if (!process.env.REFRESH_TOKEN) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline', // Ensures that a refresh token is returned
        scope: ['https://mail.google.com/'], // Gmail scope to send emails
      });
      console.log('Authorize this app by visiting this URL:', authUrl);
      throw new Error('REFRESH_TOKEN not set. Please authorize the app.');
    } else {
      oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
      return oAuth2Client;
    }
  };
  
  // Function to send reset password email using Gmail OAuth2
  const sendResetPasswordMail = asyncHandler(async ({ username, email, token }) => {
    try {
      // OAuth2 credentials
      const oAuth2Client = await getOAuth2Client();
  
      // Generate access token
      const accessToken = await oAuth2Client.getAccessToken();
  
      // Nodemailer transporter setup using OAuth2
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.emailUser, // Gmail address
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken.token, // Access token
        },
      });
  
      // Mail options
      const mailOptions = {
        from: process.env.emailUser,
        to: email,
        subject: 'Reset Password',
        html: `<p>Hi ${username}, copy the link to <a href="http://ec2-15-206-93-136.ap-south-1.compute.amazonaws.com:8000/api/user/resetpassword?token=${token}">reset your password</a></p>`,
      };
  
      // Send email
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log('Error:', error);
        } else {
          console.log('Mail has been sent:', info.response);
        }
      });
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new Error('Failed to send reset email.');
    }
  });
  
  // Forgot password handler
  const forgotPassword = asyncHandler(async (req, res) => {
    const { username, email } = req.body;
  
    // Find user and generate token
    const user = await User.findOne({ email });
    if (user) {
      const randomString = randomstring.generate();
      await User.updateOne({ email }, { $set: { token: randomString } });
      await sendResetPasswordMail({ username, email, token: randomString });
  
      res.status(200).send({ success: true, msg: 'Check your Inbox to reset your password' });
    } else {
      res.status(400).send({ success: false, msg: 'User not found' });
    }
  });
  
  // Reset password handler
  const resetPassword =asyncHandler( async (req, res) => {
    try {
      const token = req.query.token;
      const tokenData = await User.findOne({ token });
  
      if (tokenData) {
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = await User.findByIdAndUpdate(
          { _id: tokenData._id },
          { $set: { password: hashedPassword, token: '' } },
          { new: true }
        );
  
        res.status(200).send({ success: true, msg: 'User password has been updated', data: userData });
      } else {
        res.status(400).send({ success: false, msg: 'Link has expired' });
      }
    } catch (error) {
      res.status(400).send({ success: false, msg: error.message });
    }
  });
  


  //@desc delete User
  //@route post /api/User/login/delete
  //@access public

  const deleteUser=asyncHandler(async(req,res)=>{
    const {email}=req.body;

    const user= await User.findOne({email});
    if(!user)
    {
      res.status(400);
      throw new Error("User not present");
    }
    else{
      await User.deleteOne({email})
      res.status(200).send({success: true, msg: 'Your data has been deleted successfully' })

    }

  })
  

  //@desc send image User
  //@route post /api/User/login/run
  //@access public

  const searchimg= asyncHandler(async(req,res)=>{
    // Access your API key as an environment variable (see "Set up your API key" above)

    
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  
  // Converts local file information to a GoogleGenerativeAI.Part object.
  function fileToGenerativePart(filepath, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(filepath)).toString("base64"),
        mimeType
      },
    };
  }
  
  async function run() {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    const prompt = "What ingredients are present in this dish and can you provide the quantity present(approx) also rough calories of each item and overall approx calories(lower value) ";
  
    const image = [
      // fileToGenerativePart((__dirname,"images/image1.png"), "image/png"),
      // fileToGenerativePart((__dirname,"images/image1.jpeg"), "image/jpeg"),
      fileToGenerativePart((__dirname,"gemini/images/image4.jpg"), "image/jpg"),
  
    ];
  
    const result = await model.generateContent([prompt, ...image]);
    const response = await result.response;
    const text = response.text();
    return text;
  } 

    try {
      const text = await run();
      res.status(200).json({ success: true, msg: text });
    } catch (error) {
      console.error("Error in AI generation:", error);
      res.status(500).json({ success: false, msg: "Failed to generate content." });
    }
  
  });
module.exports={registerUser,loginUser,currentUser,forgotPassword,resetPassword,deleteUser,searchimg}