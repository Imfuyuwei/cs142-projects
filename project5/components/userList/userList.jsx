import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
}
from '@material-ui/core';
import {
  Link
} from 'react-router-dom';
import './userList.css';

/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <List component="nav">
          {window.cs142models.userListModel().map((user) => {
            return (
              <Link to={`/users/${user._id}`} key={user._id}>
                <ListItem>
                  <ListItemText primary={`${user.first_name} ${user.last_name}`} />
                </ListItem>
                <Divider/>
              </Link>
            );
          })}
        </List>
      </div>
    );
  }
}

export default UserList;
