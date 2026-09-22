import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { toAuthUser } from "../utils/authUser.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password are required." });
    const user = await User.findOne({ user_name: username.trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const profile = toAuthUser(user);
    req.session.user = profile;
    return res.json({ message: "Login successful.", user: profile, auth: { session: true } });
  } catch {
    return res.status(500).json({ message: "Server error during login." });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Could not end session." });
    res.clearCookie("vrrs.sid");
    return res.json({ message: "Logged out successfully." });
  });
};

export const me = (req, res) => {
  if (!req.session?.user) return res.status(401).json({ message: "Not authenticated." });
  return res.json({ user: req.session.user });
};
