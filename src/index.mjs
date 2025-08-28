import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./apps/auth/routers/auth.route.mjs";
import bookRoutes from "./apps/books/routers/book.route.mjs";
import { errorHandler } from "./apps/middlewares/error.middleware.mjs";

dotenv.config();

const app = express();
app.use(express.json());

// DB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
