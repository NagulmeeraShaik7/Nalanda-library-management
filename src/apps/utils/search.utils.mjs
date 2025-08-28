export const buildSearchQuery = (query, fields = []) => {
  const search = query.search?.trim();
  if (!search || fields.length === 0) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: "i" } // case-insensitive search
    }))
  };
};
