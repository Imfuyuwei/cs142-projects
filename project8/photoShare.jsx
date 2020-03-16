import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { Grid, Paper } from "@material-ui/core";
import "./styles/main.css";

// import necessary components
import LoginRegister from "./components/LoginRegister/LoginRegister";
import TopBar from "./components/topBar/TopBar";
import Favorites from "./components/favorites/Favorites";
import UserDetail from "./components/userDetail/UserDetail";
import UserList from "./components/userList/UserList";
import UserPhotos from "./components/userPhotos/UserPhotos";
const axios = require("axios").default;

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "Home",
      isLoggedIn: true,
      login_name: undefined,
      current_user: undefined
    };
    this.changeView = this.changeView.bind(this);
    this.changeLoggedIn = this.changeLoggedIn.bind(this);

    axios
      .get("/admin/current")
      .then(response => {
        //message 200
        let user = response.data;
        console.log(user);
        this.setState({ current_user: user });
      })
      .catch(() => {
        this.setState({ current_user: undefined });
      });
  }

  //name is optional
  changeView = (newView, name) => {
    this.setState({ view: newView + (name && name) });
  };

  changeLoggedIn = newUser => {
    this.setState({ current_user: newUser });
  };

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar
                view={this.state.view}
                changeLoggedIn={this.changeLoggedIn}
                current_user={this.state.current_user}
                changeView={this.changeView}
              />
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                {this.state.current_user ? <UserList /> : null}
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="cs142-main-grid-item">
                <Switch>
                  {this.state.current_user ? (
                    <Redirect
                      path="/login-register"
                      to={`/users/${this.state.current_user._id}`}
                    />
                  ) : (
                    <Route
                      path="/login-register"
                      render={props => (
                        <LoginRegister
                          {...props}
                          changeLoggedIn={this.changeLoggedIn}
                        />
                      )}
                    />
                  )}

                  {this.state.current_user ? (
                    <Route
                      path="/favorites"
                      render={props => <Favorites {...props} />}
                    />
                  ) : (
                    <Redirect path="/favorites" to="/login-register" />
                  )}
                  {this.state.current_user ? (
                    <Route
                      path="/users/:userId"
                      render={props => (
                        <UserDetail {...props} changeView={this.changeView} />
                      )}
                    />
                  ) : (
                    <Redirect path="/users/:userId" to="/login-register" />
                  )}
                  {this.state.current_user ? (
                    <Route
                      path="/photos/:userId"
                      render={props => (
                        <UserPhotos
                          changeView={this.changeView}
                          curr_user_id={this.state.current_user._id}
                          {...props}
                        />
                      )}
                    />
                  ) : (
                    <Redirect path="/photos/:userId" to="/login-register" />
                  )}
                  {this.state.current_user ? (
                    <Redirect
                      path="/"
                      to={`/users/${this.state.current_user._id}`}
                    />
                  ) : (
                    <Redirect path="/" to="/login-register" />
                  )}
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
