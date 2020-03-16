import React from "react";
import {
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Tooltip
} from "@material-ui/core";
import { MentionsInput, Mention } from "react-mentions";
import {
  Send,
  Favorite,
  FavoriteBorder,
  Clear,
  ThumbUp,
  ThumbUpOutlined
} from "@material-ui/icons";
import { Link } from "react-router-dom";
import "./PhotoCard.css";
import mentionStyle from "./mentionStyle";
import mentionStylePhoto from "./mentionStylePhoto";
const axios = require("axios").default;
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const mentionRegex = /@\[(\S+ \S+)( )*\]\(\S+\)/g;

/**
 * PhotoCard
 * props: refreshCards(), photo obj, creator
 * photo obj has _id
 */
class PhotoCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: undefined,
      users: undefined,
      mentionsToAdd: [],
      favorited: props.favorited,
      photoTagMaybe: "",
      cropParams: {
        unit: "%"
      },
      tags: [],
      displayPhotoTagInput: false,
      displayTags: false,
      liked: props.liked
    };
    axios
      .get(`/user/mentionOptions`)
      .then(response => {
        this.setState({ users: response.data });
      })
      .catch(err => {
        console.log(err.response);
      });
  }

  handleAddComment = (event, photo_id) => {
    event.preventDefault();
    axios
      .post(`/commentsOfPhoto/${photo_id}`, {
        comment: this.state.comment,
        mentionsToAdd: this.state.mentionsToAdd
      })
      .then(() => {
        this.setState({ comment: "", mentionsToAdd: [] });
        this.props.refreshCards();
      })
      .catch(err => {
        console.log(err.response);
      });
  };

  handleChangeInput = event => {
    this.setState({ comment: event.target.value });
  };

  handlePhotoTagInput = event => {
    this.setState({ photoTagMaybe: event.target.value });
  };

  handleFavorite = () => {
    axios
      .post(`/addToFavorites`, { photo_id: this.props.photo._id })
      .then(() => {
        this.props.refreshCards();
      })
      .catch(err => {
        console.log(err.response);
      });
  };

  handleLikeOrUnlike = () => {
    axios
      .post(`/likeOrUnlike/${this.props.photo._id}`, {
        like: !this.state.liked
      })
      .then(() => {
        this.setState({ liked: !this.state.liked });
        this.props.refreshCards();
      })
      .catch(err => console.log(err.response));
  };

  startDrag = () => {
    this.setState({ displayPhotoTagInput: false });
  };

  handleDragging = (crop, percentCrop) => {
    this.setState({ cropParams: percentCrop });
  };

  endDrag = () => {
    this.setState({ displayPhotoTagInput: true });
  };

  submitPhotoTag = (id, full_name) => {
    let { x, y, width, height } = this.state.cropParams;
    axios
      .post(`/addPhotoTag/${this.props.photo._id}`, {
        user_id: id,
        x,
        y,
        width,
        height,
        full_name
      })
      .then(() => {
        this.setState({
          displayPhotoTagInput: false,
          photoTagMaybe: "",
          cropParams: { unit: "%" }
        });
        this.props.refreshCards();
      })
      .catch(err => console.log(err.response));
  };

  toggleTagsDisplay = display => this.setState({ displayTags: display });

  render() {
    return (
      <Card
        className="photo-card"
        onMouseEnter={() => this.toggleTagsDisplay(true)}
        onMouseLeave={() => this.toggleTagsDisplay(false)}
      >
        <CardHeader title={`${this.props.photo.date_time}`} />
        <ReactCrop
          className="my-react-crop"
          src={`/images/${this.props.photo.file_name}`}
          onChange={(crop, percentCrop) =>
            this.handleDragging(crop, percentCrop)
          }
          onDragEnd={this.endDrag}
          onDragStart={this.startDrag}
          crop={this.state.cropParams}
        >
          {this.state.displayTags
            ? this.props.photo.tags.map((tag, i) => (
                <Tooltip
                  key={i}
                  interactive
                  title={
                    <Link id="hover-for-name" to={`/users/${tag.user_id}`}>
                      {tag.full_name}
                    </Link>
                  }
                >
                  <div
                    className="rect-tag-crop"
                    style={{
                      width: `${tag.width}%`,
                      height: `${tag.height}%`,
                      left: `${tag.x}%`,
                      top: `${tag.y}%`
                    }}
                  />
                </Tooltip>
              ))
            : null}
          {this.state.displayPhotoTagInput && this.state.cropParams.width > 1 && (
            <div
              //this position is
              className="tag-input-photo"
              style={{
                left: `${this.state.cropParams.x}%`,
                top: `${this.state.cropParams.y}%`
              }}
              //try setting the left and right of THIS
            >
              <MentionsInput
                value={this.state.photoTagMaybe}
                onChange={this.handlePhotoTagInput}
                allowSuggestionsAboveCursor
                singleLine
                style={(function() {
                  let style = mentionStylePhoto;
                  style.right = 30;
                  return style;
                })()}
              >
                <Mention
                  trigger=""
                  data={this.state.users}
                  displayTransform={(id, display) => `${display}`}
                  onAdd={this.submitPhotoTag}
                />
              </MentionsInput>
              <Button
                variant="contained"
                color="primary"
                style={{ left: 170, width: 30 }}
                onClick={() =>
                  this.setState({
                    displayPhotoTagInput: false,
                    cropParams: { unit: "%" }
                  })
                }
              >
                <Clear />
              </Button>
            </div>
          )}
        </ReactCrop>
        <CardActions>
          <IconButton
            disabled={this.props.favorited}
            aria-label="add to favorites"
            onClick={this.handleFavorite}
          >
            {this.props.favorited ? (
              <Favorite color="secondary" />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
          <IconButton aria-label="like" onClick={this.handleLikeOrUnlike}>
            {this.state.liked ? (
              <ThumbUp color="primary" />
            ) : (
              <ThumbUpOutlined />
            )}
          </IconButton>
          <Typography variant="h4" color="primary">
            {this.props.photo.liked_by.length}
          </Typography>
        </CardActions>
        <CardContent className="photo-card-content">
          {this.props.photo.comments ? (
            <div className="photo-card-comment-section">
              {this.props.photo.comments.map(comment => {
                return (
                  <Grid
                    container
                    justify="space-between"
                    padding={5}
                    key={comment._id}
                  >
                    <Grid item xs={3}>
                      <Link to={`/users/${comment.user._id}`}>
                        {`${comment.user.first_name} ${comment.user.last_name}`}
                      </Link>
                    </Grid>
                    <Grid item xs={9} className="photo-card-display-comment">
                      <Typography variant="body1">
                        {comment.comment.replace(
                          mentionRegex,
                          (match, p1) => {
                            //p1 refers to the displayed name,
                            //p2 refers to the id
                            return `@${p1}`;
                          }
                        )}
                      </Typography>
                      <Typography color="primary">
                        {comment.date_time.toString()}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              })}

              <form
                className="add-comment"
                onSubmit={event =>
                  this.handleAddComment(event, this.props.photo._id)
                }
              >
                <label className="comment-input">
                  <MentionsInput
                    value={this.state.comment}
                    onChange={this.handleChangeInput}
                    allowSuggestionsAboveCursor
                    style={mentionStyle}
                    singleLine
                    className="mention-input-comment"
                  >
                    <Mention
                      trigger="@"
                      data={this.state.users}
                      displayTransform={(id, display) => `@${display}`}
                      onAdd={(id) => {
                        let mentions = this.state.mentionsToAdd;
                        mentions.push(id);
                        this.setState({ mentionsToAdd: mentions });
                      }}
                    />
                  </MentionsInput>
                </label>

                <IconButton color="primary" type="submit">
                  <Send />
                </IconButton>
              </form>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }
}
export default PhotoCard;
