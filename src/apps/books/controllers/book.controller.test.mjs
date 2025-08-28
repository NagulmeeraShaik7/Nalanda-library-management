import BookController from "./book.controller.mjs";

describe("BookController", () => {
  let mockBookUseCase;
  let bookController;
  let req, res, next;

  beforeEach(() => {
    mockBookUseCase = {
      addBook: jest.fn(),
      updateBook: jest.fn(),
      deleteBook: jest.fn(),
      listBooks: jest.fn(),
    };

    bookController = new BookController(mockBookUseCase);

    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // ------------------ addBook ------------------
  describe("addBook", () => {
    it("should return 201 and created book on success", async () => {
      const mockBook = { id: "1", title: "Test Book" };
      req.body = { title: "Test Book" };
      mockBookUseCase.addBook.mockResolvedValue(mockBook);

      await bookController.addBook(req, res, next);

      expect(mockBookUseCase.addBook).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockBook });
    });

    it("should call next with error if addBook throws", async () => {
      const error = new Error("Failed to add");
      mockBookUseCase.addBook.mockRejectedValue(error);

      await bookController.addBook(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ------------------ updateBook ------------------
  describe("updateBook", () => {
    it("should return 200 and updated book on success", async () => {
      const mockBook = { id: "1", title: "Updated Book" };
      req.params.id = "1";
      req.body = { title: "Updated Book" };
      mockBookUseCase.updateBook.mockResolvedValue(mockBook);

      await bookController.updateBook(req, res, next);

      expect(mockBookUseCase.updateBook).toHaveBeenCalledWith("1", req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockBook });
    });

    it("should call next with error if updateBook throws", async () => {
      const error = new Error("Update failed");
      mockBookUseCase.updateBook.mockRejectedValue(error);

      await bookController.updateBook(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ------------------ deleteBook ------------------
  describe("deleteBook", () => {
    it("should return 200 and success message on success", async () => {
      req.params.id = "1";
      mockBookUseCase.deleteBook.mockResolvedValue();

      await bookController.deleteBook(req, res, next);

      expect(mockBookUseCase.deleteBook).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Book deleted successfully" });
    });

    it("should call next with error if deleteBook throws", async () => {
      const error = new Error("Delete failed");
      mockBookUseCase.deleteBook.mockRejectedValue(error);

      await bookController.deleteBook(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ------------------ listBooks ------------------
  describe("listBooks", () => {
    it("should return 200 and list of books on success", async () => {
      const mockResult = [{ id: "1", title: "Book One" }];
      req.query = { page: 1 };
      mockBookUseCase.listBooks.mockResolvedValue(mockResult);

      await bookController.listBooks(req, res, next);

      expect(mockBookUseCase.listBooks).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it("should call next with error if listBooks throws", async () => {
      const error = new Error("List failed");
      mockBookUseCase.listBooks.mockRejectedValue(error);

      await bookController.listBooks(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
