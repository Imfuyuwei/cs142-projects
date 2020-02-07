import React from 'react';
import ReactDOM from 'react-dom';
import Dynamic from './components/dynamic/Dynamic';
import Header from './components/header/Header';


ReactDOM.render(
    <div>
      <Header />
      <Dynamic />
    </div>,
    
    document.getElementById('reactapp'),
  );
  