// screens/PesquisaScreen.js

import React from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const PesquisaScreen = () => {
  const handleSearch = () => {
    // Lógica para realizar a pesquisa
  };

  return (
    <View style={styles.container}>
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
});

export default PesquisaScreen;
