import { Router } from "express";
import BorrowRepository from "../repositories/borrow.repository.mjs";
import BorrowUseCase from "../usecases/borrow.usecase.mjs";
import BorrowController from "../controllers/borrow.controller.mjs";
import { authenticate, authorize } from "../../middlewares/auth.middleware.mjs";

const router = Router();

// DI
const borrowRepository = new BorrowRepository();
const borrowUseCase = new BorrowUseCase(borrowRepository);
const borrowController = new BorrowController(borrowUseCase);

/**
 * Routes:
 * POST   /api/borrows/borrow         -> Member borrows a book (Member role)
 * PUT    /api/borrows/:borrowId/return -> Member returns book (Member role)
 * GET    /api/borrows               -> List borrows (Admin sees all, Member sees own)
 *
 * Reports (Admin):
 * GET    /api/borrows/reports/most-borrowed
 * GET    /api/borrows/reports/active-members
 * GET    /api/borrows/reports/availability
 */

router.post("/borrow", authenticate, authorize(["Member", "Admin"]), borrowController.borrowBook);
router.put("/:borrowId/return", authenticate, authorize(["Member", "Admin"]), borrowController.returnBook);
router.get("/", authenticate, authorize(["Admin", "Member"]), borrowController.listBorrows);

// Reports: admin-only (you can decide to allow members to see availability)
router.get("/reports/most-borrowed", authenticate, authorize(["Admin"]), borrowController.mostBorrowed);
router.get("/reports/active-members", authenticate, authorize(["Admin"]), borrowController.activeMembers);
router.get("/reports/availability", authenticate, authorize(["Admin"]), borrowController.availability);

export default router;
