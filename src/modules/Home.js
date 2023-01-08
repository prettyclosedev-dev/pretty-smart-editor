import React, { Component } from 'react'

export default class Home extends Component {
  render() {
    return (
      <div style={{}}>
        <button onClick={() => window.location.assign('/editor')}>editor</button>
      </div>
    )
  }
}
