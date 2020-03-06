import React from "react";
import { Grid, AppBar, Toolbar, Typography, Button, Dialog, Input } from "@material-ui/core";
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
      uploadDialogOpen: false
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.view !== this.props.view) {
      this.setState({ view: this.props.view });
    }
  }

  handleLogOut = () => {
    this.props.changeLoggedIn(undefined);
  };

  //this function is called when user presses the update button
  handleUploadButtonClicked = e => {
    let self = this;
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append("uploadedphoto", this.uploadInput.files[0]);
      
      axios
        .post("/photos/new", domForm)
        .then(res => {
          console.log(res);
          self.setState({uploadDialogOpen: false})
          window.location.href=`#/photos/${this.props.current_user._id}`;
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  };
  
  handleCloseDialog = () => {
    this.setState({uploadDialogOpen: false})
  }

  uploadButton = () => {
    this.setState({uploadDialogOpen: true});
  }

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
              <Grid item>
                <Typography variant="h5">{this.state.view}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="h5">
                  Hi {this.props.current_user.first_name}
                </Typography>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" onClick={this.uploadButton}>
                  Upload Photo
                </Button>
                <Dialog open={this.state.uploadDialogOpen} onClose={this.handleCloseDialog}>
                  <form onSubmit={this.handleUploadButtonClicked}>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={domFileRef => {
                        this.uploadInput = domFileRef;
                      }}
                    />
                  </label>

                  <Input color="primary" type="submit" value="Post" />
                </form>
                </Dialog>
                
              </Grid>
              <Grid item>
                <Button onClick={this.handleLogOut} variant="contained">
                  Log out
                </Button>
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
