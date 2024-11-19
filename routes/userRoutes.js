const express=require("express");
const { registerUser, currentUser, loginUser,forgotPassword,resetPassword,deleteUser ,searchimg} = require("../controller/userController.js");
const validateToken = require("../middleware/validateTokenhandler.js");
const router=express.Router();

// router.post("/register",(req,res)=>{

//     console.log("Register route hit");

//     res.json({message:"Register the user"});
// })

router.post("/register",registerUser)// Used to look like above until cut and pasted in UserController

router.post("/login",loginUser)

router.post("/forgetpassword",forgotPassword)

router.delete("/login/delete",validateToken,deleteUser)

// router.post("/login/logout",logout)//to do

router.post("/login/run",validateToken,searchimg);

router.get("/resetpassword",resetPassword)

router.get("/current",validateToken,currentUser) //17.2  //Tells which user is currently loggedin\



module.exports=router;