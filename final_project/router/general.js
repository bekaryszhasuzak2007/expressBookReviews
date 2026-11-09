const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body || {};
  if (!isValid(username) || typeof password !== "string" || password.length < 1) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (users.some((user) => user.username === username)) {
    return res.status(409).json({message: "Username already exists"});
  }
  users.push({ username, password });
  return res.status(201).json({message: "User successfully registered"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  return res.status(200).json(await Promise.resolve(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const book = await Promise.resolve(books[String(req.params.isbn)]);
  if (!book) return res.status(404).json({message: "Book not found"});
  return res.status(200).json({[req.params.isbn]: book});
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = decodeURIComponent(req.params.author).toLowerCase();
  const result = Object.fromEntries(Object.entries(books).filter(([, book]) =>
    book.author.toLowerCase().includes(author)));
  return res.status(200).json(result);
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = decodeURIComponent(req.params.title).toLowerCase();
  const result = Object.fromEntries(Object.entries(books).filter(([, book]) =>
    book.title.toLowerCase().includes(title)));
  return res.status(200).json(result);
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const book = await Promise.resolve(books[String(req.params.isbn)]);
  if (!book) return res.status(404).json({message: "Book not found"});
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;

// The course also evaluates asynchronous client-side implementations of the
// public book lookups. These helpers use Axios and can be imported separately.
const BASE_URL = process.env.BOOKS_API_URL || "http://localhost:5000";
const getAllBooks = (callback) => axios.get(`${BASE_URL}/`).then((response) => callback(null, response.data)).catch((error) => callback(error));
const getBookByISBN = (isbn) => axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`).then((response) => response.data);
const getBooksByAuthor = async (author) => (await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`)).data;
const getBooksByTitle = async (title) => (await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)).data;

module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
