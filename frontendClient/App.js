import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import store from "./store";
import PedidosPopularesScreen from "./screens/PedidosPopularesScreen";
import PesquisaScreen from "./screens/PesquisaScreen";
import LoginScreen from "./screens/LoginScreen";
import HomePage from "./screens/HomePage";

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const TabPrincipal = () => {
  return (
    <Tab.Navigator
      activeColor="#FFFFFF"
      inactiveColor="#FFFFFF"
      barStyle={{ backgroundColor: "#f0f0f0" }}
    >
      <Tab.Screen
        name="Pedidos Populares"
        component={PedidosPopularesScreen}
        options={{
          tabBarIcon: () => <Ionicons name="star-outline" size={21} />,
        }}
      />
      <Tab.Screen
        name="Pesquisa"
        component={PesquisaScreen}
        options={{
          tabBarIcon: () => <Ionicons name="search-outline" size={21} />,
        }}
      />
    </Tab.Navigator>
  );
};

const StackPrincipal = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomePage"
        component={HomePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PedidosPopulares"
        component={TabPrincipal}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const App = () => {
  const [userToken, setUserToken] = useState(null);

  const handleLogin = (token) => {
    setUserToken(token);
  };

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer>
          {!userToken ? (
            <LoginScreen onLogin={handleLogin} />
          ) : (
            <StackPrincipal />
          )}
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;
