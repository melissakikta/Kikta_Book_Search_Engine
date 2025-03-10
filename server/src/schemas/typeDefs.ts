import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Book {
    _id: ID!
    bookId: String!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
  }

  type Auth {
    token: ID!
    user: User
  }

  input BookInput {
    bookId: String!
    title: String!
    authors: [String]
    description: String!
    image: String
    link: String
  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): AuthPayload
    saveBook(bookData: BookInput!): User
    removeBook(bookId: String!): User
  }

  type AuthPayload {
    token: String
    user: User
  }
`;

export default typeDefs;
