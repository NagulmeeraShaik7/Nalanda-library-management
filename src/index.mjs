/**
 * @module Server
 * @description Main entry point for the Express application, setting up middleware, routes, and MongoDB connection.
 */

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./apps/auth/routers/auth.route.mjs";
import bookRoutes from "./apps/books/routers/book.route.mjs";
import borrowingRoutes from "./apps/borrows/routers/borrow.route.mjs";
import { errorHandler } from "./apps/middlewares/error.middleware.mjs";

/**
 * Loads environment variables from a .env file into process.env.
 */
dotenv.config();

/**
 * @constant app
 * @description The Express application instance.
 * @type {express.Application}
 */
const app = express();

/**
 * Middleware to parse incoming JSON request bodies.
 */
app.use(express.json());

/**
 * Connects to MongoDB using the URI from environment variables.
 * @returns {Promise<void>} Resolves when the connection is successful, logs errors otherwise.
 */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/**
 * Mounts authentication-related routes under the /api/auth prefix.
 * @name /api/auth
 */
app.use("/api/auth", authRoutes);

/**
 * Mounts book-related routes under the /api/books prefix.
 * @name /api/books
 */
app.use("/api/books", bookRoutes);

/**
 * Mounts borrowing-related routes under the /api/borrows prefix.
 * @name /api/borrows
 */
app.use("/api/borrows", borrowingRoutes);

/**
 * Applies global error handling middleware to catch and process errors.
 */
app.use(errorHandler);

/**
 * @constant PORT
 * @description The port number for the server, defaults to 3000 if not specified in environment variables.
 * @type {number}
 */
const PORT = process.env.PORT || 3000;

/**
 * Starts the Express server on the specified port.
 * @param {number} PORT - The port number to listen on.
 * @returns {void} Logs a message when the server starts successfully.
 */
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));