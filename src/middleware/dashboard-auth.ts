import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  let token: string =
    req.body.authorization || req.query.authorization || req.headers["authorization"];

  if (!token) {
    return res.status(403).send({
      status: false,
      statusMsg: "No Token Found",
      data: undefined
    });
  }
  token = token.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.DASHBOARD_AUTH_TOKEN_KEY!);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export default module.exports = verifyToken;