import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import { obterIngredientesDoInventario } from "../api/apiIngredientes";
import { registarMovimento } from "../api/apiMovimentosStock";
import CustomAlertModal from "../components/CustomAlertModal";

const TIPOS = [
  {
    key: "compra",
    label: "Compra / Reposição",
    icon: "arrow-down-circle-outline",
    color: "#2ecc71",
    desc: "Adiciona stock (nova entrega, compra)",
  },
  {
    key: "oferta",
    label: "Oferta / Rodada",
    icon: "gift-outline",
    color: "#3498db",
    desc: "Consumo intencional não faturado (rodada grátis, degustação)",
  },
  {
    key: "quebra",
    label: "Quebra / Derrame",
    icon: "warning-outline",
    color: "#f39c12",
    desc: "Desperdício, derrame ou produto estragado",
  },
  {
    key: "ajuste",
    label: "Ajuste de Inventário",
    icon: "scale-outline",
    color: "#9b59b6",
    desc: "Correção após contagem física — indica o novo valor real",
  },
];

const RegistarMovimentoScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { ingrediente: ingredienteParam } = route.params || {};

  const [ingredientes, setIngredientes] = useState([]);
  const [selectedIng, setSelectedIng] = useState(ingredienteParam || null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loadingIng, setLoadingIng] = useState(!ingredienteParam);
  const [tipo, setTipo] = useState("compra");
  const [quantidade, setQuantidade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (!ingredienteParam) loadIngredientes();
    else {
      setSelectedIng(ingredienteParam);
    }
  }, []);

  const loadIngredientes = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const data = await obterIngredientesDoInventario(token);
      setIngredientes(data);
    } catch (e) {
      // non-blocking
    } finally {
      setLoadingIng(false);
    }
  };

  const tipoSelecionado = TIPOS.find((t) => t.key === tipo);

  const handleSubmit = async () => {
    if (!selectedIng) {
      setAlertTitle("Erro");
      setAlertMessage("Selecione um ingrediente.");
      setAlertVisible(true);
      return;
    }
    if (!quantidade || isNaN(parseFloat(quantidade)) || parseFloat(quantidade) <= 0) {
      setAlertTitle("Erro");
      setAlertMessage("Quantidade deve ser um número positivo.");
      setAlertVisible(true);
      return;
    }

    const token = await AsyncStorage.getItem("token");
    setSubmitting(true);
    try {
      await registarMovimento(token, {
        ingredienteId: selectedIng.id,
        quantidade: parseFloat(quantidade),
        tipo,
        observacoes: observacoes.trim() || null,
      });

      const label =
        tipo === "ajuste"
          ? `Stock de "${selectedIng.nome}" ajustado para ${quantidade} ${selectedIng.unidade}.`
          : `Movimento registado com sucesso.`;

      setAlertTitle("Sucesso");
      setAlertMessage(label);
      setAlertVisible(true);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage(error.message);
      setAlertVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const getQuantidadeLabel = () => {
    if (tipo === "ajuste") return `Nova quantidade real (${selectedIng?.unidade || "unid."})`;
    if (tipo === "compra") return `Quantidade recebida (${selectedIng?.unidade || "unid."})`;
    return `Quantidade consumida (${selectedIng?.unidade || "unid."})`;
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="return-down-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Registar Movimento de Stock</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Ingredient selector */}
        <Text style={[styles.label, { color: COLORS.text }]}>Ingrediente</Text>
        {selectedIng ? (
          <View style={[styles.ingCard, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}>
            <View>
              <Text style={[styles.ingCardNome, { color: COLORS.text }]}>{selectedIng.nome}</Text>
              <Text style={[styles.ingCardQty, { color: COLORS.accent }]}>
                Stock atual: {selectedIng.quantidade} {selectedIng.unidade}
              </Text>
            </View>
            {!ingredienteParam && (
              <Pressable onPress={() => setPickerVisible(true)}>
                <Text style={[styles.changeText, { color: COLORS.accent }]}>Mudar</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Pressable
            style={[styles.ingPickerBtn, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}
            onPress={() => setPickerVisible(true)}
          >
            {loadingIng ? (
              <ActivityIndicator color={COLORS.accent} size="small" />
            ) : (
              <>
                <Ionicons name="search-outline" size={20} color={COLORS.text} />
                <Text style={[styles.ingPickerBtnText, { color: COLORS.text }]}>Selecionar ingrediente...</Text>
              </>
            )}
          </Pressable>
        )}

        {/* Tipo selector */}
        <Text style={[styles.label, { color: COLORS.text, marginTop: hp("2%") }]}>Tipo de movimento</Text>
        {TIPOS.map((t) => (
          <Pressable
            key={t.key}
            style={[
              styles.tipoBtn,
              {
                backgroundColor: tipo === t.key ? t.color + "22" : COLORS.secondary,
                borderColor: tipo === t.key ? t.color : COLORS.neutral,
              },
            ]}
            onPress={() => setTipo(t.key)}
          >
            <Ionicons name={t.icon} size={22} color={t.color} />
            <View style={styles.tipoBtnInfo}>
              <Text style={[styles.tipoBtnLabel, { color: COLORS.text }]}>{t.label}</Text>
              <Text style={[styles.tipoBtnDesc, { color: COLORS.text }]}>{t.desc}</Text>
            </View>
            {tipo === t.key && <Ionicons name="checkmark-circle" size={20} color={t.color} />}
          </Pressable>
        ))}

        {/* Quantity */}
        <Text style={[styles.label, { color: COLORS.text, marginTop: hp("2%") }]}>{getQuantidadeLabel()}</Text>
        {tipo === "ajuste" && selectedIng && (
          <Text style={[styles.hint, { color: COLORS.text }]}>
            Contagem física: introduza a quantidade real que existe agora em stock (não a diferença).
          </Text>
        )}
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: tipoSelecionado?.color || COLORS.neutral }]}
          placeholder="0"
          placeholderTextColor={COLORS.text + "88"}
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
        />

        {/* Observations */}
        <Text style={[styles.label, { color: COLORS.text }]}>Observações (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="Ex: Rodada para mesa 5, derrame no balcão..."
          placeholderTextColor={COLORS.text + "88"}
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[styles.submitBtn, { backgroundColor: tipoSelecionado?.color || COLORS.accent, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.submitBtnText, { color: "#fff" }]}>Registar</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Ingredient picker modal */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: COLORS.secondary }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: COLORS.text }]}>Selecionar Ingrediente</Text>
              <Pressable onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </Pressable>
            </View>
            <FlatList
              data={ingredientes}
              keyExtractor={(i) => i.id.toString()}
              renderItem={({ item: ing }) => (
                <Pressable
                  style={[styles.pickerItem, { borderBottomColor: COLORS.neutral }]}
                  onPress={() => { setSelectedIng(ing); setPickerVisible(false); }}
                >
                  <Text style={[styles.pickerItemNome, { color: COLORS.text }]}>{ing.nome}</Text>
                  <Text style={[styles.pickerItemQty, { color: COLORS.accent }]}>
                    {ing.quantidade} {ing.unidade}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

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
  headerTitle: { fontSize: wp("4%"), fontWeight: "bold", flex: 1 },
  form: { padding: wp("5%"), paddingBottom: hp("5%") },
  label: { fontSize: wp("3.8%"), fontWeight: "600", marginBottom: hp("0.8%") },
  ingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: wp("2%"),
    padding: wp("3.5%"),
    marginBottom: hp("1%"),
  },
  ingCardNome: { fontSize: wp("4%"), fontWeight: "600" },
  ingCardQty: { fontSize: wp("3.5%"), marginTop: hp("0.3%") },
  changeText: { fontSize: wp("3.5%"), fontWeight: "600" },
  ingPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
    borderWidth: 1,
    borderRadius: wp("2%"),
    padding: wp("3.5%"),
    marginBottom: hp("1%"),
  },
  ingPickerBtnText: { fontSize: wp("4%"), opacity: 0.7 },
  tipoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("3%"),
    borderWidth: 1,
    borderRadius: wp("2%"),
    padding: wp("3%"),
    marginBottom: hp("1%"),
  },
  tipoBtnInfo: { flex: 1 },
  tipoBtnLabel: { fontSize: wp("3.8%"), fontWeight: "600" },
  tipoBtnDesc: { fontSize: wp("3%"), opacity: 0.65, marginTop: hp("0.2%") },
  input: {
    height: hp("6%"),
    borderRadius: wp("2%"),
    borderWidth: 1,
    paddingHorizontal: wp("3%"),
    fontSize: wp("4%"),
    marginBottom: hp("2%"),
  },
  inputMultiline: { height: hp("12%"), paddingTop: hp("1%"), textAlignVertical: "top" },
  hint: { fontSize: wp("3.2%"), opacity: 0.65, marginBottom: hp("1%"), fontStyle: "italic" },
  submitBtn: {
    padding: hp("2%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    marginTop: hp("1%"),
  },
  submitBtnText: { fontSize: wp("4.5%"), fontWeight: "bold" },
  pickerOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  pickerModal: {
    borderTopLeftRadius: wp("4%"),
    borderTopRightRadius: wp("4%"),
    maxHeight: "60%",
    padding: wp("4%"),
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1.5%"),
  },
  pickerTitle: { fontSize: wp("4.5%"), fontWeight: "bold" },
  pickerItem: { paddingVertical: hp("1.5%"), borderBottomWidth: 1 },
  pickerItemNome: { fontSize: wp("4%"), fontWeight: "600" },
  pickerItemQty: { fontSize: wp("3.2%"), marginTop: hp("0.2%") },
});

export default RegistarMovimentoScreen;
