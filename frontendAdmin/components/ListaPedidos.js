// ListaPedidos.js
import React from "react";
import { FlatList, View, Text } from "react-native";

const ListaPedidos = ({ pedidos }) => {
  const keyExtractor = (item) => {
    return item.id ? item.id.toString() : Math.random().toString();
  };

  const renderItem = ({ item }) => (
    <View>
      <Text>{item.name}</Text>{" "}
      {/* Substitua 'name' pela propriedade relevante */}
    </View>
  );

  return (
    <FlatList
      data={pedidos}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};

export default ListaPedidos;
