import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Switch,
} from "react-native";
import axios from "axios";
import { REACT_APP_AUTH_URL } from "@env";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import { useTheme } from "../ThemeContext"; // Certifique-se de que o caminho está correto
import { colors } from "../config/theme";
const socketUrl = "https://willows-production.up.railway.app";

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [socket, setSocket] = useState(null);
  const { isDarkMode, toggleTheme } = useTheme();

  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    const socket = io(socketUrl);
    setSocket(socket);

    socket.on("userLoggedIn", (user) => {
      console.log("Usuário Logado:", user);
    });
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${REACT_APP_AUTH_URL}/login`, {
        username,
        password,
      });

      await AsyncStorage.setItem("token", response.data.token);

      onLogin(response.data.token);
    } catch (error) {
      console.error(
        "Login error:",
        error.response ? error.response.data : error.message
      );
      Alert.alert(
        "Erro ao fazer login",
        "Verifique suas credenciais e tente novamente."
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <Text style={[styles.title, { color: COLORS.text }]}>Willow's Bar</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: COLORS.secondary,
              color: COLORS.text,
              borderColor: COLORS.neutral,
            },
          ]}
          onChangeText={setUsername}
          value={username}
          placeholder="Username"
          placeholderTextColor={COLORS.text}
          inputMode="name-phone-pad"
        />
        <Ionicons
          name="person-outline"
          size={24}
          color={COLORS.text}
          style={styles.phoneIcon}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: COLORS.secondary,
              color: COLORS.text,
              borderColor: COLORS.neutral,
            },
          ]}
          onChangeText={setPassword}
          value={password}
          placeholder="Password"
          placeholderTextColor={COLORS.text}
          secureTextEntry={!passwordVisible}
        />
        <Pressable onPress={togglePasswordVisibility} style={styles.eyeIcon}>
          <Ionicons
            name={passwordVisible ? "eye-outline" : "eye-off-outline"}
            size={24}
            color={COLORS.text}
          />
        </Pressable>
      </View>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: COLORS.accent, borderColor: COLORS.neutral },
        ]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <View style={styles.themeSwitchContainer}>
        <Text style={[styles.themeSwitchText, { color: COLORS.text }]}>
          Dark Mode
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.dark.accent, true: colors.dark.accent }}
          thumbColor={isDarkMode ? colors.light.text : colors.dark.text}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: wp("4%"),
  },
  title: {
    fontSize: wp("6%"),
    marginBottom: hp("3%"),
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  input: {
    flex: 1,
    height: hp("7%"),
    marginVertical: hp("1%"),
    borderWidth: 1,
    padding: wp("2.5%"),
    borderRadius: 5,
  },
  phoneIcon: {
    position: "absolute",
    right: wp("2.5%"),
    padding: wp("2.5%"),
  },
  eyeIcon: {
    position: "absolute",
    right: wp("2.5%"),
    padding: wp("2.5%"),
  },
  button: {
    borderRadius: 25,
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("6%"),
    alignItems: "center",
    marginTop: hp("2.5%"),
    width: "100%",
    borderWidth: 1,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: wp("4%"),
  },
  themeSwitchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("2%"),
  },
  themeSwitchText: {
    marginRight: wp("2%"),
    fontSize: wp("4%"),
  },
});

export default LoginScreen;
