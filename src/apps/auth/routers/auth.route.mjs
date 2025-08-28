import { Router } from "express";
import AuthRepository from "../repositories/auth.repository.mjs";
import AuthUseCase from "../usecases/auth.usecase.mjs";
import AuthController from "../controllers/auth.controller.mjs";

const router = Router();

// Dependency injection
const authRepository = new AuthRepository();
const authUseCase = new AuthUseCase(authRepository);
const authController = new AuthController(authUseCase);

// Routes
router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
