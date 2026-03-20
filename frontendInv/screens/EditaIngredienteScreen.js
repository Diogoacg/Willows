import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
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

const EditaIngredienteScreen = () => {
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [tolerancia, setTolerancia] = useState("15");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const navigation = useNavigation();
  const route = useRoute();
  const { ingrediente } = route.params;
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (ingrediente) {
      setNome(ingrediente.nome || "");
      setUnidade(ingrediente.unidade || "");
      setQuantidadeMinima(ingrediente.quantidadeMinima != null ? ingrediente.quantidadeMinima.toString() : "0");
      setTolerancia(ingrediente.toleranciaVariancia != null
        ? Math.round(ingrediente.toleranciaVariancia * 100).toString()
        : "15");
    }
  }, [ingrediente]);

  const handleSave = async () => {
    if (!nome.trim() || !unidade.trim()) {
      setAlertTitle("Erro");
      setAlertMessage("Nome e unidade são obrigatórios.");
      setAlertVisible(true);
      return;
    }

    const token = await AsyncStorage.getItem("token");
    try {
      await atualizarIngredienteNoInventario(token, ingrediente.id, {
        nome: nome.trim(),
        quantidade: ingrediente.quantidade, // not editable here — use RegistarMovimento
        unidade: unidade.trim(),
        quantidadeMinima: parseFloat(quantidadeMinima) || 0,
        toleranciaVariancia: parseFloat(tolerancia) / 100 || 0.15,
      });
      setAlertTitle("Sucesso");
      setAlertMessage("Ingrediente atualizado com sucesso!");
      setAlertVisible(true);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Erro ao atualizar: " + error.message);
      setAlertVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="return-down-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Editar Ingrediente</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Current stock is read-only — changes go through Registar Movimento */}
        <View style={[styles.stockCard, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}>
          <Text style={[styles.stockLabel, { color: COLORS.text }]}>Stock atual</Text>
          <Text style={[styles.stockValue, { color: COLORS.accent }]}>
            {ingrediente?.quantidade} {ingrediente?.unidade}
          </Text>
          <Pressable
            style={[styles.movimentoBtn, { borderColor: COLORS.accent }]}
            onPress={() => navigation.navigate("RegistarMovimento", { ingrediente })}
          >
            <Text style={[styles.movimentoBtnText, { color: COLORS.accent }]}>Registar movimento de stock →</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: COLORS.text }]}>Nome *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="Nome do ingrediente"
          placeholderTextColor={COLORS.text + "88"}
          value={nome}
          onChangeText={setNome}
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
          placeholder="0"
          placeholderTextColor={COLORS.text + "88"}
          value={quantidadeMinima}
          onChangeText={setQuantidadeMinima}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: COLORS.text }]}>Tolerância de variância (%)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="15"
          placeholderTextColor={COLORS.text + "88"}
          value={tolerancia}
          onChangeText={setTolerancia}
          keyboardType="numeric"
        />
        <Text style={[styles.hint, { color: COLORS.text }]}>
          Diferença aceitável entre consumo teórico e real. Padrão: 15%.
        </Text>

        <Pressable style={[styles.saveButton, { backgroundColor: COLORS.accent }]} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: COLORS.primary }]}>Guardar</Text>
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
  stockCard: {
    borderWidth: 1,
    borderRadius: wp("2%"),
    padding: wp("4%"),
    marginBottom: hp("2.5%"),
    gap: hp("0.5%"),
  },
  stockLabel: { fontSize: wp("3.5%"), opacity: 0.7 },
  stockValue: { fontSize: wp("6%"), fontWeight: "bold" },
  movimentoBtn: {
    marginTop: hp("1%"),
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingVertical: hp("0.75%"),
    paddingHorizontal: wp("3%"),
    alignSelf: "flex-start",
  },
  movimentoBtnText: { fontSize: wp("3.5%"), fontWeight: "600" },
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
  saveButton: {
    padding: hp("2%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    marginTop: hp("2%"),
  },
  saveButtonText: { fontSize: wp("4.5%"), fontWeight: "bold" },
});

export default EditaIngredienteScreen;
