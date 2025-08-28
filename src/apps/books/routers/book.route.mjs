/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API endpoints for managing books
 */

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

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - ISBN
 *               - publicationDate
 *               - genre
 *               - copies
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the book
 *               author:
 *                 type: string
 *                 description: The author of the book
 *               ISBN:
 *                 type: string
 *                 description: The unique ISBN identifier for the book
 *               publicationDate:
 *                 type: string
 *                 format: date
 *                 description: The publication date of the book
 *               genre:
 *                 type: string
 *                 description: The genre of the book
 *               copies:
 *                 type: integer
 *                 minimum: 0
 *                 description: The number of available copies
 *     responses:
 *       201:
 *         description: Book successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     ISBN:
 *                       type: string
 *                     publicationDate:
 *                       type: string
 *                       format: date
 *                     genre:
 *                       type: string
 *                     copies:
 *                       type: integer
 *       400:
 *         description: Bad request (e.g., invalid input or duplicate ISBN)
 *       401:
 *         description: Unauthorized (authentication required)
 *       403:
 *         description: Forbidden (Admin role required)
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticate, authorize(["Admin"]), bookController.addBook);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update an existing book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the book
 *               author:
 *                 type: string
 *                 description: The author of the book
 *               ISBN:
 *                 type: string
 *                 description: The unique ISBN identifier for the book
 *               publicationDate:
 *                 type: string
 *                 format: date
 *                 description: The publication date of the book
 *               genre:
 *                 type: string
 *                 description: The genre of the book
 *               copies:
 *                 type: integer
 *                 minimum: 0
 *                 description: The number of available copies
 *     responses:
 *       200:
 *         description: Book successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     ISBN:
 *                       type: string
 *                     publicationDate:
 *                       type: string
 *                       format: date
 *                     genre:
 *                       type: string
 *                     copies:
 *                       type: integer
 *       400:
 *         description: Bad request (e.g., invalid input)
 *       401:
 *         description: Unauthorized (authentication required)
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authenticate, authorize(["Admin"]), bookController.updateBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         SCHEMA:
 *           type: string
 *         description: The ID of the book to delete
 *     responses:
 *       200:
 *         description: Book successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Book deleted successfully
 *       401:
 *         description: Unauthorized (authentication required)
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticate, authorize(["Admin"]), bookController.deleteBook);

/**
 * @swagger
 * /books:
 *   get:
 *     summary: List books with optional filters and pagination
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of books to skip for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of books to return
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter books by genre
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter books by author
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for book title or ISBN
 *     responses:
 *       200:
 *         description: List of books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           author:
 *                             type: string
 *                           ISBN:
 *                             type: string
 *                           publicationDate:
 *                             type: string
 *                             format: date
 *                           genre:
 *                             type: string
 *                           copies:
 *                             type: integer
 *                     total:
 *                       type: integer
 *                       description: Total number of books matching the query
 *       401:
 *         description: Unauthorized (authentication required)
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticate, bookController.listBooks);

//console.log("Book routes initialized-------------");
export default router;

