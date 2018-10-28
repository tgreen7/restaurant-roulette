var express = require("express");
var app = express();
const yelpFusion = require("yelp-fusion");

const port = process.env.PORT || 5000;

const yelpAPIKey =
  "pCHA-fAn1H0KryCK6L7hQ_wzE_eGrl1Uj324BsYt86Bk-mBCTDH_-daN-EjqZsjsz5QXrZKGCrsGCTulXD7TwlXWqanWywVQP8oS0_jPUmBUf9ooj9793fO9P-zUW3Yx";

const yelpClient = yelpFusion.client(yelpAPIKey);

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/yelp-business", async (req, res) => {
  try {
    const { businessId } = req.query;
    const business = await yelpClient.business(businessId);
    res.json(business);
  } catch (error) {
    console.error("error:", error);
    res.status(500).send("Error fetching business");
  }
});

app.get("/autocomplete-yelp-suggestions", async (req, res) => {
  try {
    const { latitude, longitude, text } = req.query;
    const restaurants = await yelpClient.autocomplete({
      text,
      latitude,
      longitude
    });
    res.json(restaurants);
  } catch (error) {
    console.error("error:", error);
    res.status(500).send("Error fetching suggestions");
  }
});