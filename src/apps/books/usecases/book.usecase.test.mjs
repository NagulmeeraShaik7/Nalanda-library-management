import BookUseCase from "../usecases/book.usecase.mjs";
import * as paginationUtils from "../../utils/pagination.utils.mjs";
import * as searchUtils from "../../utils/search.utils.mjs";

describe("BookUseCase", () => {
  let mockRepo;
  let useCase;

  beforeEach(() => {
    mockRepo = {
      createBook: jest.fn(),
      updateBook: jest.fn(),
      deleteBook: jest.fn(),
      listBooks: jest.fn(),
    };
    useCase = new BookUseCase(mockRepo);

    jest.clearAllMocks();
  });

  // ---------------- addBook ----------------
  describe("addBook", () => {
    it("should call repository.createBook with data", async () => {
      const data = { title: "New Book" };
      const savedBook = { _id: "1", ...data };

      mockRepo.createBook.mockResolvedValue(savedBook);

      const result = await useCase.addBook(data);

      expect(mockRepo.createBook).toHaveBeenCalledWith(data);
      expect(result).toEqual(savedBook);
    });
  });

  // ---------------- updateBook ----------------
  describe("updateBook", () => {
    it("should update and return book", async () => {
      const id = "123";
      const data = { title: "Updated" };
      const updatedBook = { _id: id, ...data };

      mockRepo.updateBook.mockResolvedValue(updatedBook);

      const result = await useCase.updateBook(id, data);

      expect(mockRepo.updateBook).toHaveBeenCalledWith(id, data);
      expect(result).toEqual(updatedBook);
    });

    it("should throw if book not found", async () => {
      mockRepo.updateBook.mockResolvedValue(null);

      await expect(useCase.updateBook("123", {})).rejects.toThrow("Book not found");
    });
  });

  // ---------------- deleteBook ----------------
  describe("deleteBook", () => {
    it("should delete and return book", async () => {
      const id = "123";
      const deletedBook = { _id: id, title: "Gone" };

      mockRepo.deleteBook.mockResolvedValue(deletedBook);

      const result = await useCase.deleteBook(id);

      expect(mockRepo.deleteBook).toHaveBeenCalledWith(id);
      expect(result).toEqual(deletedBook);
    });

    it("should throw if book not found", async () => {
      mockRepo.deleteBook.mockResolvedValue(null);

      await expect(useCase.deleteBook("123")).rejects.toThrow("Book not found");
    });
  });

  // ---------------- listBooks ----------------
  describe("listBooks", () => {
    it("should list books with pagination, filters, and search", async () => {
      const query = { page: "2", limit: "5", genre: "Fiction", search: "test" };

      // Mock utils
      jest.spyOn(paginationUtils, "getPagination").mockReturnValue({ page: 2, limit: 5, skip: 5 });
      jest.spyOn(paginationUtils, "getMeta").mockReturnValue({ total: 1, page: 2, limit: 5 });
      jest.spyOn(searchUtils, "buildSearchQuery").mockReturnValue({ title: /test/i });

      const mockBooks = [{ _id: "1", title: "Test Book" }];
      mockRepo.listBooks.mockResolvedValue({ books: mockBooks, total: 1 });

      const result = await useCase.listBooks(query);

      expect(paginationUtils.getPagination).toHaveBeenCalledWith(query);
      expect(searchUtils.buildSearchQuery).toHaveBeenCalledWith(query, ["title", "author", "genre", "ISBN"]);
      expect(mockRepo.listBooks).toHaveBeenCalledWith({
        skip: 5,
        limit: 5,
        filters: { genre: "Fiction" },
        searchQuery: { title: /test/i },
      });
      expect(paginationUtils.getMeta).toHaveBeenCalledWith(1, 2, 5);

      expect(result).toEqual({ books: mockBooks, meta: { total: 1, page: 2, limit: 5 } });
    });
  });
});
