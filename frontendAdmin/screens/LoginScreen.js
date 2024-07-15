import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
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

// URL do servidor Socket.IO (substitua pelo endereço do seu backend)
//const socketUrl = "http://localhost:5000"; // Exemplo de URL, ajuste conforme necessário
const socketUrl = "https://willows-production.up.railway.app";

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [socket, setSocket] = useState(null);

  // Conectar ao servidor Socket.IO ao montar o componente
  // se receber um sinal de  userLogginIn, da um console.log
  useEffect(() => {
    const socket = io(socketUrl);
    setSocket(socket);

    // Lidar com eventos recebidos do servidor
    socket.on("userLoggedIn", (user) => {
      console.log("Usuário Logado:", user);
    });
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLogin = async () => {
    try {
      console.log("Auth URL:", REACT_APP_AUTH_URL);
      console.log("Phone Number:", username);
      console.log("Password:", password);

      const response = await axios.post(`${REACT_APP_AUTH_URL}/login`, {
        username,
        password,
      });

      console.log("Response:", response.data.token);

      await AsyncStorage.setItem("token", response.data.token);

      // Chame a função onLogin e passe o token recebido
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
    <View style={styles.container}>
      <Text style={styles.title}>Willow's Bar</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setUsername}
          value={username}
          placeholder="Username"
          keyboardType="name-phone-pad"
        />
        <Ionicons
          name="person-outline"
          size={24}
          color="grey"
          style={styles.phoneIcon}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="Password"
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={passwordVisible ? "eye-outline" : "eye-off-outline"}
            size={24}
            color="grey"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: wp("4%"),
    backgroundColor: "#fff",
  },
  title: {
    fontSize: wp("6%"),
    marginBottom: hp("3%"),
    fontWeight: "bold",
  },
  logoIcon: {
    width: wp("30%"),
    height: wp("30%"),
    marginTop: hp("1%"),
    marginBottom: hp("4%"),
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
    borderColor: "#ddd",
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
    backgroundColor: "#fff",
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
  forgotPassword: {
    color: "#0ed1c0",
    marginTop: hp("2.5%"),
    fontSize: wp("3.5%"),
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: hp("2.5%"),
  },
  signupText: {
    color: "#0ed1c0",
    marginLeft: wp("1%"),
    fontSize: wp("3.5%"),
  },
});

export default LoginScreen;
