/**
 * @swagger
 * tags:
 *   name: Borrows
 *   description: API endpoints for managing book borrowing operations
 */

import { Router } from "express";
import BorrowRepository from "../repositories/borrow.repository.mjs";
import BorrowUseCase from "../usecases/borrow.usecase.mjs";
import BorrowController from "../controllers/borrow.controller.mjs";
import { authenticate, authorize } from "../../middlewares/auth.middleware.mjs";

const router = Router();

// Dependency Injection
const borrowRepository = new BorrowRepository();
const borrowUseCase = new BorrowUseCase(borrowRepository);
const borrowController = new BorrowController(borrowUseCase);

/**
 * @swagger
 * /api/borrows/borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - dueDate
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: The ID of the book to borrow
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: The due date for returning the book
 *               userId:
 *                 type: string
 *                 description: The ID of the user borrowing the book (required for Admin, optional for Member as it comes from token)
 *     responses:
 *       201:
 *         description: Book successfully borrowed
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
 *                     userId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     bookId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         author:
 *                           type: string
 *                         ISBN:
 *                           type: string
 *                     borrowDate:
 *                       type: string
 *                       format: date
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       enum: [borrowed, returned, overdue]
 *       400:
 *         description: Bad request (e.g., missing required fields or invalid input)
 *       401:
 *         description: Unauthorized (authentication required)
 *       403:
 *         description: Forbidden (Member or Admin role required)
 *       500:
 *         description: Internal server error
 */
router.post("/borrow", authenticate, authorize(["Member", "Admin"]), borrowController.borrowBook);

/**
 * @swagger
 * /api/borrows/{borrowId}/return:
 *   put:
 *     summary: Return a borrowed book
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: borrowId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the borrow record to return
 *     responses:
 *       200:
 *         description: Book successfully returned
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
 *                     userId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     bookId:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         author:
 *                           type: string
 *                         ISBN:
 *                           type: string
 *                     borrowDate:
 *                       type: string
 *                       format: date
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     returnDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       enum: [borrowed, returned, overdue]
 *       401:
 *         description: Unauthorized (authentication required)
 *       403:
 *         description: Forbidden (Member or Admin role required)
 *       404:
 *         description: Borrow record not found
 *       500:
 *         description: Internal server error
 */
router.put("/:borrowId/return", authenticate, authorize(["Member", "Admin"]), borrowController.returnBook);

/**
 * @swagger
 * /api/borrows:
 *   get:
 *     summary: List borrow records
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of borrow records to skip for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of borrow records to return
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [borrowed, returned, overdue]
 *         description: Filter borrow records by status
 *     responses:
 *       200:
 *         description: Borrow records retrieved successfully
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
 *                     borrows:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                           bookId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               author:
 *                                 type: string
 *                               ISBN:
 *                                 type: string
 *                           borrowDate:
 *                             type: string
 *                             format: date
 *                           dueDate:
 *                             type: string
 *                             format: date
 *                           returnDate:
 *                             type: string
 *                             format: date
 *                           status:
 *                             type: string
 *                             enum: [borrowed, returned, overdue]
 *                     total:
 *                       type: integer
 *                       description: Total number of borrow records matching the query
 *       401:
 *         description: Unauthorized (authentication required)
 *       403:
 *         description: Forbidden (Admin or Member role required)
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticate, authorize(["Admin", "Member"]), borrowController.listBorrows);

/**
 * @swagger
 * /api/borrows/reports/most-borrowed:
 *   get:
 *     summary: Get the most borrowed books
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: top
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of top borrowed books to return
 *     responses:
 *       200:
 *         description: Most borrowed books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       author:
 *                         type: string
 *                       ISBN:
 *                         type: string
 *                       borrowCount:
 *                         type: integer
 *       401:
 *         description: Unauthorized (authentication required)
 *       403:
 *         description: Forbidden (Admin role required)
 *       500:
 *         description: Internal server error
 */
router.get("/reports/most-borrowed", authenticate, authorize(["Admin"]), borrowController.mostBorrowed);

/**
 * @swagger
 * /api/borrows/reports/active-members:
 *   get:
 *     summary: Get the most active members
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: top
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of top active members to return
 *     responses:
 *       200:
 *         description: Most active members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       borrowCount:
 *                         type: integer
 *       401:
 *         description: Unauthorized (authentication required)
 *       403:
 *         description: Forbidden (Admin role required)
 *       500:
 *         description: Internal server error
 */
router.get("/reports/active-members", authenticate, authorize(["Admin"]), borrowController.activeMembers);

/**
 * @swagger
 * /api/borrows/reports/availability:
 *   get:
 *     summary: Get book availability summary
 *     tags: [Borrows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Book availability summary retrieved successfully
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
 *                     perBook:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           bookId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           author:
 *                             type: string
 *                           ISBN:
 *                             type: string
 *                           totalCopies:
 *                             type: integer
 *                           borrowedCopies:
 *                             type: integer
 *                           availableCopies:
 *                             type: integer
 *                     totals:
 *                       type: object
 *                       properties:
 *                         totalBooks:
 *                           type: integer
 *                         borrowedBooks:
 *                           type: integer
 *                         availableBooks:
 *                           type: integer
 *       401:
 *         description: Unauthorized (authentication required)
 *       403:
 *         description: Forbidden (Admin role required)
 *       500:
 *         description: Internal server error
 */
router.get("/reports/availability", authenticate, authorize(["Admin"]), borrowController.availability);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export default router;