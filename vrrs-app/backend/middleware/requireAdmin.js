import { isAdmin } from "../utils/userRole.js";

export default (req, res, next) => {
  const user = req.session?.user || req.user;
  if (!user) return res.status(401).json({ message: "Authentication required." });
  if (!isAdmin(user)) {
    return res.status(403).json({ message: "This action is only allowed for HR administrators." });
  }
  return next();
};
