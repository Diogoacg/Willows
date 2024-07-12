import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";

const ActionModal = ({ handleClose, handleConfirm, cartItems }) => {
  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.itemDetail}>{item.quantity}</Text>
      <Text style={styles.itemName}>{" " + item.nome + " "}</Text>
      <Text style={styles.itemDetail}>
        {(item.preco * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.preco * item.quantity,
    0
  );

  return (
    <Modal visible={true} transparent={true} onRequestClose={handleClose}>
      <TouchableOpacity style={styles.modalOverlay} onPress={handleClose}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Pedido</Text>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.cartList}
          />
          <Text style={styles.total}>Total: ${totalPrice.toFixed(2)}</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionButton}
            onPress={handleConfirm}
          >
            <Text style={styles.actionText}>Confirmar Pedido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleClose}
          >
            <Text style={[styles.actionText, styles.cancelText]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
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
    maxHeight: 200,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
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
    backgroundColor: "#2196F3",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FF0000",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelText: {
    color: "#fff",
  },
});

export default ActionModal;
