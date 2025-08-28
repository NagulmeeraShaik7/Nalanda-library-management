export const getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getMeta = (total, page, limit) => {
  return {
    total,
    page,
    pages: Math.ceil(total / limit),
    limit
  };
};
