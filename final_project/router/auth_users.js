const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return typeof username === "string" && username.trim().length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body || {};
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid username or password"});
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({message: "User successfully logged in", accessToken});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = String(req.params.isbn);
  const book = books[isbn];
  const review = typeof req.body?.review === "string" ? req.body.review.trim() : "";
  if (!book) return res.status(404).json({message: "Book not found"});
  if (!review) return res.status(400).json({message: "A non-empty review is required"});

  book.reviews[req.user.username] = review;
  return res.status(200).json({message: "Review added or updated", reviews: book.reviews});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = String(req.params.isbn);
  const book = books[isbn];
  if (!book) return res.status(404).json({message: "Book not found"});
  if (!Object.prototype.hasOwnProperty.call(book.reviews, req.user.username)) {
    return res.status(404).json({message: "Review not found"});
  }

  delete book.reviews[req.user.username];
  return res.status(200).json({message: "Review deleted", reviews: book.reviews});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
