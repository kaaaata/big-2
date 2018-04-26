import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
// import store from './redux/store';
import axios from 'axios';
import * as functions from './functions';
import './styles/App.css';

const mapStateToProps = () => {return{}};
const mapDispatchToProps = () => {return{}};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(class App extends Component {
  // async pingApi() {
  //   const getCookie = (name) => {
  //     var value = "; " + document.cookie;
  //     var parts = value.split("; " + name + "=");
  //     if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  //   };
    
  //   const res = await axios.post('/api/', JSON.stringify(['an array']), { headers: { 'X-CSRFToken': getCookie('csrftoken') } });

  //   console.log(res.data);
  // }

  render() {
    return (
      <main className="app">
        Big 2
        <button onClick={() => functions.post('/api/test', 'test post')}>Post The Django API</button>
        <button onClick={() => functions.get('/api/test', 'test get')}>Get The Django API</button>
      </main>
    );
  }
}));
