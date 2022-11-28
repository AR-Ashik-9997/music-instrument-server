const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_KEY);
app.use(cors());
app.use(express.json());

const uri = process.env.DB_Url;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function varifySecret(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.Secrete_Token, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}


async function connect() {
  try {
    const categoryCollections = client
      .db("Used-Resell-Market")
      .collection("Categories");

    const productCollections = client
      .db("Used-Resell-Market")
      .collection("Product");

    const BookingCollections = client
      .db("Used-Resell-Market")
      .collection("bookingProducts");

    const ReportCollections = client
      .db("Used-Resell-Market")
      .collection("ReportedProduct");

    const RegisterCollections = client
      .db("Used-Resell-Market")
      .collection("Register");
    const PaymentCollections = client
      .db("Used-Resell-Market")
      .collection("Payments");

