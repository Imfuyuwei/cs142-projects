import React from "react";
import {
  Typography,
  Grid,
  Card,
  CardHeader,
  CardMedia,
  CardContent
} from "@material-ui/core";
import { Link } from "react-router-dom";
const axios = require("axios").default;

/**
 * PhotoCard
 * props: refreshCards(), photo obj, creator
 */
class PhotoCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: ""
    };
  }

  handleAddComment = (event, photo_id) => {
    event.preventDefault();
    axios
      .post(`/commentsOfPhoto/${photo_id}`, { comment: this.state.comment })
      .then(() => {
        this.setState({ comment: "" });
        this.props.refreshCards();
      })
      .catch(err => {
        console.log(err.response);
      });
  };

  handleChangeInput = event => {
    this.setState({ comment: event.target.value });
  };

  render() {
    return (
      <Card className="card">
        <CardHeader title={`${this.props.photo.date_time}`} />
        <CardMedia
          component="img"
          width="300"
          image={`/images/${this.props.photo.file_name}`}
          title={this.props.creator.first_name}
        />
        <CardContent>
          {this.props.photo.comments ? (
            <div>
              {this.props.photo.comments.map(comment => {
                return (
                  <Grid container key={comment._id}>
                    <Grid item xs={2}>
                      <Typography>{comment.date_time.toString()}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Link to={`/users/${comment.user._id}`}>
                        {`${comment.user.first_name} ${comment.user.last_name}`}
                      </Link>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>{comment.comment}</Typography>
                    </Grid>
                  </Grid>
                );
              })}

              <form
                className="add-comment"
                onSubmit={(event) => this.handleAddComment(event, this.props.photo._id)}
              >
                <label>
                  Comment:{" "}
                  <input
                    type="text"
                    value={this.state.comment}
                    onChange={this.handleChangeInput}
                  />
                </label>

                <input type="submit" value="Post" />
              </form>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }
}
export default PhotoCard;
