import { Router } from "express";
import BookRepository from "../repositories/book.repository.mjs";
import BookUseCase from "../usecases/book.usecase.mjs";
import BookController from "../controllers/book.controller.mjs";
import { authenticate, authorize } from "../../middlewares/auth.middleware.mjs";

const router = Router();

// Dependency Injection
const bookRepository = new BookRepository();
const bookUseCase = new BookUseCase(bookRepository);
const bookController = new BookController(bookUseCase);

// Routes
router.post("/", authenticate, authorize(["Admin"]), bookController.addBook);
router.put("/:id", authenticate, authorize(["Admin"]), bookController.updateBook);
router.delete("/:id", authenticate, authorize(["Admin"]), bookController.deleteBook);
router.get("/", authenticate, bookController.listBooks);


//console.log("Book routes initialized-------------");
export default router;
