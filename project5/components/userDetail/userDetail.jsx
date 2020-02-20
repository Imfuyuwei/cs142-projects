import React from 'react';
import {
  Typography
} from '@material-ui/core';
import './userDetail.css';
import {
  Link
} from 'react-router-dom';

// import {MAIN, PHOTOS, DETAILS} from '../../constants';
const DETAILS = "Info about ";


/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    let newUser = window.cs142models.userModel(props.match.params.userId);
    this.state = {
      user: newUser
    }
    this.props.changeView(DETAILS, `${newUser.first_name} ${newUser.last_name}`);
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      let newUser = window.cs142models.userModel(this.props.match.params.userId);
      this.setState({user: newUser})
      this.props.changeView(DETAILS, `${newUser.first_name} ${newUser.last_name}`);
    }
  }

  render() {
    return (
      <div>
        <Typography variant="h3">
            {`${this.state.user.first_name} ${this.state.user.last_name}`}
        </Typography>

          <Typography variant="h5">
            {this.state.user.location} <br/>
            {this.state.user.occupation}
          </Typography>
          <Typography variant="body1">
            {this.state.user.description}
          </Typography>
          <Link 
            to={`/photos/${this.state.user._id}`}>
            See photos
          </Link>
      </div>
      
    );
  }
}

export default UserDetail;
