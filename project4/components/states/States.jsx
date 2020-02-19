import React from 'react';
import './States.css';

/**
 * Define States, a React componment of CS142 project #4 problem #2.  The model
 * data for this view (the state names) is available
 * at window.cs142models.statesModel().
 */
class States extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      substring: '',
    }
    console.log('window.cs142models.statesModel()', window.cs142models.statesModel());
  }

  handleFilterChange = event => {
    this.setState({substring: event.target.value})
  }

  render() {
    var results = window.cs142models.statesModel().filter(
      (state) => state.toLowerCase().includes(this.state.substring.toLowerCase())).map(
        (state) => <div key={state}>{state}</div>);
    

    return (
      <div className="cs-142-states-container">
        <h1>This will list all states with the specificed substring, &quot;{`${this.state.substring}`}&quot;.</h1>
        <h2> Note: this is case insensitive.</h2>
        <input id="cs-142-states-filterInput" type="text" 
          value={this.state.substring} 
          onChange={event => this.handleFilterChange(event)} />
        <h2>Result:</h2>
        <div id="cs-142-states-list">
          {results.length == 0 ? `No results` : results}
        </div>
      </div>
    );
  }
}

export default States;
