import React from "react";
import StarRatingComponent from "react-star-rating-component";

function Rating({ rating = 1, name }) {
  return <StarRatingComponent name={name} starCount={5} value={rating} />;
}

export default Rating;
