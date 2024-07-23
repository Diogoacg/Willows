import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { registarNovoUtilizador } from "../api/apiAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const CriarFuncionarioScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const COLORS = isDarkMode ? colors.dark : colors.light;

  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  const animateScaleIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateScaleOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleCreateUser = async () => {
    animateScaleIn();
    const token = await AsyncStorage.getItem("token");
    try {
      await registarNovoUtilizador(token, username, email, password, role);
      alert("Funcionário criado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao criar funcionário:", error.message);
      alert("Falha ao criar funcionário.");
    } finally {
      animateScaleOut();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={"return-down-back"} size={24} color={COLORS.accent} />
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
        <Animated.View style={[styles.buttonAnimated, { transform: [{ scale: scaleValue }] }]}>
          <Pressable style={styles.button} onPress={handleCreateUser}>
            <Text style={styles.buttonText}>Criar Funcionário</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const createStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      paddingTop: hp("5%"),
      flex: 1,
      backgroundColor: COLORS.primary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: hp("2%"),
      paddingVertical: hp("1%"),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.neutral,
    },
    backButton: {
      marginRight: wp("2%"),
    },
    formContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: hp("2%"),
    },
    title: {
      color: COLORS.text,
      fontSize: wp("6%"),
      fontWeight: "bold",
      marginBottom: hp("3%"),
    },
    input: {
      color: COLORS.text,
      width: wp("80%"),
      height: hp("5.75%"),
      borderColor: COLORS.neutral,
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: hp("2.65%"),
      paddingHorizontal: wp("2.5%"),
      backgroundColor: COLORS.secondary,
    },
    button: {
      width: wp("80%"),
      backgroundColor: COLORS.accent,
      padding: hp("2%"),
      borderRadius: wp("6%"),
      alignItems: "center",
    },
    buttonText: {
      color: "#000",
      fontSize: wp("4.25%"),
      fontWeight: "bold",
    },
    buttonAnimated: {
      width: "100%",
      alignItems: "center",
    },
  });

export default CriarFuncionarioScreen;
