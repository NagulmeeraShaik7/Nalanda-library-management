import { getPagination, getMeta } from "../../utils/pagination.utils.mjs";
import { buildSearchQuery } from "../../utils/search.utils.mjs";


class BookUseCase {
  constructor(bookRepository) {
    this.bookRepository = bookRepository;
  }

  async addBook(data) {
    return this.bookRepository.createBook(data);
  }

  async updateBook(id, data) {
    const book = await this.bookRepository.updateBook(id, data);
    if (!book) throw new Error("Book not found");
    return book;
  }

  async deleteBook(id) {
    const book = await this.bookRepository.deleteBook(id);
    if (!book) throw new Error("Book not found");
    return book;
  }

  async listBooks(query) {
    const { page, limit, skip } = getPagination(query);

    const filters = {};
    if (query.genre) filters.genre = query.genre;
    if (query.author) filters.author = query.author;

    const searchQuery = buildSearchQuery(query, ["title", "author", "genre", "ISBN"]);

    const { books, total } = await this.bookRepository.listBooks({
      skip,
      limit,
      filters,
      searchQuery
    });

    return { books, meta: getMeta(total, page, limit) };
  }
}

export default BookUseCase;
