// src/App.js
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import store from "./store";
import { ThemeProvider } from "./ThemeContext";
import AppNavigator from "./navigation/AppNavigator";

const App = () => (
  <ReduxProvider store={store}>
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  </ReduxProvider>
);

export default App;
