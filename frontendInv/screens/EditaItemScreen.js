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
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { atualizarItemNoInventario } from "../api/apiInventory";
import { obterIngredientesDoInventario } from "../api/apiIngredientes";
import { useNavigation, useRoute } from "@react-navigation/native";
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

const EditaItemScreen = () => {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("outros");
  const [disponivel, setDisponivel] = useState(true);
  // receita: [{ id, nome, unidade, quantidade (recipe amount) }]
  const [receita, setReceita] = useState([]);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loadingIngredientes, setLoadingIngredientes] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    loadIngredientes();
  }, []);

  useEffect(() => {
    if (item && ingredientesDisponiveis.length > 0) {
      setNome(item.nome || "");
      setPreco(item.preco ? item.preco.toString() : "");
      setDescricao(item.descricao || "");
      setCategoria(item.categoria || "outros");
      setDisponivel(item.disponivel !== false);

      // BUG FIX: use ItemIngredient.quantidade (recipe amount), NOT Ingredientes.quantidade (total stock)
      const receitaCarregada = (item.Ingredientes || []).map((ing) => ({
        id: ing.id,
        nome: ing.nome,
        unidade: ing.unidade,
        quantidade: ing.ItemIngredient ? ing.ItemIngredient.quantidade.toString() : "0",
      }));
      setReceita(receitaCarregada);
    }
  }, [item, ingredientesDisponiveis]);

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
    // Don't add if already in recipe
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

  const handleSave = async () => {
    if (!nome.trim() || !preco.trim()) {
      setAlertTitle("Erro");
      setAlertMessage("Nome e preço são obrigatórios.");
      setAlertVisible(true);
      return;
    }

    // Validate recipe quantities
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
        id: r.id,
        quantidade: parseFloat(r.quantidade),
      }));

      await atualizarItemNoInventario(
        token,
        item.id,
        nome.trim(),
        parseFloat(preco),
        descricao.trim(),
        categoria,
        disponivel,
        ingredientesPayload
      );
      setAlertTitle("Sucesso");
      setAlertMessage("Item atualizado com sucesso!");
      setAlertVisible(true);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Falha ao atualizar item: " + error.message);
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
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Editar Item</Text>
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

        <Pressable
          style={[styles.toggleRow, { borderColor: COLORS.neutral }]}
          onPress={() => setDisponivel(!disponivel)}
        >
          <Text style={[styles.label, { color: COLORS.text, marginBottom: 0 }]}>Disponível no menu</Text>
          <Ionicons
            name={disponivel ? "checkmark-circle" : "close-circle"}
            size={26}
            color={disponivel ? "#2ecc71" : "#e74c3c"}
          />
        </Pressable>

        <View style={[styles.receitaHeader, { marginTop: hp("2%") }]}>
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
            Nenhum ingrediente na receita. Toque em "+ Ingrediente" para adicionar.
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

        <Pressable style={[styles.saveButton, { backgroundColor: COLORS.accent, marginTop: hp("3%") }]} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: COLORS.primary }]}>Guardar</Text>
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
                Todos os ingredientes já estão na receita.
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
                      stock: {ing.quantidade} {ing.unidade}
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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: wp("2%"),
    padding: wp("3%"),
    marginBottom: hp("1%"),
  },
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
  saveButton: {
    padding: hp("2%"),
    borderRadius: wp("2%"),
    alignItems: "center",
  },
  saveButtonText: { fontSize: wp("4.5%"), fontWeight: "bold" },
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
  pickerEmpty: { textAlign: "center", padding: hp("3%"), opacity: 0.5 },
  pickerItem: { paddingVertical: hp("1.5%"), borderBottomWidth: 1 },
  pickerItemNome: { fontSize: wp("4%"), fontWeight: "600" },
  pickerItemUnidade: { fontSize: wp("3.2%"), opacity: 0.65, marginTop: hp("0.2%") },
});

export default EditaItemScreen;
