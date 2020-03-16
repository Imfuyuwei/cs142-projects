import React from "react";
import { Typography, Grid } from "@material-ui/core";
import "./userPhotos.css";
import PhotoCard from "./PhotoCard";
const axios = require("axios").default;

const PHOTOS = "Photos of ";

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: "",
      photos: undefined,
      favorite_ids: [] //should be an array of photo ids
    };

    this.userId = props.match.params.userId;
    this.user = undefined; //the user on whose page we're on
    this.refreshCards = this.refreshCards.bind(this);
    this.refreshCards();
    axios
      .get(`/user/${this.userId}`)
      .then(response => {
        this.user = response.data;
        this.props.changeView(
          PHOTOS,
          `${this.user.first_name} ${this.user.last_name}`
        );
      })
      .catch(err => console.log(err.response));
  }

  refreshCards() {
    //refresh the photos and the database
    axios
      .get(`/photosOfUser/${this.userId}`)
      .then(response => {
        this.setState({ photos: response.data }); //photo is an object
      })
      .catch(err => {
        console.log(err.response);
      });

    axios
      .get(`/getFavorites`)
      .then(response => {
        let favorite_ids = response.data.map(photo => photo._id);
        this.setState({ favorite_ids });
      })
      .catch(() => this.setState({ favorite_ids: [] }));
  }

  render() {
    return this.user ? (
      <div>
        <Typography variant="h3">
          {this.user.first_name} {this.user.last_name}&apos;s photos
        </Typography>
        <br />
        <br />
        <Grid
          container
          direction="column"
          padding={8}
          justify="space-between"
          alignItems="center"
        >
          {this.state.photos ? (
            this.state.photos
              .sort(
                (photo1, photo2) =>
                  photo2.liked_by.length - photo1.liked_by.length
              )
              .map(
                photo =>
                  photo.users_permitted.indexOf(this.props.curr_user_id) >
                    -1 && (
                    <Grid item xs key={photo._id} style={{ width: "60%" }}>
                      <PhotoCard
                        style={{}}
                        favorited={
                          this.state.favorite_ids.indexOf(photo._id) > -1
                        }
                        creator={this.user}
                        refreshCards={this.refreshCards}
                        liked={
                          photo.liked_by.indexOf(this.props.curr_user_id) > -1
                        }
                        photo={photo}
                      />
                      <br />
                    </Grid>
                  )
              )
          ) : (
            <div />
          )}
        </Grid>
      </div>
    ) : (
      <div />
    );
  }
}

export default UserPhotos;
