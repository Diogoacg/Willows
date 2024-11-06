import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { atualizarIngredienteNoInventario } from "../api/apiIngredientes";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";

const screenHeight = Dimensions.get("window").height;

const EditaIngredienteScreen = () => {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const { ingrediente } = route.params;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (ingrediente) {
      setNome(ingrediente.nome);
      setQuantidade(ingrediente.quantidade.toString());
      setUnidade(ingrediente.unidade);
    }
  }, [ingrediente]);

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

  const handleSave = async () => {
    animateScaleIn();
    const token = await AsyncStorage.getItem("token");
    try {
      await atualizarIngredienteNoInventario(token, ingrediente.id, nome, quantidade, unidade);
      setModalTitle("Sucesso");
      setModalMessage("Ingrediente atualizado com sucesso!");
      setModalVisible(true);
      // Wait for the modal to be closed before navigating back
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error("Erro ao atualizar ingrediente:", error.message);
      setModalTitle("Erro");
      setModalMessage("Falha ao atualizar ingrediente: " + error.message);
      setModalVisible(true);
    } finally {
      animateScaleOut();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={"return-down-back"} size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>
          Editar Ingrediente
        </Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: COLORS.secondary, color: COLORS.text },
          ]}
          placeholder="Nome do ingrediente"
          placeholderTextColor={COLORS.text}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: COLORS.secondary, color: COLORS.text },
          ]}
          placeholder="Quantidade"
          placeholderTextColor={COLORS.text}
          value={quantidade}
          keyboardType="numeric"
          onChangeText={setQuantidade}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: COLORS.secondary, color: COLORS.text },
          ]}
          placeholder="Unidade (e.g., kg, g, l)"
          placeholderTextColor={COLORS.text}
          value={unidade}
          onChangeText={setUnidade}
        />
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Pressable
            style={[styles.saveButton, { backgroundColor: COLORS.accent }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { color: COLORS.text }]}>
              Salvar
            </Text>
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

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: hp("5%"),
      paddingHorizontal: wp("2.5%"),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: wp("2.5%"),
      paddingVertical: hp("1.5%"),
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: wp("4.5%"),
      fontWeight: "bold",
      marginLeft: wp("2%"),
    },
    backButton: {
      marginRight: wp("2%"),
    },
    form: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: wp("5%"),
    },
    input: {
      height: hp("6%"),
      borderRadius: 8,
      paddingHorizontal: wp("4.5%"),
      marginBottom: hp("2.2%"),
      fontSize: wp("4%"),
    },
    saveButton: {
      padding: hp("2%"),
      borderRadius: 8,
      alignItems: "center",
    },
    saveButtonText: {
      fontSize: wp("4%"),
      fontWeight: "bold",
    },
  });
  
  export default EditaIngredienteScreen;
  