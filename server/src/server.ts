import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4'
import path from 'node:path';

import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';
import { createContext } from './services/auth.js';

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // introspection: process.env.NODE_ENV !== 'production',
});

const startApolloServer = async () => {
  
  try {
    await server.start();
    console.log("Apollo Server Started Successfully!");
    
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    
    app.use(
      '/graphql', 
      expressMiddleware(server, {
        context: createContext
      })
    );
    
    
    db.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
    // db.once('open', () => {
    // });
    
  } catch (error) {
    console.error('Error starting Apollo Server:', error);
  }

  // if we're in production, serve client/dist as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (_, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }
  
};

startApolloServer();