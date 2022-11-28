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

      app.post("/jwt", (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.Secrete_Token, {
          expiresIn: "1day",
        });
        res.send({ token });
      });
  
      app.get("/all-Category-data-find", async (req, res) => {
        const query = { name: req.query.name };
        const result = await categoryCollections.find(query).toArray();
        res.send(result);
      });
  
      app.get("/cardCategory", async (req, res) => {
        const result = await categoryCollections.find({}).limit(3).toArray();
        res.send(result);
      });
      app.get("/allCategory", async (req, res) => {
        const result = await categoryCollections.find({}).toArray();
        res.send(result);
      });