import { Request, Response, NextFunction } from 'express';
const jwt = require("jsonwebtoken")
const { key_Token } = process.env;


interface CustomRequest extends Request {
  currentUser?: string; 
}

export const userverifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.body.token || req.query.token || req.headers['token'];

  if (!token) {
    return res.status(403).json({ message: 'A token is required for authentication.' });
  }

  try {
    const decodeToken: any = jwt.verify(token, process.env.key_Token);

    req.currentUser = decodeToken._id;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  return next();
};
