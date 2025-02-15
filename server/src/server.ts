import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4'
import path from 'node:path';

import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';
import { authMiddleware } from './services/auth.js';

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();
  
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    '/graphql', 
    expressMiddleware(server, {
      context: async ({ req}) => {
        return authMiddleware({ req }); //add the middleware to the context
      },
    })
);
  
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (_, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
  }
    
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();