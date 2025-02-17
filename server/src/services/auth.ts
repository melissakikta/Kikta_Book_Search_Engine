import type { Request, Response, NextFunction } from 'express';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';


import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

interface UserLike {
  _id: unknown;
  username: string;
  email: string;
}

interface Context {
  token?: string;
  user?: JwtPayload;
}

//Rest Middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY || '';

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user as JwtPayload;
      return next();
    });
  } else {
    res.sendStatus(401); //Unauthorized
  }
};

//GraphQL context creator
export const createContext = async ({ req }: { req: any }): Promise<Context> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return {};
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.JWT_SECRET_KEY || '';

  try {
    const user = jwt.verify(token, secretKey) as JwtPayload;
    return { token, user };
  } catch (error) {
    throw new GraphQLError('Invalid token');
  }
};

//GraphQL middleware
export const authenticateGraphQLToken = (next: any) => (root: any, args: any, context: Context, info: any) => {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  return next(root, args, context, info);
}

//Token signing with overloads to support both object and parameter approches
export function signToken(user: UserLike): string;
export function signToken(username: string, email: string, _id: unknown): string;
export function signToken(userOrUsername: UserLike | string, email?: string, _id?: unknown): string {
  const secretKey = process.env.JWT_SECRET_KEY || '';

  if (typeof userOrUsername === 'string') {
    if (!email || _id === undefined) {
      throw new Error('Email and -id must be provided');
     }
      return jwt.sign({ username: userOrUsername, email, _id }, secretKey, { expiresIn: '1h' });
    } else {
      const { username, email, _id } = userOrUsername;
      return jwt.sign({ username, email, _id }, secretKey, { expiresIn: '1h' });
    }
  }

  export const createdProtectedResolver = (resolver: Function) => {
    return authenticateGraphQLToken(resolver);
  }