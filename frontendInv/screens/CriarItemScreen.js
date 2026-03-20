import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { criarNovoItem } from "../api/apiInventory";
import { obterIngredientesDoInventario } from "../api/apiIngredientes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";

const CATEGORIAS = [
  { key: "bebidas_quentes", label: "Bebidas Quentes" },
  { key: "bebidas_frias", label: "Bebidas Frias" },
  { key: "petiscos", label: "Petiscos" },
  { key: "bolos", label: "Bolos" },
  { key: "outros", label: "Outros" },
];

const CriarItemScreen = () => {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("outros");
  // receita: [{ id, nome, unidade, quantidade }]
  const [receita, setReceita] = useState([]);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loadingIngredientes, setLoadingIngredientes] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    loadIngredientes();
  }, []);

  const loadIngredientes = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const data = await obterIngredientesDoInventario(token);
      setIngredientesDisponiveis(data);
    } catch (e) {
      // non-blocking
    } finally {
      setLoadingIngredientes(false);
    }
  };

  const handleAddIngrediente = (ing) => {
    if (receita.find((r) => r.id === ing.id)) {
      setPickerVisible(false);
      return;
    }
    setReceita([...receita, { id: ing.id, nome: ing.nome, unidade: ing.unidade, quantidade: "" }]);
    setPickerVisible(false);
  };

  const handleQtdChange = (id, value) => {
    setReceita(receita.map((r) => (r.id === id ? { ...r, quantidade: value } : r)));
  };

  const handleRemoveIngrediente = (id) => {
    setReceita(receita.filter((r) => r.id !== id));
  };

  const handleCreate = async () => {
    if (!nome.trim() || !preco.trim()) {
      setAlertTitle("Erro");
      setAlertMessage("Nome e preço são obrigatórios.");
      setAlertVisible(true);
      return;
    }

    for (const r of receita) {
      if (!r.quantidade || isNaN(parseFloat(r.quantidade)) || parseFloat(r.quantidade) <= 0) {
        setAlertTitle("Erro");
        setAlertMessage(`Quantidade inválida para "${r.nome}". Deve ser um número positivo.`);
        setAlertVisible(true);
        return;
      }
    }

    const token = await AsyncStorage.getItem("token");
    try {
      const ingredientesPayload = receita.map((r) => ({
        nome: r.nome,
        quantidade: parseFloat(r.quantidade),
      }));

      await criarNovoItem(token, nome.trim(), parseFloat(preco), descricao.trim(), categoria, ingredientesPayload);
      setAlertTitle("Sucesso");
      setAlertMessage("Item criado com sucesso!");
      setAlertVisible(true);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Erro ao criar item: " + error.message);
      setAlertVisible(true);
    }
  };

  const ingNaoNaReceita = ingredientesDisponiveis.filter(
    (i) => !receita.find((r) => r.id === i.id)
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="return-down-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Novo Item</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: COLORS.text }]}>Nome *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="Nome do item"
          placeholderTextColor={COLORS.text + "88"}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={[styles.label, { color: COLORS.text }]}>Preço (€) *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="0.00"
          placeholderTextColor={COLORS.text + "88"}
          value={preco}
          keyboardType="numeric"
          onChangeText={setPreco}
        />

        <Text style={[styles.label, { color: COLORS.text }]}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline, { backgroundColor: COLORS.secondary, color: COLORS.text, borderColor: COLORS.neutral }]}
          placeholder="Descrição opcional"
          placeholderTextColor={COLORS.text + "88"}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={2}
        />

        <Text style={[styles.label, { color: COLORS.text }]}>Categoria</Text>
        <View style={styles.categoriaRow}>
          {CATEGORIAS.map((cat) => (
            <Pressable
              key={cat.key}
              style={[
                styles.catChip,
                {
                  backgroundColor: categoria === cat.key ? COLORS.accent : COLORS.secondary,
                  borderColor: COLORS.neutral,
                },
              ]}
              onPress={() => setCategoria(cat.key)}
            >
              <Text style={[styles.catChipText, { color: categoria === cat.key ? COLORS.primary : COLORS.text }]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.receitaHeader, { marginTop: hp("1%") }]}>
          <Text style={[styles.label, { color: COLORS.text, marginBottom: 0 }]}>Receita</Text>
          <Pressable
            style={[styles.addIngBtn, { backgroundColor: COLORS.accent }]}
            onPress={() => setPickerVisible(true)}
            disabled={loadingIngredientes || ingNaoNaReceita.length === 0}
          >
            <Ionicons name="add" size={18} color={COLORS.primary} />
            <Text style={[styles.addIngBtnText, { color: COLORS.primary }]}>Ingrediente</Text>
          </Pressable>
        </View>

        {receita.length === 0 && (
          <Text style={[styles.emptyReceita, { color: COLORS.text }]}>
            Sem receita — o stock não será descontado automaticamente ao marcar como pronto.
          </Text>
        )}

        {receita.map((r) => (
          <View key={r.id} style={[styles.receitaRow, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}>
            <View style={styles.receitaInfo}>
              <Text style={[styles.receitaNome, { color: COLORS.text }]}>{r.nome}</Text>
              <Text style={[styles.receitaUnidade, { color: COLORS.text }]}>{r.unidade}</Text>
            </View>
            <TextInput
              style={[styles.receitaQty, { color: COLORS.text, borderColor: COLORS.neutral }]}
              placeholder="Qtd"
              placeholderTextColor={COLORS.text + "88"}
              value={r.quantidade}
              onChangeText={(v) => handleQtdChange(r.id, v)}
              keyboardType="numeric"
            />
            <Pressable onPress={() => handleRemoveIngrediente(r.id)} style={styles.removeBtn}>
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            </Pressable>
          </View>
        ))}

        <Pressable style={[styles.createButton, { backgroundColor: COLORS.accent, marginTop: hp("3%") }]} onPress={handleCreate}>
          <Text style={[styles.createButtonText, { color: COLORS.primary }]}>Criar Item</Text>
        </Pressable>
      </ScrollView>

      {/* Ingredient Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerModal, { backgroundColor: COLORS.secondary }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: COLORS.text }]}>Selecionar Ingrediente</Text>
              <Pressable onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </Pressable>
            </View>
            {loadingIngredientes ? (
              <ActivityIndicator color={COLORS.accent} style={{ padding: hp("3%") }} />
            ) : ingNaoNaReceita.length === 0 ? (
              <Text style={[styles.pickerEmpty, { color: COLORS.text }]}>
                Todos os ingredientes já estão na receita ou não existem ingredientes criados.
              </Text>
            ) : (
              <FlatList
                data={ingNaoNaReceita}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item: ing }) => (
                  <Pressable
                    style={[styles.pickerItem, { borderBottomColor: COLORS.neutral }]}
                    onPress={() => handleAddIngrediente(ing)}
                  >
                    <Text style={[styles.pickerItemNome, { color: COLORS.text }]}>{ing.nome}</Text>
                    <Text style={[styles.pickerItemUnidade, { color: COLORS.text }]}>
                      {ing.quantidade} {ing.unidade} em stock
                    </Text>
                  </Pressable>
                )}
              />
            )}
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
  inputMultiline: { height: hp("10%"), paddingTop: hp("1%"), textAlignVertical: "top" },
  categoriaRow: { flexDirection: "row", flexWrap: "wrap", gap: wp("2%"), marginBottom: hp("2%") },
  catChip: {
    borderWidth: 1,
    borderRadius: wp("4%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.5%"),
  },
  catChipText: { fontSize: wp("3%"), fontWeight: "600" },
  receitaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  addIngBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: wp("2%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.75%"),
    gap: wp("1%"),
  },
  addIngBtnText: { fontSize: wp("3.5%"), fontWeight: "600" },
  emptyReceita: { fontSize: wp("3.5%"), opacity: 0.5, marginBottom: hp("1%"), fontStyle: "italic" },
  receitaRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: wp("2%"),
    padding: wp("3%"),
    marginBottom: hp("1%"),
    gap: wp("2%"),
  },
  receitaInfo: { flex: 1 },
  receitaNome: { fontSize: wp("3.8%"), fontWeight: "600" },
  receitaUnidade: { fontSize: wp("3.2%"), opacity: 0.65 },
  receitaQty: {
    borderBottomWidth: 1,
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("0.5%"),
    fontSize: wp("4%"),
    minWidth: wp("15%"),
    textAlign: "center",
  },
  removeBtn: { padding: wp("1%") },
  createButton: {
    padding: hp("2%"),
    borderRadius: wp("2%"),
    alignItems: "center",
  },
  createButtonText: { fontSize: wp("4.5%"), fontWeight: "bold" },
  pickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
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
  pickerEmpty: { textAlign: "center", padding: hp("3%"), opacity: 0.5, fontStyle: "italic" },
  pickerItem: { paddingVertical: hp("1.5%"), borderBottomWidth: 1 },
  pickerItemNome: { fontSize: wp("4%"), fontWeight: "600" },
  pickerItemUnidade: { fontSize: wp("3.2%"), opacity: 0.65, marginTop: hp("0.2%") },
});

export default CriarItemScreen;
