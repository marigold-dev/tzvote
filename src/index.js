import { ThemeProvider, createTheme } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.tsx";
import * as serviceWorker from "./serviceWorker";

const themeLight = createTheme({
  palette: {
    primary: {
      main : "#eb3448"
    }
  }
});

ReactDOM.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3}>
    <ThemeProvider theme={themeLight}>
    <App />
    </ThemeProvider>
    </SnackbarProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
