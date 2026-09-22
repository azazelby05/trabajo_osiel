export const toAuthUser = (row) => ({
  userId: row.user_id,
  username: row.user_name,
  role: row.role || "staff",
});
