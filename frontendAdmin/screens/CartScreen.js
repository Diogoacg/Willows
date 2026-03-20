import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  incrementQuantity,
  decrementQuantity,
  clearCart,
} from "../slices/cartSlice";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import { criarNovoGrupoDePedidos } from "../api/apiOrderGroup";
import CustomAlertModal from "../components/CustomAlertModal";

const CartScreen = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [mesa, setMesa] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleIncrement = (cartKey) => {
    dispatch(incrementQuantity({ cartKey }));
  };

  const handleDecrement = (cartKey) => {
    dispatch(decrementQuantity({ cartKey }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleConfirm = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      setModalTitle("Erro");
      setModalMessage("O carrinho está vazio. Adicione itens antes de confirmar a compra.");
      setModalAction(null);
      setModalVisible(true);
      return;
    }

    if (!mesa.trim()) {
      setModalTitle("Erro");
      setModalMessage("Indique o número da mesa antes de confirmar.");
      setModalAction(null);
      setModalVisible(true);
      return;
    }

    const orderData = cartItems.map((item) => ({
      nome: item.nome,
      quantidade: item.quantity,
      observacoes: item.observacoes || undefined,
    }));

    setSubmitting(true);
    try {
      await criarNovoGrupoDePedidos(token, { items: orderData, mesa: mesa.trim() });
      setModalTitle("Sucesso");
      setModalMessage("Compra confirmada com sucesso!");
      setModalAction(() => () => {
        handleClearCart();
        setMesa("");
        navigation.goBack();
      });
      setModalVisible(true);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao confirmar a compra: " + error.message);
      setModalAction(null);
      setModalVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setModalTitle("Cancelado");
    setModalMessage("Compra cancelada!");
    setModalAction(() => () => {
      handleClearCart();
      navigation.goBack();
    });
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.itemContainer,
        { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: COLORS.text }]}>{item.nome}</Text>
            {item.observacoes ? (
              <Text style={[styles.cardObs, { color: COLORS.text }]}>{item.observacoes}</Text>
            ) : null}
          </View>
          <View style={styles.cardActions}>
            <Pressable style={styles.incrementButton} onPress={() => handleIncrement(item.cartKey)}>
              <Ionicons name="add-circle-outline" size={30} color={COLORS.accent} />
            </Pressable>
            <Text style={[styles.itemQuantity, { color: COLORS.text }]}>{item.quantity}</Text>
            <Pressable style={styles.decrementButton} onPress={() => handleDecrement(item.cartKey)}>
              <Ionicons name="remove-circle-outline" size={30} color={COLORS.accent} />
            </Pressable>
          </View>
        </View>
        <Text style={[styles.cardDetail, { color: COLORS.text }]}>Preço: {item.preco}€</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="return-down-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Carrinho</Text>
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.cartKey}
      />

      <View style={[styles.footer, { borderTopColor: COLORS.neutral }]}>
        <Text style={[styles.footerButtonText, { color: COLORS.text }]}>
          Total: {cartItems.reduce((acc, item) => acc + item.preco * item.quantity, 0).toFixed(2)}€
        </Text>
      </View>

      <View style={[styles.mesaContainer, { borderColor: COLORS.neutral, backgroundColor: COLORS.secondary }]}>
        <TextInput
          style={[styles.mesaInput, { color: COLORS.text }]}
          placeholder="Nº da mesa"
          placeholderTextColor={COLORS.text}
          value={mesa}
          onChangeText={setMesa}
          keyboardType="numeric"
        />
      </View>

      <View style={[styles.footer, { borderTopColor: COLORS.neutral }]}>
        <Pressable
          style={[styles.footerButton, { backgroundColor: COLORS.accent, borderColor: COLORS.neutral, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleConfirm}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[styles.footerButtonText, { color: COLORS.primary }]}>Confirmar</Text>
          )}
        </Pressable>
        <Pressable
          style={[styles.footerButton, { backgroundColor: COLORS.neutral, borderColor: COLORS.accent }]}
          onPress={handleCancel}
        >
          <Text style={[styles.footerButtonText, { color: COLORS.text }]}>Cancelar</Text>
        </Pressable>
      </View>

      <CustomAlertModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          if (modalAction) modalAction();
        }}
        title={modalTitle}
        message={modalMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: wp("1%"), paddingTop: hp("10%") },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    marginTop: hp("-6%"),
  },
  backButton: { marginRight: wp("2%") },
  headerTitle: { fontSize: wp("5%"), fontWeight: "bold", marginLeft: wp("2%") },
  itemContainer: {
    borderRadius: wp("2%"),
    borderWidth: 1,
    padding: wp("2.5%"),
    marginTop: wp("2.5%"),
    marginBottom: wp("2.5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: hp("0.25%") },
    shadowOpacity: 0.23,
    shadowRadius: wp("1%"),
    elevation: 3,
    marginLeft: wp("4%"),
    marginRight: wp("4%"),
  },
  card: { width: "100%", borderRadius: wp("2%"), padding: wp("3.75%") },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: wp("2.5%"),
  },
  cardTitle: { fontSize: wp("3.85%"), fontWeight: "bold" },
  cardObs: { fontSize: wp("3.2%"), fontStyle: "italic", opacity: 0.7, marginTop: hp("0.3%") },
  cardDetail: { fontSize: wp("3.38%"), marginBottom: wp("1.25%") },
  incrementButton: { padding: wp("2%"), borderRadius: wp("2%"), marginLeft: wp("2.5%") },
  decrementButton: { padding: wp("2%"), borderRadius: wp("2%") },
  itemQuantity: {
    alignSelf: "center",
    fontSize: wp("4%"),
    fontWeight: "bold",
    marginHorizontal: wp("2.5%"),
  },
  cardActions: { flexDirection: "row" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: wp("4%"),
    borderTopWidth: 1,
  },
  footerButton: {
    borderRadius: wp("2%"),
    borderWidth: 1,
    padding: wp("2.5%"),
  },
  footerButtonText: { fontWeight: "bold", fontSize: wp("4%") },
  mesaContainer: {
    marginHorizontal: wp("4%"),
    marginBottom: hp("1%"),
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingHorizontal: wp("3%"),
  },
  mesaInput: { height: hp("5.5%"), fontSize: wp("4%") },
});

export default CartScreen;
