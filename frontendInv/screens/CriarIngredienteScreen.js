import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { criarNovoIngrediente } from "../api/apiIngredientes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";

const CriarIngredienteScreen = () => {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [tolerancia, setTolerancia] = useState("15");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const handleCreate = async () => {
    if (!nome.trim() || !quantidade || !unidade.trim()) {
      setAlertTitle("Erro");
      setAlertMessage("Nome, quantidade e unidade são obrigatórios.");
      setAlertVisible(true);
      return;
    }

    const token = await AsyncStorage.getItem("token");
    try {
      await criarNovoIngrediente(token, {
        nome: nome.trim(),
        quantidade: parseFloat(quantidade),
        unidade: unidade.trim(),
        quantidadeMinima: parseFloat(quantidadeMinima) || 0,
        toleranciaVariancia: parseFloat(tolerancia) / 100 || 0.15,
      });
      setAlertTitle("Sucesso");
      setAlertMessage("Ingrediente criado com sucesso!");
      setAlertVisible(true);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Erro ao criar ingrediente: " + error.message);
      setAlertVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="return-down-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Novo Ingrediente</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: COLORS.text }]}>Nome *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="Ex: Gin, Leite, Café em grão"
          placeholderTextColor={COLORS.text + "88"}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={[styles.label, { color: COLORS.text }]}>Quantidade inicial *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="0"
          placeholderTextColor={COLORS.text + "88"}
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: COLORS.text }]}>Unidade *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="Ex: L, ml, kg, g, un"
          placeholderTextColor={COLORS.text + "88"}
          value={unidade}
          onChangeText={setUnidade}
        />

        <Text style={[styles.label, { color: COLORS.text }]}>Stock mínimo</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="0 (alerta quando ficar abaixo)"
          placeholderTextColor={COLORS.text + "88"}
          value={quantidadeMinima}
          onChangeText={setQuantidadeMinima}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: COLORS.text }]}>Tolerância de variância (%)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="15 (15% de diferença é considerado normal)"
          placeholderTextColor={COLORS.text + "88"}
          value={tolerancia}
          onChangeText={setTolerancia}
          keyboardType="numeric"
        />
        <Text style={[styles.hint, { color: COLORS.text }]}>
          Diferença aceitável entre consumo teórico e real (ofertas, derrame). Padrão: 15%.
        </Text>

        <Pressable style={[styles.createButton, { backgroundColor: COLORS.accent }]} onPress={handleCreate}>
          <Text style={[styles.createButtonText, { color: COLORS.primary }]}>Criar Ingrediente</Text>
        </Pressable>
      </ScrollView>

      <CustomAlertModal
        visible={alertVisible}
        onClose={() => {
          setAlertVisible(false);
          if (alertTitle === "Sucesso") navigation.goBack();
        }}
        title={alertTitle}
        message={alertMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingTop: hp("5%"),
    paddingBottom: hp("1.5%"),
    borderBottomWidth: 1,
  },
  backButton: { marginRight: wp("3%") },
  headerTitle: { fontSize: wp("4.5%"), fontWeight: "bold" },
  form: { padding: wp("5%"), paddingBottom: hp("5%") },
  label: { fontSize: wp("3.8%"), fontWeight: "600", marginBottom: hp("0.8%") },
  input: {
    height: hp("6%"),
    borderRadius: wp("2%"),
    borderWidth: 1,
    paddingHorizontal: wp("3%"),
    fontSize: wp("4%"),
    marginBottom: hp("2%"),
  },
  hint: { fontSize: wp("3.2%"), opacity: 0.6, marginTop: -hp("1.5%"), marginBottom: hp("2%"), fontStyle: "italic" },
  createButton: {
    padding: hp("2%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    marginTop: hp("2%"),
  },
  createButtonText: { fontSize: wp("4.5%"), fontWeight: "bold" },
});

export default CriarIngredienteScreen;
