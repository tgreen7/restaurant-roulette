import React from "react";
import { Button } from "@blueprintjs/core";
import Rating from "./Rating";

function RestaurantList({ restaurantList = [] }) {
  if (!restaurantList.length) return null;
  return (
    <div className="restaurant-list">
      {restaurantList.map((restaurant, i) => {
        return (
          <div
            key={restaurant.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            className="restaurant-list-item"
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                style={{ marginRight: 10 }}
                minimal
                small
                icon="trash"
                intent="danger"
                onClick={() => this.removeRestaurant(i)}
              />
              <div
                style={{
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={restaurant.url}
                >
                  {restaurant.name} aowegjeiaowgjeoiwg
                </a>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <label
                style={{
                  marginLeft: 5,
                  color: restaurant.is_open_now ? "#0F9960" : "#DB3737"
                }}
              >
                ({restaurant.is_open_now ? "Open" : "Closed"})
              </label>
              {restaurant.rating && (
                <div style={{ marginLeft: 5 }}>
                  <Rating name={restaurant.id} rating={restaurant.rating} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RestaurantList;
