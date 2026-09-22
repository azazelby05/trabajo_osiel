const canManageUsers = (user) => user?.role === "admin";
const canViewReports = (user) => user?.role === "admin" || user?.role === "manager";

export const requireAdmin = (req, res, next) => {
  const user = req.session?.user || req.user;
  if (!canManageUsers(user)) return res.status(403).json({ message: "Admin access required." });
  next();
};

export const requireManager = (req, res, next) => {
  const user = req.session?.user || req.user;
  if (!canViewReports(user)) return res.status(403).json({ message: "Manager or admin access required." });
  next();
};
