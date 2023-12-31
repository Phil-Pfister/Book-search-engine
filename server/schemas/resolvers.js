const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
      
        me: async (parent, args, context) => {
            if (context.user) {
                const  userData = await User
                .findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate("savedBooks");

                return userData;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user with this email')
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect Password');
            }
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true },
                )
                .populate("savedBooks");
                return updatedUser;
            };
            throw new AuthenticationError("You must be loggind in!");
        },

        deleteBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true },
                );
                return updatedUser;
            };
            throw new AuthenticationError("You must be logged in!");
        },


    },
};

module.exports = resolvers;