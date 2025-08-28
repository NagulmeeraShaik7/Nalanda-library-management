/**
 * @module PaginationUtils
 * @description Utility functions for handling pagination in API queries.
 */

/**
 * @function getPagination
 * @description Extracts and calculates pagination parameters from a query object.
 * @param {Object} query - The query object containing pagination parameters.
 * @param {string|number} [query.page=1] - The page number for pagination (defaults to 1).
 * @param {string|number} [query.limit=10] - The number of items per page (defaults to 10).
 * @returns {Object} An object containing pagination parameters.
 * @property {number} page - The current page number.
 * @property {number} limit - The number of items per page.
 * @property {number} skip - The number of items to skip for the query.
 */
export const getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * @function getMeta
 * @description Generates metadata for paginated API responses.
 * @param {number} total - The total number of items matching the query.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @returns {Object} An object containing pagination metadata.
 * @property {number} total - The total number of items.
 * @property {number} page - The current page number.
 * @property {number} pages - The total number of pages.
 * @property {number} limit - The number of items per page.
 */
export const getMeta = (total, page, limit) => {
  return {
    total,
    page,
    pages: Math.ceil(total / limit),
    limit
  };
};