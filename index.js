const express = require("express");
const { createMollieClient } = require("@mollie/api-client");

const app = express();
const mollieClient = createMollieClient({
  apiKey: "test_RBhnFybs8E9p9dgcqdKDPQJ8vvMwCb"
});

let payID;
// callable url = http://localhost:8000/payment?amount=10.00&&cur=EUR
app.get("/payment", async (req, res) => {
  const orderId = new Date().getTime();

  let amount = {
    value: req.query.amount,
    currency: req.query.cur
  };

  // return res.send(amount);
  await mollieClient.payments
    .create({
      amount,
      description: "New payment",
      redirectUrl: `https://6e3146ce.ngrok.io/redirect?orderId=${orderId}`,
      webhookUrl: `https://6e3146ce.ngrok.io/webhook?orderId=${orderId}`,
      metadata: { orderId }
    })
    .then(payment => {
      // Redirect the consumer to complete the payment using `payment.getPaymentUrl()`.
      payID = payment.id;
      res.redirect(payment.getPaymentUrl());
    })
    .catch(error => {
      // Do some proper error handling.
      res.send(error);
    });
});

app.get("/redirect", (req, res) => {
  mollieClient.payments
    .get(payID)
    .then(payment => {
      // Show the consumer the status of the payment using `payment.status`.
      res.send(payment.status);
    })
    .catch(error => {
      // Do some proper error handling.
      res.send(error);
    });
});

app.listen(8080, () => console.log("Example app listening on port 8000."));
