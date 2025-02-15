// import { AuthenticationError } from "@apollo/server";
import { signToken } from "../services/auth.js";
import type { IUserDocument } from "../models/User.js";
import models from "../models/index.js";

const { User } = models;

const { GraphQLError } = require('graphql');

interface BookInput {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image?: string;
  link?: string;
}

const resolvers = {
  Query: {
    // Get the logged in user's data
    me: async (_: any, __: any, context: { user?: IUserDocument }) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new GraphQLError('Authentication failed', {extensions: {code: 'UNAUTHENTICATED'}});
    },
  },

  Mutation: {
    // Add a new user
    addUser: async (_: any, { username, email, password }: { username: string; email: string; password: string }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    // login a user
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new GraphQLError('No user found with this email address', {extensions: {code: 'UNAUTHENTICATED'}});
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new GraphQLError('Incorrect credentials', {extensions: {code: 'UNAUTHENTICATED'}});
      }

      const token = signToken(user);
      return { token, user };
    },

    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    saveBook: async (_: any, { bookData }: { bookData: BookInput }, context: { user?: IUserDocument }) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      }
      throw new GraphQLError('You need to be logged in!', {extensions: {code: 'UNAUTHENTICATED'}});
    },

    // remove a book from `savedBooks`
    removeBook: async (_: any, { bookId }: { bookId: string }, context: { user?: IUserDocument }) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updatedUser;
      }
      throw new GraphQLError('You need to be logged in!', {extensions: {code: 'UNAUTHENTICATED'}});
    },
  },
};

export default resolvers;
