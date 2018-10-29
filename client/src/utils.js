import axios from "axios";
import { throttle } from "lodash";

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

export const saveStateToLocalStorage = throttle(state => {
  const { restaurantList } = state;
  saveListToStorage(restaurantList);
}, 1000);

export const saveListToStorage = (list, name = "restaurantList") => {
  const restaurantIds = list.reduce((acc, r) => {
    if (r && r.id) acc.push(r.id);
    return acc;
  }, []);
  localStorage.setItem(name, JSON.stringify(restaurantIds));
};
