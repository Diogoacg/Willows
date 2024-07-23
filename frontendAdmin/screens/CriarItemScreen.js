import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { criarNovoItem } from "../api/apiInventory";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CriarItemScreen = () => {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  const COLORS = isDarkMode ? colors.dark : colors.light;

  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  const handleCreateItem = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      await criarNovoItem(token, nome, preco);
      Alert.alert("Item adicionado com sucesso!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro ao adicionar item", error.message);
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
        <Text style={styles.title}>Adicionar Novo Item</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do Item"
          placeholderTextColor={COLORS.text}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Preço"
          placeholderTextColor={COLORS.text}
          value={preco}
          onChangeText={setPreco}
          keyboardType="numeric"
        />
        <Pressable style={styles.button} onPress={handleCreateItem}>
          <Text style={styles.buttonText}>Adicionar Item</Text>
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

export default CriarItemScreen;
