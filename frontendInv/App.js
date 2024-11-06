//App.js
import React from "react";
import { ThemeProvider } from "./ThemeContext";
import AppNavigator from "./navigation/AppNavigator";

const App = () => (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
);

export default App;
