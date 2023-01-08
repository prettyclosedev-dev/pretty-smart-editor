import React, { Component } from "react";

import Header from "./Header";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import Footer from "./Footer";

import { primary_colors } from "../ui/material_ui_raw_theme_file";

import { connect } from "react-redux";

class Main extends Component {
  constructor(props) {
    super(props);

    this._isMounted = true;
    this.state = {
      isMobile: window.innerWidth < 992,
      // window_width: window.innerWidth,
      // window_height: window.innerHeight
    };
  }

  componentWillUnmount() {
    this._isMounted = false;
    // window.removeEventListener('resize', this.updateWindowDimensions.bind(this));
  }

  _setState = (params) => {
    if (this._isMounted) this.setState(params);
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateWindowDimensions.bind(this));
  }

  updateWindowDimensions() {
    this.setState({ isMobile: window.innerWidth < 992 });
  }

  // updateWindowDimensions() {
  //   this.setState({ window_width: window.innerWidth, window_height: window.innerHeight });
  // }

  render() {
    let { user, userUpdating, children } = this.props;
    // let { window_width, window_height } = this.state;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          // padding: 10,
          backgroundColor: "#FFFFFF",
        }}
      >
        <TopBar />

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            // padding: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              flexWrap: "nowrap",
              alignItems: "flex-start",
            }}
          >
            <SideBar />

            <div id="main_content_section" style={{ flex: 1, display: 'flex', height: "100vh", width: "100vw" }}>
              {children}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: primary_colors["2"],
            margin: "0px -10px -10px -10px",
            padding: "10px 20px 10px 20px",
          }}
        >
          <Footer />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.data || {},
    userUpdating: state.user.isFetching,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {};
};
export default connect(mapStateToProps, mapDispatchToProps)(Main);
