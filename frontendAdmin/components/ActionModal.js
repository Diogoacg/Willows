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

const COLORS = {
  primary: "#15191d",
  secondary: "#212529",
  accent: "#FF6A3D",
  neutral: "#313b4b",
  text: "#c7c7c7",
};

const ActionModal = ({ handleClose, handleConfirm, handleBack, cartItems }) => {
  const dispatch = useDispatch();

  const handleIncrement = (id) => {
    dispatch(incrementQuantity({ id }));
  };

  const handleDecrement = (id) => {
    dispatch(decrementQuantity({ id }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.itemName}>{item.nome}</Text>
      <View style={styles.quantityContainer}>
        <Pressable onPress={() => handleDecrement(item.id)}>
          <Text style={styles.quantityButton}>-</Text>
        </Pressable>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <Pressable onPress={() => handleIncrement(item.id)}>
          <Text style={styles.quantityButton}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.itemPrice}>
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Pedido</Text>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.cartList}
          />
          <Text style={styles.total}>Total: {totalPrice.toFixed(2)}€</Text>
          <Pressable
            activeOpacity={0.9}
            style={styles.actionButton}
            onPress={handleConfirm}
          >
            <Text style={styles.actionText}>Confirmar Pedido</Text>
          </Pressable>
          <Pressable
            activeOpacity={0.9}
            style={styles.actionButton}
            onPress={handleBack}
          >
            <Text style={styles.actionText}>Voltar</Text>
          </Pressable>
          <Pressable
            activeOpacity={0.9}
            style={[styles.actionButton, styles.cancelButton]}
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
    backgroundColor: COLORS.primary + "80",
  },
  modalContainer: {
    backgroundColor: COLORS.secondary,
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
    color: COLORS.text,
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
    borderBottomColor: COLORS.neutral,
    width: "100%",
  },
  itemName: {
    color: COLORS.text,
    flex: 3,
    textAlign: "left",
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    color: COLORS.accent,
    fontSize: 20,
    width: 30,
    textAlign: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  itemQuantity: {
    color: COLORS.text,
    fontSize: 16,
    marginHorizontal: 10,
  },
  itemPrice: {
    color: COLORS.text,
    flex: 1,
    textAlign: "right",
    fontSize: 10,
  },
  total: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.neutral,
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
