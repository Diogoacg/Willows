
import React, { useState, useRef, useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { criarNovoItem } from "../api/apiInventory";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";



const CriarItemScreen = () => {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [ingredientes, setIngredientes] = useState([{ nome: "", quantidade: "" }]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
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

  const handleCreateItem = async () => {
    animateScaleIn();
    const token = await AsyncStorage.getItem("token");
    try {
      await criarNovoItem(token, nome, preco, ingredientes);
      setModalTitle("Sucesso");
      setModalMessage("Item adicionado com sucesso!");
      setModalVisible(true);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao adicionar item: " + error.message);
      setModalVisible(true);
    } finally {
      animateScaleOut();
    }
  };

  const handleAddIngrediente = () => {
    setIngredientes([...ingredientes, { nome: "", quantidade: "" }]);
  };

  const handleIngredienteChange = (index, field, value) => {
    const newIngredientes = [...ingredientes];
    newIngredientes[index][field] = value;
    setIngredientes(newIngredientes);
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
            onChangeText={setNome}
            value={nome}
            placeholder="Nome do Item"
            placeholderTextColor={COLORS.text}
            inputMode="name-phone-pad"
          />
          <Ionicons
            name="add-outline"
            size={24}
            color={COLORS.text}
            style={styles.sideIcon}
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
            onChangeText={setPreco}
            value={preco}
            placeholder="Preço"
            placeholderTextColor={COLORS.text}
            inputMode="name-phone-pad"
          />
          <Ionicons
            name="pricetag-outline"
            size={24}
            color={COLORS.text}
            style={styles.sideIcon}
          />
        </View>

        {ingredientes.map((ingrediente, index) => (
          <View key={index} style={styles.ingredienteContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: COLORS.secondary,
                  color: COLORS.text,
                  borderColor: COLORS.neutral,
                },
              ]}
              onChangeText={(value) => handleIngredienteChange(index, "nome", value)}
              value={ingrediente.nome}
              placeholder="Nome do Ingrediente"
              placeholderTextColor={COLORS.text}
              inputMode="name-phone-pad"
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: COLORS.secondary,
                  color: COLORS.text,
                  borderColor: COLORS.neutral,
                },
              ]}
              onChangeText={(value) => handleIngredienteChange(index, "quantidade", value)}
              value={ingrediente.quantidade}
              placeholder="Quantidade"
              placeholderTextColor={COLORS.text}
              inputMode="numeric"
            />
          </View>
        ))}

        <Pressable style={styles.addButton} onPress={handleAddIngrediente}>
          <Text style={styles.addButtonText}>Adicionar Ingrediente</Text>
        </Pressable>

        <Animated.View
          style={[
            styles.buttonAnimated,
            { transform: [{ scale: scaleValue }] },
          ]}
        >
          <Pressable style={styles.button} onPress={handleCreateItem}>
            <Text style={styles.buttonText}>Adicionar Item</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
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
      paddingHorizontal: wp("5%"),
      paddingVertical: hp("1%"),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.neutral,
    },
    backButton: {
      marginRight: wp("2.5%"),
    },
    formContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: wp("5%"),
    },
    title: {
      color: COLORS.text,
      fontSize: wp("5.82%"),
      fontWeight: "bold",
      marginBottom: hp("2.5%"),
    },
    input: {
      color: COLORS.text,
      width: wp("80%"),
      height: hp("6.1%"),
      borderColor: COLORS.neutral,
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: hp("2.5%"),
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
      fontSize: wp("4.3%"),
      fontWeight: "bold",
    },
    buttonAnimated: {
      width: "100%",
      alignItems: "center",
    },
    inputContainer: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
    sideIcon: {
      position: "absolute",
      right: wp("5.5%"),
      top: hp("0.5%"),
      padding: wp("2.5%"),
    },
    ingredienteContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      marginBottom: hp("2.5%"),
    },
    addButton: {
      width: wp("80%"),
      backgroundColor: COLORS.secondary,
      padding: hp("1.5%"),
      borderRadius: wp("6%"),
      alignItems: "center",
      marginBottom: hp("2.5%"),
    },
    addButtonText: {
      color: COLORS.text,
      fontSize: wp("4.3%"),
      fontWeight: "bold",
    },
  });

export default CriarItemScreen;
