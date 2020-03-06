import React from "react";
import {
  Typography,
  Grid,
} from "@material-ui/core";
import "./userPhotos.css";
import PhotoCard from './PhotoCard';
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
      photos: undefined
    };
    this.userId = props.match.params.userId;
    this.user = undefined;
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

  refreshCards () {
    //refresh the photos and the database
    axios
      .get(`/photosOfUser/${this.userId}`)
      .then(response => {
        this.setState({ photos: response.data });
      })
      .catch(err => {
        console.log(err.response);
      });
  }

  render() {
    return this.user ? (
      <Grid container justify="space-evenly" alignItems="flex-start">
        <Grid item xs={12}>
          <Typography variant="h3">
            {this.user.first_name} {this.user.last_name}&apos;s photos
          </Typography>
        </Grid>
        {this.state.photos ? (
          this.state.photos.map(photo => (
            <Grid item xs={6} key={photo._id}>
              <PhotoCard 
                creator={this.user}
                refreshCards={this.refreshCards} 
                photo={photo}/>
            </Grid>
          ))
        ) : (
          <div />
        )}
      </Grid>
    ) : (
      <div />
    );
  }
}

export default UserPhotos;
