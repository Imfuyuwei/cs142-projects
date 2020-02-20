import React from "react";
import { Divider, List, ListItem, ListItemText } from "@material-ui/core";
import { Link } from "react-router-dom";
import "./userList.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: undefined
    }
    let prom = fetchModel(`http://localhost:3000/user/list`);
    prom.then(response => {
      this.setState({users: response.data});
    });
  }

  render() {
    return this.state.users ? (
      <div>
        <List component="nav">
          {this.state.users.map(user => {
            return (
              <Link to={`/users/${user._id}`} key={user._id}>
                <ListItem>
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                  />
                </ListItem>
                <Divider />
              </Link>
            );
          })}
        </List>
      </div>
    ) : (
      <div />
    );
  }
}

export default UserList;
