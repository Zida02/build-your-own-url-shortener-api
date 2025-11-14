import jwt   from "jsonwebtoken";
import dotenv  from "dotenv"
dotenv.config()

const generateToken = ({ userId, email }) => {
  const payload = { userId, email };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};


  export default generateToken;
