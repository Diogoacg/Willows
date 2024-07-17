import React from "react";
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { useDispatch } from "react-redux";
import { incrementQuantity, decrementQuantity } from "../slices/cartSlice";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const ActionModal = ({ handleClose, handleConfirm, handleBack, cartItems }) => {
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;
  const dispatch = useDispatch();

  const handleIncrement = (id) => {
    dispatch(incrementQuantity({ id }));
  };

  const handleDecrement = (id) => {
    dispatch(decrementQuantity({ id }));
  };

  const renderItem = ({ item }) => (
    <View style={[styles.cartItem, { borderBottomColor: COLORS.neutral }]}>
      <Text style={[styles.itemName, { color: COLORS.text }]}>{item.nome}</Text>
      <View style={[styles.quantityContainer, { borderColor: COLORS.neutral }]}>
        <Pressable onPress={() => handleDecrement(item.id)}>
          <Text
            style={[styles.quantityButton, { backgroundColor: COLORS.accent }]}
          >
            -
          </Text>
        </Pressable>
        <Text style={[styles.itemQuantity, { color: COLORS.text }]}>
          {item.quantity}
        </Text>
        <Pressable onPress={() => handleIncrement(item.id)}>
          <Text
            style={[styles.quantityButton, { backgroundColor: COLORS.accent }]}
          >
            +
          </Text>
        </Pressable>
      </View>
      <Text style={[styles.itemPrice, { color: COLORS.text }]}>
        {(item.preco * item.quantity).toFixed(2)}€
      </Text>
    </View>
  );

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.preco * item.quantity,
    0
  );

  return (
    <Modal visible={true} transparent={true} onRequestClose={handleClose}>
      <View
        style={[styles.modalOverlay, { backgroundColor: COLORS.primary + 80 }]}
      >
        <View
          style={[styles.modalContainer, { backgroundColor: COLORS.secondary }]}
        >
          <Text style={[styles.title, { color: COLORS.text }]}>Carrinho</Text>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.cartList}
          />
          <Text style={[styles.total, { color: COLORS.text }]}>
            Total: {totalPrice.toFixed(2)}€
          </Text>
          <Pressable
            activeOpacity={0.9}
            style={[styles.actionButton, { backgroundColor: COLORS.accent }]}
            onPress={handleConfirm}
          >
            <Text style={styles.actionText}>Confirmar Pedido</Text>
          </Pressable>
          <Pressable
            activeOpacity={0.9}
            style={[styles.actionButton, { backgroundColor: COLORS.accent }]}
            onPress={handleBack}
          >
            <Text style={styles.actionText}>Voltar</Text>
          </Pressable>
          <Pressable
            activeOpacity={0.9}
            style={[styles.actionButton, { backgroundColor: COLORS.neutral }]}
            onPress={handleClose}
          >
            <Text style={[styles.actionText, styles.cancelText]}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 16,
    padding: 20,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cartList: {
    maxHeight: 300,
    width: "100%",
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    width: "100%",
  },
  itemName: {
    flex: 3,
    textAlign: "left",
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    fontSize: 20,
    width: 30,
    textAlign: "center",
    borderRadius: 4,
    marginHorizontal: 5,
  },
  itemQuantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  itemPrice: {
    flex: 1,
    textAlign: "right",
    fontSize: 10,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelText: {
    color: "#fff",
  },
});

export default ActionModal;
