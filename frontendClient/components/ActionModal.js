// ActionModal.js

import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal } from "react-native";

export const ActionModal = ({ handleClose, handleConfirm }) => {
  return (
    <Modal
      visible={true} // Visibilidade controlada pelo estado no componente pai
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={handleClose}>
        <View style={styles.modalContainer}>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo escurecido
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
