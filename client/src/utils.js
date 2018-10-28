import axios from "axios";

export async function getRestaurant(restaurantId) {
  const {
    data: { jsonBody: restaurant }
  } = await axios.get("/yelp-business", {
    params: {
      businessId: restaurantId
    }
  });
  return restaurant;
}
