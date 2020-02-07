import React from 'react';
import Example from '../example/Example';
import States from '../states/States';
import './Dynamic.css'

const STATE = 'State';
const EXAMPLE = 'Example';

class Dynamic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: STATE,
        }
    }

    handleViewChange = () => {
        var newState = this.state.view == STATE ? EXAMPLE : STATE;
        this.setState({view: newState});
    }

    render () {
        return (
            <div>
                <button id='dynamic-button' 
                    onClick={this.handleViewChange}>
                        {`Switch to ${this.state.view == STATE ? EXAMPLE : STATE} view`} 
                </button>
                {this.state.view == STATE ? <States /> : <Example />}
            </div>
        );
    }
}
export default Dynamic;