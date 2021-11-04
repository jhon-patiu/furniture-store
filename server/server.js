const productsJson = require("./products.json");

require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

DEFAULT_PORT = 3000;

const storeProducts = new Map([productsJson.items]);

console.log(storeProducts);

// Define behavior for the server when it receives a request with this URL
// app.get("/", function (req, res) {
//     res.send("Hello World!");
// });

// Start server by listening to designated port and responding to all requests
const server = app.listen(process.env.PORT || DEFAULT_PORT, function () {
    // Log a message to indicate that the server was started correctly
    const port = server.address().port;
    console.log(`Server listening on port ${port}!`);
});
