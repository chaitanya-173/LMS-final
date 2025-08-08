// * CHECKS WHETHER THE USER IS AUTHENTICATED OR NOT

const jwt = require("jsonwebtoken");

const verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey);
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔐 Auth Header:", authHeader);
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  // ✅ Enhanced: Check Bearer format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: "Invalid token format. Use 'Bearer <token>'",
    });
  }

  const token = authHeader.split(" ")[1];
  
  // ✅ Enhanced: Check if token exists after split
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided after Bearer",
    });
  }

  try {
    const payload = verifyToken(token, process.env.JWT_SECRET); 
    console.log("✅ JWT PAYLOAD:", payload);
    
    // ✅ FIXED: Set req.user first, then console log
    req.user = payload;
    console.log("✅ Decoded User:", req.user); // Now this will show data!
    
    // ✅ Enhanced: Validate payload structure
    if (!payload.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload - userId missing",
      });
    }
    
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    
    // ✅ Enhanced: Specific error handling
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token signature",
      });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  }
};

module.exports = authenticate;
