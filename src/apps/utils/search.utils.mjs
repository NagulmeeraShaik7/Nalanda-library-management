/**
 * @module SearchUtils
 * @description Utility function for building MongoDB search queries based on input parameters.
 */

/**
 * @function buildSearchQuery
 * @description Constructs a MongoDB search query for case-insensitive text search across specified fields.
 * @param {Object} query - The query object containing the search term.
 * @param {string} [query.search] - The search term to match against the specified fields (optional).
 * @param {string[]} [fields=[]] - Array of field names to search within (e.g., ["title", "author"]).
 * @returns {Object} A MongoDB query object with `$or` conditions for matching the search term, or an empty object if no search term or fields are provided.
 * @example
 * // Example usage:
 * const query = buildSearchQuery({ search: "fiction" }, ["title", "genre"]);
 * // Returns: { $or: [{ title: { $regex: "fiction", $options: "i" } }, { genre: { $regex: "fiction", $options: "i" } }] }
 */
export const buildSearchQuery = (query, fields = []) => {
  const search = query.search?.trim();
  if (!search || fields.length === 0) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: "i" } // case-insensitive search
    }))
  };
};