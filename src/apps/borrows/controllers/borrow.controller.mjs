import BorrowUseCase from "../usecases/borrow.usecase.mjs";

class BorrowController {
  constructor(borrowUseCase) {
    this.borrowUseCase = borrowUseCase;
  }

  borrowBook = async (req, res, next) => {
    try {
      // userId can come from token (preferred) or body (if admin)
      const userId = req.user?.id || req.body.userId;
      if (!userId) return res.status(400).json({ success: false, message: "userId is required" });

      const { bookId, dueDate } = req.body;
      if (!bookId || !dueDate) return res.status(400).json({ success: false, message: "bookId and dueDate are required" });

      const borrow = await this.borrowUseCase.borrowBook({ userId, bookId, dueDate });
      res.status(201).json({ success: true, data: borrow });
    } catch (err) {
      next(err);
    }
  };

  returnBook = async (req, res, next) => {
    try {
      const { borrowId } = req.params;
      // optionally ensure the user is the borrower or admin - route should check role
      const updated = await this.borrowUseCase.returnBook(borrowId, req.user?.id);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  listBorrows = async (req, res, next) => {
    try {
      const result = await this.borrowUseCase.listBorrows(req.query, req.user);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  mostBorrowed = async (req, res, next) => {
    try {
      const top = req.query.top || 10;
      const data = await this.borrowUseCase.getMostBorrowed({ top });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  activeMembers = async (req, res, next) => {
    try {
      const top = req.query.top || 10;
      const data = await this.borrowUseCase.getActiveMembers({ top });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  availability = async (req, res, next) => {
    try {
      const data = await this.borrowUseCase.getBookAvailability();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}


export default BorrowController;