import React, { Component } from "react";
import { random, pick, get, keyBy } from "lodash";
import { Button, Classes, Spinner, FormGroup } from "@blueprintjs/core";
import axios from "axios";
import AsyncSelect from "react-select/lib/Async";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { geolocated } from "react-geolocated";
import Promise from "bluebird";
import classNames from "classnames";
import LocationSearch from "./components/LocationSearch";
import toastr from "./components/toastr";
import BlueprintError from "./components/BlueprintError";
import { getRestaurant } from "./utils";
import RestaurantList from "./components/RestaurantList";
import "./App.css";
import showConfirmationDialog from "./components/showConfirmationDialog";

// register toastr
toastr();

class App extends Component {
  state = {
    restaurantList: [],
    restaurantOption: "",
    chosenRestaurant: undefined,
    addingRestaurant: false,
    latitude: undefined,
    longitude: undefined,
    loadingInitialList: false
  };

  async componentDidMount() {
    document.body.classList.add(Classes.DARK);
    let restaurantIds = localStorage.getItem("restaurantList");
    if (restaurantIds) restaurantIds = JSON.parse(restaurantIds);
    if (restaurantIds && restaurantIds.length) {
      this.setState({
        loadingInitialList: true
      });
      try {
        const restaurants = await Promise.map(restaurantIds, async id => {
          return await getRestaurant(id);
        });
        this.addRestaurantToState(restaurants);
      } catch (error) {
        console.error("error:", error);
        window.toastr.error("Error loading old options.");
      }
      this.setState({
        loadingInitialList: false
      });
    }
  }

  async componentDidUpdate() {
    const { restaurantList } = this.state;
    const restaurantIds = restaurantList.reduce((acc, r) => {
      if (r && r.id) acc.push(r.id);
      return acc;
    }, []);
    localStorage.setItem("restaurantList", JSON.stringify(restaurantIds));
  }

  clearList = async () => {
    const shouldClear = await showConfirmationDialog({
      text: "Are you sure you would like to clear the list!"
    });
    if (shouldClear) {
      this.setState({
        restaurantList: []
      });
    }
  };

  addRestaurantToState = restaurantOrRestaurants => {
    const { restaurantList } = this.state;
    const restaurants = Array.isArray(restaurantOrRestaurants)
      ? restaurantOrRestaurants
      : [restaurantOrRestaurants];
    let newList = [...restaurantList];

    restaurants.forEach(restaurant => {
      if (
        restaurant &&
        restaurant.id &&
        !newList.some(res => res.id === restaurant.id)
      ) {
        const is_open_now = get(restaurant, "hours[0].is_open_now");
        newList.push({
          ...pick(restaurant, ["id", "name", "url", "rating"]),
          is_open_now
        });
      }
    });

    this.setState({
      restaurantList: newList
    });
  };

  addRestaurantToList = async () => {
    const { restaurantOption } = this.state;
    const restaurantId = restaurantOption.value;
    this.setState({
      addingRestaurant: true
    });
    try {
      const restaurant = await getRestaurant(restaurantId);
      this.addRestaurantToState(restaurant);
    } catch (error) {
      console.error("error:", error);
      window.toastr.error("Error adding restaurant");
    }
    this.setState({
      addingRestaurant: false,
      restaurantOption: ""
    });
  };

  spinRoulette = () => {
    const { restaurantList } = this.state;
    const filteredList = restaurantList.filter(r => r.is_open_now);
    if (!filteredList.length) {
      return window.toastr.warning("All restaurants are closed.");
    }
    const index = random(0, filteredList.length - 1);
    const restaurant = filteredList[index];
    this.setState({
      chosenRestaurant: restaurant.name
    });
  };

  removeRestaurant = removeIndex => {
    this.setState(prevState => ({
      restaurantList: prevState.restaurantList.filter(
        (r, i) => i !== removeIndex
      )
    }));
  };

