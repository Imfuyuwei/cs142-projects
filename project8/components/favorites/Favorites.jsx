import React from "react";
import { Typography, Grid, Divider } from "@material-ui/core";
import TinyFavorite from "./TinyFavorite";
const axios = require("axios").default;

/**
 * Define Favorites
 */
class Favorites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favorites: [] //should be array of objects, each with _id, date_time and file_name
    };
    console.log("favorites");
    this.refreshCards = this.refreshCards.bind(this);
    this.refreshCards();
  }

  refreshCards = () => {
    //get favorites
    axios
      .get(`/getFavorites`)
      .then(response => {
        this.setState({ favorites: response.data });
        console.log("getFavorites succeeded");
      })
      .catch(() => this.setState({ favorites: [] }));
  };

  render() {
    return (
      <Grid container justify="space-evenly" alignItems="flex-start">
        <Grid item xs={12}>
          <Typography variant="h3">Your Favorite photos</Typography>
          <br />
          <Divider />
          <br />
        </Grid>
        {this.state.favorites.map(photo => (
          <Grid item xs={2} key={photo.file_name}>
            <TinyFavorite refreshCards={this.refreshCards} photo={photo} />
          </Grid>
        ))}
      </Grid>
    );
  }
}

export default Favorites;
