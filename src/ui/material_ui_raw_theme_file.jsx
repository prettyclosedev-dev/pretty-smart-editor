import { fade } from 'material-ui/utils/colorManipulator'
import * as Colors from 'material-ui/styles/colors';
import { spacing, getMuiTheme } from 'material-ui/styles';

export const rawBaseTheme = {
  ...spacing,
  fontFamily: 'Poppins',
  appBar: {
    height: 64
  },
  palette: {
    primary1Color: '#db3965',
    primary2Color: '#191B1F',
    primary3Color: '#F4F4F4',
    accent1Color: Colors.lightBlue600,
    accent2Color: Colors.grey100,
    accent3Color: Colors.grey500,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: fade(Colors.darkBlack, 0.3)
  }
};

export const primary_colors = {
  "1": rawBaseTheme.palette.primary1Color,
  "2": rawBaseTheme.palette.primary2Color,
  "3": rawBaseTheme.palette.primary3Color
}

//Theme must be wrapped in funciton getMuiTheme
export default getMuiTheme(rawBaseTheme);
