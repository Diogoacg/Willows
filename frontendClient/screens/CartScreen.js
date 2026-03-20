import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Animated,
  TextInput,
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
  const scaleValue = useRef(new Animated.Value(1)).current;

  const [mesa, setMesa] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);

  const total = cartItems
    .reduce((acc, item) => acc + parseFloat(item.preco) * item.quantity, 0)
    .toFixed(2);

  const handleIncrement = (cartKey) => dispatch(incrementQuantity({ cartKey }));
  const handleDecrement = (cartKey) => dispatch(decrementQuantity({ cartKey }));

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleConfirm = async () => {
    animatePress();
    if (!cartItems || cartItems.length === 0) {
      setModalTitle("Carrinho vazio");
      setModalMessage("Adicione itens antes de confirmar o pedido.");
      setModalAction(null);
      setModalVisible(true);
      return;
    }

    const token = await AsyncStorage.getItem("token");
    const orderData = {
      items: cartItems.map((item) => ({ nome: item.nome, quantidade: item.quantity, observacoes: item.observacoes || undefined })),
      mesa: mesa ? parseInt(mesa) : null,
    };

    try {
      await criarNovoGrupoDePedidos(token, orderData);
      setModalTitle("Pedido enviado!");
      setModalMessage(
        `Pedido confirmado${mesa ? ` para a mesa ${mesa}` : ""}. Total: ${total}€`
      );
      setModalAction(() => () => {
        dispatch(clearCart());
        setMesa("");
        navigation.goBack();
      });
      setModalVisible(true);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao enviar o pedido: " + error.message);
      setModalAction(null);
      setModalVisible(true);
    }
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
          <Text style={[styles.cardTitle, { color: COLORS.text }]} numberOfLines={1}>
            {item.nome}
          </Text>
          <View style={styles.cardActions}>
            <Pressable onPress={() => handleDecrement(item.cartKey)} style={styles.actionBtn}>
              <Ionicons name="remove-circle-outline" size={28} color={COLORS.accent} />
            </Pressable>
            <Text style={[styles.itemQuantity, { color: COLORS.text }]}>{item.quantity}</Text>
            <Pressable onPress={() => handleIncrement(item.cartKey)} style={styles.actionBtn}>
              <Ionicons name="add-circle-outline" size={28} color={COLORS.accent} />
            </Pressable>
          </View>
        </View>
        {item.observacoes ? (
          <Text style={[styles.obsText, { color: COLORS.text }]}>{item.observacoes}</Text>
        ) : null}
        <Text style={[styles.cardDetail, { color: COLORS.text }]}>
          {(parseFloat(item.preco) * item.quantity).toFixed(2)}€
          <Text style={styles.unitPrice}> ({parseFloat(item.preco).toFixed(2)}€ cada)</Text>
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Carrinho</Text>
        {cartItems.length > 0 && (
          <Pressable onPress={() => dispatch(clearCart())} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={22} color={COLORS.accent} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.cartKey}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color={COLORS.neutral} />
            <Text style={[styles.emptyText, { color: COLORS.text }]}>Carrinho vazio</Text>
          </View>
        }
      />

      <View style={[styles.footer, { borderTopColor: COLORS.neutral }]}>
        <View style={[styles.mesaRow, { borderColor: COLORS.neutral, backgroundColor: COLORS.secondary }]}>
          <Ionicons name="restaurant-outline" size={20} color={COLORS.text} />
          <TextInput
            style={[styles.mesaInput, { color: COLORS.text }]}
            placeholder="Nº mesa (opcional)"
            placeholderTextColor={COLORS.neutral}
            keyboardType="numeric"
            value={mesa}
            onChangeText={setMesa}
            maxLength={3}
          />
        </View>

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: COLORS.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: COLORS.accent }]}>{total}€</Text>
        </View>

        <Animated.View style={{ transform: [{ scale: scaleValue }], width: "100%" }}>
          <Pressable
            style={[styles.confirmBtn, { backgroundColor: COLORS.accent }]}
            onPress={handleConfirm}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.primary} />
            <Text style={[styles.confirmBtnText, { color: COLORS.primary }]}>
              Confirmar Pedido
            </Text>
          </Pressable>
        </Animated.View>
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    paddingTop: hp("6%"),
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: wp("3%"),
  },
  clearBtn: {
    marginLeft: "auto",
  },
  headerTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    flex: 1,
  },
  itemContainer: {
    borderRadius: wp("2%"),
    borderWidth: 1,
    marginHorizontal: wp("4%"),
    marginTop: hp("1.5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    padding: wp("4%"),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("0.5%"),
  },
  cardTitle: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    flex: 1,
    marginRight: wp("2%"),
  },
  cardDetail: {
    fontSize: wp("3.5%"),
    marginTop: hp("0.5%"),
  },
  unitPrice: {
    fontSize: wp("3%"),
    opacity: 0.6,
  },
  obsText: {
    fontSize: wp("3.2%"),
    opacity: 0.65,
    fontStyle: "italic",
    marginTop: hp("0.3%"),
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    padding: wp("1%"),
  },
  itemQuantity: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    marginHorizontal: wp("2%"),
    minWidth: wp("6%"),
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: hp("15%"),
    gap: hp("2%"),
  },
  emptyText: {
    fontSize: wp("4.5%"),
    opacity: 0.5,
  },
  footer: {
    padding: wp("4%"),
    borderTopWidth: 1,
    gap: hp("1.5%"),
  },
  mesaRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
    gap: wp("2%"),
  },
  mesaInput: {
    flex: 1,
    fontSize: wp("4%"),
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: wp("4.5%"),
    fontWeight: "600",
  },
  totalValue: {
    fontSize: wp("6%"),
    fontWeight: "bold",
  },
  confirmBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("3%"),
    paddingVertical: hp("2%"),
    gap: wp("2%"),
  },
  confirmBtnText: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
  },
});

export default CartScreen;
