import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {chats: []}

  componentDidMount() {
    fetch('/chats')
    .then(res => res.json())
    .then(chats => this.setState({ chats }));
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1> Chats</>
            {this.state.chats.map(chat =>
              <div key={chat.id}>{chat.message}</div>
            )}
        </div>
      </div>
    );
  }
}

export default App;
