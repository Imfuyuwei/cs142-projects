import React from 'react';

class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      person: {name: 'Jack'},
      greeting: 'Hi',
      buttonShow: true,
      buttonClicks: 5
    };
    this.favColors = [{name: 'Fred', color: 'Red'}, {name: 'Sue', color: 'Blue'}];

    this.handleChange = this.handleChange.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  handleChange(event) {
    var newName = {name: event.target.value};
    this.setState({person: newName});
  }

  handleButtonClick(event) {
    this.setState({buttonClicks: this.state.buttonClicks+1})
  }

  render(props) {
    return (
      <div>
        <label htmlFor="inId">Name:</label>
        <input id="inId" type="text" value={this.state.person.name}
          onChange={this.handleChange} placeholder="Enter a name" / >
        <h1>
          {this.state.greeting} {this.state.person.name}!
        </h1>
        <ol>
          {
            this.favColors.map((c) => <li key={c.name}>
              <span>{c.name}'s favorite color is {c.color}</span>
            </li>)
          }
        </ol>
        {
            this.state.buttonShow ?
                <button onClick={this.handleButtonClick}>
                  Button #1 (has been clicked {this.state.buttonClicks} times)
                </button>
              : null
        }
        {
            (this.state.buttonClicks % 2) ?
                <p>
                  Button #1 was clicked an ODD number of times
                </p>
              :
                <p>
                  Button #1 was clicked an EVEN number of times
                </p>
       }
    </div>
    );
  }
}

export default Test;
