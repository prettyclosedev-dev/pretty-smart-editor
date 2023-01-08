import React, { Component } from "react";
import { connect } from "react-redux";

import * as AppActions from "../data/redux/actions/app-actions";

import Main from "../components/Main";
import Home from "../modules/Home";
import Editor from "../modules/Editor";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import theme, { primary_colors } from "../ui/material_ui_raw_theme_file";

import { Grommet } from "grommet";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import _ from "lodash";

let myGrommetTheme = {
  global: {
    font: {
      family: "Poppins",
    },
  },
  tab: {
    color: primary_colors["1"],
    border: {
      color: primary_colors["1"],
    },
  },
};

class App extends Component {
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {};
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener(
      "resize",
      this.updateWindowDimensions.bind(this)
    );
  }

  _setState = (params) => {
    if (this._isMounted) this.setState(params);
  };

  componentDidMount() {
    this.props.getCurrentUser();
    this.props.appInit();
    window.addEventListener("resize", this.updateWindowDimensions.bind(this));
  }

  componentDidMount() {
    this.updateWindowDimensions();
  }

  updateWindowDimensions() {
    console.log("dimensions", window.innerWidth, window.innerHeight);
    this.props.appDimensions(window.innerWidth, window.innerHeight);
  }

  render() {
    return (
      <div>
        <MuiThemeProvider muiTheme={theme}>
          <Grommet theme={myGrommetTheme}>
            <Main>
              <BrowserRouter>
                <div>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/editor" element={<Editor />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </Main>
          </Grommet>
        </MuiThemeProvider>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: _.has(state.user.data, "email") ? state.user.data : null,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getCurrentUser: () => {},

    appInit: () => {
      dispatch(AppActions.appInit({ hash: window.location.hash }));
    },

    appDimensions: (width, height) => {
      dispatch(AppActions.appDimensions(width, height));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
