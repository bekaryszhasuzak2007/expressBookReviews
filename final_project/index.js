const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
  const bearer = req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = bearer || (req.session.authorization && req.session.authorization.accessToken);

  if (!token) {
    return res.status(401).json({message: "User not authenticated"});
  }

  jwt.verify(token, "access", (err, user) => {
    if (err) return res.status(403).json({message: "Invalid or expired token"});
    req.user = user;
    next();
  });
});
 
const PORT = Number(process.env.PORT) || 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
