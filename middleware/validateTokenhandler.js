const asyncHandler= require("express-async-handler");
const jwt=require("jsonwebtoken");

const validateToken=asyncHandler(async(req,res,next)=>{
    let token;
    //Token passed through Header
    let authHeader=req.headers.authorization || req.headers.Authorization

    if(authHeader && authHeader.startsWith("Bearer"))
    { //Extracting the token
        token=authHeader.split(" ")[1] //The line token = authHeader.split(" ")[1] extracts the token from the Authorization header by splitting the header string at the space character and selecting the second element.
        
        //Verifying the token
        /*it takes the token for the user then the secret token and checks if the user was authorized to make the request, if not then error */
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,decoded)=>{
            if(err){
                res.status(401);
                throw new Error("User is not authorized");
            }
            //user using correct info
            req.user=decoded.user;
            next();//this is a middleware we will intercept the request and decode the token and append the user info on the request.user property
        });

        if(!token)
        {
            res.status(401);
            throw  new Error("User not authorized or token is missing in the request");
        }
    }
});

module.exports=validateToken;