  getLatLng = () => {
    const { latitude, longitude } = this.state;
    const { coords } = this.props;
    if (latitude || longitude) {
      return {
        latitude: latitude,
        longitude: longitude
      };
    } else if (coords) {
      return {
        usingCurrentLocation: true,
        latitude: coords.latitude,
        longitude: coords.longitude
      };
    }
  };

  getAutocompleteOptions = async inputValue => {
    const coords = this.getLatLng();
    if (coords) {
      try {
        const result = await axios.get("/autocomplete-yelp-suggestions", {
          params: {
            text: inputValue,
            ...coords
          }
        });
        const businesses = get(result, "data.jsonBody.businesses", []);
        const keyedCurrentRestaurants = keyBy(this.state.restaurantList, "id");
        return businesses.reduce((acc, business) => {
          if (!keyedCurrentRestaurants[business.id]) {
            acc.push({
              value: business.id,
              label: business.name
            });
          }
          return acc;
        }, []);
      } catch (error) {
        console.error("error:", error);
        window.toastr.error("Error getting options.");
        return [];
      }
    }
  };

  selectRestaurant = async restaurantOption => {
    this.setState({
      restaurantOption
    });
  };

  handleGeocode = async address => {
    this.setState({
      isGeocoding: true
    });
    try {
      const res = await geocodeByAddress(address);
      const { lat, lng } = await getLatLng(res[0]);
      this.setState({
        latitude: lat,
        longitude: lng
      });
    } catch (error) {
      console.error("error:", error);
      window.toastr.error("Error finding location.");
    }
    this.setState({
      isGeocoding: false
    });
  };

  render() {
    const {
      restaurantList,
      chosenRestaurant,
      restaurantOption,
      addingRestaurant,
      isGeocoding,
      loadingInitialList
    } = this.state;

    const { usingCurrentLocation } = this.getLatLng() || {};

    return (
      <div className="app">
        <h1 style={{ textAlign: "center" }}>Restaurant Roulette</h1>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ minWidth: 200 }}>
            <div style={{ marginBottom: 20, width: 300 }}>
              <FormGroup label="Choose location:">
                <LocationSearch handleGeocode={this.handleGeocode} />
              </FormGroup>
              {isGeocoding && <Spinner size="20" />}
              {!this.getLatLng() && (
                <BlueprintError error="Please choose a location or enable location services." />
              )}
              {usingCurrentLocation && (
                <div
                  className={classNames(Classes.TEXT_MUTED, Classes.TEXT_SMALL)}
                >
                  Using Current Location
                </div>
              )}
            </div>
            <div style={{ color: "black" }}>
              <FormGroup label="Select Restaurant:">
                <AsyncSelect
                  cacheOptions
                  value={restaurantOption}
                  onChange={this.selectRestaurant}
                  loadOptions={this.getAutocompleteOptions}
                />
              </FormGroup>
            </div>
            <Button
              style={{ marginTop: 15 }}
              loading={addingRestaurant}
              text="Add Restuarant"
              onClick={this.addRestaurantToList}
            />
          </div>
          <div style={{ marginLeft: 40 }}>
            <RestaurantList restaurantList={restaurantList} />

            <div className={Classes.DIALOG_FOOTER} style={{ marginTop: 20 }}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button
                  disabled={!restaurantList.length}
                  intent="danger"
                  text="Clear"
                  onClick={this.clearList}
                />
                <Button
                  loading={loadingInitialList}
                  disabled={!restaurantList.length}
                  intent="primary"
                  text="Spin Roulette"
                  onClick={this.spinRoulette}
                />
              </div>
            </div>
          </div>
          {chosenRestaurant && (
            <div style={{ marginTop: 25 }}>
              You are going to:
              <h2>{chosenRestaurant}</h2>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false
  },
  userDecisionTimeout: 5000
})(App);

// function onEnterHelper(callback) {
//   return {
//     onKeyDown: function(event) {
//       if (event.key === "Enter") {
//         callback(event);
//       }
//     }
//   };
// }
