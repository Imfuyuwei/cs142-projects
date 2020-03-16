import React from "react";
import {
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  FormLabel,
  FormControlLabel,
  Checkbox,
  FormGroup
} from "@material-ui/core";
import { Link } from "react-router-dom";
import "./TopBar.css";
const axios = require("axios").default;

/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: this.props.view,
      uploadDialogOpen: false,
      specifyPermissions: false,
      otherUsers: [],
      usersChecked: {}
    };
    axios
      .get("/otherUsers/list")
      .then(response => {
        this.setState({ otherUsers: response.data });
      })
      .catch(err => console.log(err.response));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.view !== this.props.view) {
      this.setState({ view: this.props.view });
    }
    if (prevProps.current_user !== this.props.current_user) {
      axios
        .get("/otherUsers/list")
        .then(response => {
          this.setState({
            otherUsers: response.data,
            specifyPermissions: false,
            usersChecked: {}
          });
        })
        .catch(err => console.log(err.response));
    }
  }

  handleLogOut = () => {
    axios
      .post("/admin/logout", {})
      .then(() => {
        this.props.changeLoggedIn(undefined);
      })
      .catch(err => console.log(err.response));
  };

  //this function is called when user presses the update button
  handleUploadButtonClicked = e => {
    //deal with the friends selected.
    let self = this;
    e.preventDefault();
    if (!this.state.specifyPermissions) {
      this.setState({
        usersChecked: this.state.otherUsers.map(({ _id }) => {
          return { [_id]: true };
        })
      });
    }
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append("uploadedphoto", this.uploadInput.files[0]);
      domForm.append("usersPermissed", JSON.stringify(this.state.usersChecked));
      axios
        .post("/photos/new", domForm)
        .then(() => {
          self.setState({
            uploadDialogOpen: false,
            specifyPermissions: false,
            usersChecked: {}
          });
          window.location.href = `#/photos/${this.props.current_user._id}`;
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  };

  handleCloseDialog = () => {
    this.setState({ uploadDialogOpen: false });
  };

  uploadButton = () => {
    this.setState({ uploadDialogOpen: true });
  };

  changeSpecifyPermits = () => {
    this.setState({ specifyPermissions: !this.state.specifyPermissions });
  };

  changeFriendPermit = id => () => {
    let { usersChecked } = this.state;
    usersChecked[id] = !usersChecked[id];
    this.setState({ usersChecked });
  };

  render() {
    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
        <Toolbar>
          {this.props.current_user ? (
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item xs={5}>
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  justify="flex-start"
                  spacing={8}
                >
                  <Grid item>
                    <Typography variant="h5">{this.state.view}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={5}>
                <Grid
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <Typography variant="h5">
                      Hi {this.props.current_user.first_name}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Link to="/favorites">
                      <Button
                        onClick={() => this.props.changeView("Favorites", "")}
                        variant="contained"
                      >
                        Favorites
                      </Button>
                    </Link>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={this.uploadButton}
                    >
                      Upload Photo
                    </Button>
                    <Dialog
                      open={this.state.uploadDialogOpen}
                      onClose={this.handleCloseDialog}
                    >
                      <form
                        className="upload-photo"
                        onSubmit={this.handleUploadButtonClicked}
                      >
                        <FormLabel>
                          <input
                            type="file"
                            accept="image/*"
                            ref={domFileRef => {
                              this.uploadInput = domFileRef;
                            }}
                          />
                        </FormLabel>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={this.state.specifyPermissions}
                                onChange={this.changeSpecifyPermits}
                              />
                            }
                            label="Specify permissions?"
                          />
                        </FormGroup>
                        {this.state.specifyPermissions && (
                          <div>
                            <FormLabel>
                              Choose the friends who get viewing permissions:
                            </FormLabel>
                            <FormGroup>
                              {this.state.otherUsers &&
                                this.state.otherUsers.map(userObj => {
                                  //userObj has _id, first_name, last_name
                                  return (
                                    <FormControlLabel
                                      key={userObj._id}
                                      control={
                                        <Checkbox
                                          checked={
                                            this.state.usersChecked[userObj._id]
                                          }
                                          onChange={this.changeFriendPermit(
                                            userObj._id
                                          )}
                                          value={userObj._id}
                                        />
                                      }
                                      label={`${userObj.first_name} ${userObj.last_name}`}
                                    />
                                  );
                                })}
                            </FormGroup>
                          </div>
                        )}

                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                        >
                          Post
                        </Button>
                      </form>
                    </Dialog>
                  </Grid>

                  <Grid item>
                    <Button onClick={this.handleLogOut} variant="contained">
                      Log out
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="h5">Please login</Typography>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
