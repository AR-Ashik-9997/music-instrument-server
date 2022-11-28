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
      app.get("/sellerProduct", varifySecret, async (req, res) => {
        const query = { email: req.query.email };
        const result = await productCollections.find(query).toArray();
        res.send(result);
      });
      app.get("/allbuyer", async (req, res) => {
        const query = { role: req.query.role };
        const result = await RegisterCollections.find(query).toArray();
        res.send(result);
      });
      app.get("/allseller", async (req, res) => {
        const query = { role: req.query.role };
        const result = await RegisterCollections.find(query).toArray();
        res.send(result);
      });
      app.get("/access/:email", varifySecret, async (req, res) => {
        const email = req.params.email;
        const query = { email };
        const result = await RegisterCollections.findOne(query);
        res.send(result);
      });
      app.get("/reportInfo", async (req, res) => {
        const result = await ReportCollections.find({}).toArray();
        res.send(result);
      });
      app.get("/cardProduct/:id", async (req, res) => {
        const categoryId = req.params.id;
        const query = { categoryId: categoryId };
        const cursor = productCollections.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });
       
    app.get("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await BookingCollections.findOne(query);
      res.send(result);
    });
    app.post("/create-payment-intent", varifySecret, async (req, res) => {
      const booking = req.body;
      const price = booking.sellPrice;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    app.post("/paymentInfo-stored", varifySecret, async (req, res) => {
      const paymentInfo = req.body;
      const result = await PaymentCollections.insertOne(paymentInfo);
      const id = paymentInfo.productId;
      const filter = { _id: ObjectId(id) };
      const update = {
        $set: {
          status: paymentInfo.status,
        },
      };
      const updateResult = await productCollections.updateOne(filter, update);
      res.send(result);
    });
    app.get("/advertiseProduct", async (req, res) => {
      const result = await productCollections
        .find({ status: "Available", addvertise: "true" })
        .toArray();
      res.send(result);
    });
    app.get("/orderInfo", varifySecret, async (req, res) => {
      const query = { buyerEmail: req.query.email };
      const result = await BookingCollections.find(query).toArray();
      res.send(result);
    });
    app.post("/bookingProducts", async (req, res) => {
      const booking = req.body;
      const result = await BookingCollections.insertOne(booking);
      res.send(result);
    });
    app.post("/AddProduct", async (req, res) => {
      const booking = req.body;
      const result = await productCollections.insertOne(booking);
      res.send(result);
    });

    app.post("/AddCategory", async (req, res) => {
      const booking = req.body;
      const result = await categoryCollections.insertOne(booking);
      res.send(result);
    });

    app.post("/AddReport", async (req, res) => {
      const report = req.body;
      const result = await ReportCollections.insertOne(report);
      res.send(result);
    });
    app.post("/AddRegister", async (req, res) => {
      const register = req.body;
      const result = await RegisterCollections.insertOne(register);
      res.send(result);
    });
    app.get("/checkRegister", varifySecret, async (req, res) => {
      const query = { email: req.query.email };
      const result = await RegisterCollections.find(query).toArray();
      res.send(result);
    });
    app.get("/checkpayment", async (req, res) => {
      const email= req.query.email;
      const query = {email: email};
      const result = await PaymentCollections.findOne( query);
      res.send(result);
    });