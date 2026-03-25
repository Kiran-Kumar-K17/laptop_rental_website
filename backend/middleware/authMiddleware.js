import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await UserActivation.findById(decoded.id).select(
      "-passwordHash",
    );

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};
