import BookUseCase from "../usecases/book.usecase.mjs";

class BookController {
  constructor(bookUseCase) {
    this.bookUseCase = bookUseCase;
  }

  addBook = async (req, res, next) => {
    try {
      const book = await this.bookUseCase.addBook(req.body);
      //console.log("Book added:-----", book);
      res.status(201).json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  };

  updateBook = async (req, res, next) => {
    try {
      const book = await this.bookUseCase.updateBook(req.params.id, req.body);
      res.status(200).json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  };

  deleteBook = async (req, res, next) => {
    try {
      await this.bookUseCase.deleteBook(req.params.id);
      res.status(200).json({ success: true, message: "Book deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  listBooks = async (req, res, next) => {
    try {
      const result = await this.bookUseCase.listBooks(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default BookController;
