// screens/PesquisaScreen.js

import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Modal } from "react-native";
import ActionModal from "./../components/ActionModal";

const PesquisaScreen = () => {
  const handleSearch = () => {
    // Lógica para realizar a pesquisa
  };

  const [visibleModal, setVisibleModal] = useState(false);

  const handleCloseModal = () => {
    setVisibleModal(false);
  };

  const handleOpenModal = () => {
    setVisibleModal(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cartButton} onPress={handleOpenModal}>
          <Text style={styles.cartText}>Carrinho</Text>
      </TouchableOpacity>
      <Modal
          visible={visibleModal}
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <ActionModal
            handleClose={handleCloseModal}
            handleConfirm={() => {
              alert("Confirmou o pedido!");
              handleCloseModal();
            }}
          />
      </Modal>
      <TextInput
        style={styles.input}
        placeholder="Digite aqui para pesquisar"
        onChangeText={(text) => console.log(text)}
      />
      <Button title="Pesquisar" onPress={handleSearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  input: {
    height: 40,
    width: "80%",
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  cartButton: {
    position: "absolute",
    top: 37,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  cartText: {
    fontWeight: "bold",
    color: "#000",
  },
});

export default PesquisaScreen;
