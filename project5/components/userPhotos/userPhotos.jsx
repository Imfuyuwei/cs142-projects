import React from 'react';
import {
  Typography, 
  Grid,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  
} from '@material-ui/core';
import {
  Link 
} from 'react-router-dom';
import './userPhotos.css';


const PHOTOS =  "Photos of ";

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.user = window.cs142models.userModel(props.match.params.userId);
    this.photos = window.cs142models.photoOfUserModel(this.user._id);
    this.props.changeView(PHOTOS, `${this.user.first_name} ${this.user.last_name}`)
  }
  render() {
    return (
      <Grid container 
      justify="space-evenly"
      alignItems="flex-start">
        <Grid item xs={12}>
          <Typography variant="h3">
            {this.user.first_name} {this.user.last_name}
          </Typography>
        </Grid>
        {this.photos.map(photo => (
          <Grid item xs={6} key={photo._id}>
            <Card className="card">
      <CardHeader
        title={`${photo.date_time}`}
      />
      <CardMedia
        component="img"
        height="300"
        width="300"
        image={`/images/${photo.file_name}`}
        title={this.user.first_name}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
        {photo.comments ? photo.comments.map(comment => {
              return (
                <Grid container key={comment._id}>
                  <Grid item xs={2}>{comment.date_time}</Grid>
                  <Grid item xs={2}>
                    <Link to={`/users/${comment.user._id}`}>
                    {`${comment.user.first_name} ${comment.user.last_name}`}
                    </Link>
                  </Grid>
                  <Grid item xs={8}>{comment.comment}</Grid>
                </Grid>
              );
            }) : null}
        </Typography>
      </CardContent>
    </Card>
          </Grid>
        ))}
      </Grid>

    );
  }
}

export default UserPhotos;
