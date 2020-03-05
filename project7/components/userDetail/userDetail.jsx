import React from "react";
import { Grid, Typography, Button } from "@material-ui/core";
import "./userDetail.css";
import { Link } from "react-router-dom";
const axios = require('axios').default;

const DETAILS = "Info about ";

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    let newUser;
    this.state = {
      user: newUser
    };
    let newUserID = props.match.params.userId;
    axios.get(`/user/${newUserID}`)
      .then(response => {
        newUser = response.data;
        this.setState({ user: response.data });
        this.props.changeView(
          DETAILS, `${newUser.first_name} ${newUser.last_name}`
        );
      })
      .catch(err => console.log(err.response));
  }



  componentDidUpdate = () => {
    let newUserID = this.props.match.params.userId;
    if (this.state.user._id !== newUserID) {
      let self = this;
      axios.get(`http://localhost:3000/user/${newUserID}`)
        .then(response => {
          let newUser = response.data;
          self.setState({ user: newUser });
          self.props.changeView(
            DETAILS,
            `${newUser.first_name} ${newUser.last_name}`
          );
        }).catch(err => console.log(err.response));
    }
  };

  render() {
    return this.state.user ? (
      <Grid container
      justify="space-evenly"
      alignItems="center"
      >
        <Grid xs={6} item>
          <Typography variant="h3">
          {`${this.state.user.first_name} ${this.state.user.last_name}`}
        </Typography>
        <Typography variant="h5">
          {this.state.user.occupation} <br />
          based in {this.state.user.location}
        </Typography>
        <Typography variant="body1">{this.state.user.description}</Typography>
        </Grid>
        <Grid xs={4} item>
          <Button variant="contained" size="large">
          <Link to={`/photos/${this.state.user._id}`}>See photos</Link>
        </Button>
        </Grid>
        
      </Grid>
    ) : (
      <div />
    );
  }
}

export default UserDetail;
