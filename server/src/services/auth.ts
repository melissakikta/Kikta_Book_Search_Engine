import jwt from 'jsonwebtoken';
import type { IUserDocument } from '../models/User';

//JWT payload
interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

//Context for GraphQL
interface MyContext {
  user?: JwtPayload;
}

//auth middleware for GraphQL context
export const authMiddleware = ({ req }: { req: any }): MyContext => {
  // Get token from header
  let token = req.headers.authorization || '';

  // ["Bearer", "<tokenvalue>"]
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) {
    return {};
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || 'mysecretsshhhhh';
    const payload = jwt.verify(token, secretKey) as JwtPayload;
    return { user: payload };
  } catch (err) {
    console.log('Invalid token');
    return {};
  }
};

// Sign token function
export const signToken = (user: IUserDocument): string => {
  const payload: JwtPayload = {
    _id: user._id.toString(),
    username: user.username,
    email: user.email
  };
  
  const secretKey = process.env.JWT_SECRET_KEY || 'mysecretsshhhhh';
  
  return jwt.sign(payload, secretKey, { expiresIn: '2h' });
};