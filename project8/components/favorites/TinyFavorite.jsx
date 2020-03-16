import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardMedia,
  CardHeader,
  IconButton
} from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import "./TinyFavorite.css";
const axios = require("axios").default;

/**
 * Define Favorites
 * props: photo (object with date_time, file_name, _id), refreshCards (a function)
 */
class TinyFavorite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalEnabled: false
    };
  }

  handleDeleteFavorite = event => {
    event.preventDefault();
    axios
      .get(`/deleteFavorite/${this.props.photo._id}`)
      .then(() => {
        this.props.refreshCards();
      })
      .catch(err => {
        console.log(err.response);
      });
  };

  handleClose = () => {
    this.setState({ modalEnabled: false });
  };

  handleOpen = () => {
    this.setState({ modalEnabled: true });
  };

  render() {
    return (
      <div>
        <Card id="card-tiny-fav">
          <CardHeader
            id="card-tiny-fav-header"
            action={
              <IconButton onClick={event => this.handleDeleteFavorite(event)}>
                <Clear />
              </IconButton>
            }
          />
          <CardMedia
            component="img"
            image={`/images/${this.props.photo.file_name}`}
            onClick={this.handleOpen}
          />
        </Card>
        <Dialog
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.modalEnabled}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            {this.props.photo.date_time}
          </DialogTitle>
          <DialogContent>
            <img
              className="modal-image"
              src={`/images/${this.props.photo.file_name}`}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default TinyFavorite;
