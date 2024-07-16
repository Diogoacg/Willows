import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { registarNovoUtilizador } from "../api/apiAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CriarFuncionarioScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();

  const COLORS = isDarkMode ? colors.dark : colors.light;

  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  const handleCreateUser = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      await registarNovoUtilizador(token, username, email, password, role);
      alert("Funcionário criado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao criar funcionário:", error.message);
      alert("Falha ao criar funcionário.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name={"arrow-back-outline"}
            size={24}
            color={COLORS.accent}
          />
        </Pressable>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Criar Novo Funcionário</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome de Utilizador"
          placeholderTextColor={COLORS.text}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.text}
          value={email}
          onChangeText={setEmail}
          inputMode="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.text}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Função"
          placeholderTextColor={COLORS.text}
          value={role}
          onChangeText={setRole}
        />
        <Pressable style={styles.button} onPress={handleCreateUser}>
          <Text style={styles.buttonText}>Criar Funcionário</Text>
        </Pressable>
      </View>
    </View>
  );
};

const createStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      paddingTop: (screenHeight * 0.1) / 2,
      flex: 1,
      backgroundColor: COLORS.primary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.neutral,
    },
    backButton: {
      marginRight: 10,
    },
    formContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    title: {
      color: COLORS.text,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
    },
    input: {
      color: COLORS.text,
      width: screenWidth * 0.8,
      height: 50,
      borderColor: COLORS.neutral,
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 20,
      paddingHorizontal: 10,
      backgroundColor: COLORS.secondary,
    },
    button: {
      width: screenWidth * 0.8,
      backgroundColor: COLORS.accent,
      padding: 15,
      borderRadius: 25,
      alignItems: "center",
    },
    buttonText: {
      color: "#000",
      fontSize: 18,
      fontWeight: "bold",
    },
  });

export default CriarFuncionarioScreen;
