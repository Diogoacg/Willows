import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import axios from "axios";
import { REACT_APP_API_URL } from "@env";

export default function FazerPedido() {
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState("1");

  const handleSubmit = async () => {
    try {
      await axios.post(`${REACT_APP_API_URL}/pedidos`, {
        item,
        quantidade: parseInt(quantidade),
      });
      Alert.alert("Pedido feito com sucesso!");
      setItem("");
      setQuantidade("1");
    } catch (error) {
      Alert.alert("Erro ao fazer pedido");
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        value={item}
        onChangeText={setItem}
        placeholder="Item"
        required
      />
      <TextInput
        style={styles.input}
        value={quantidade}
        onChangeText={setQuantidade}
        placeholder="Quantidade"
        inputMode="numeric"
        required
      />
      <Button title="Fazer Pedido" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: 200,
  },
});
