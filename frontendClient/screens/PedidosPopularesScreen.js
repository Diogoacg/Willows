import React, { useState } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Modal,
  Text,
} from "react-native";
import ActionModal from "./../components/ActionModal";

const data = [
  { id: "1", image: require("./../assets/favicon.png") },
  { id: "2", image: require("./../assets/favicon.png") },
  { id: "3", image: require("./../assets/favicon.png") },
  { id: "4", image: require("./../assets/favicon.png") },
  { id: "5", image: require("./../assets/favicon.png") },
  { id: "6", image: require("./../assets/favicon.png") },
  { id: "7", image: require("./../assets/favicon.png") },
  { id: "8", image: require("./../assets/favicon.png") },
  { id: "9", image: require("./../assets/favicon.png") },
  { id: "10", image: require("./../assets/favicon.png") },
  { id: "11", image: require("./../assets/favicon.png") },
  { id: "12", image: require("./../assets/favicon.png") },
  { id: "13", image: require("./../assets/favicon.png") },
  { id: "14", image: require("./../assets/favicon.png") },
  { id: "15", image: require("./../assets/favicon.png") },
  // Adicionar mais imagens conforme necessário
];

const numColumns = 3;
const screenWidth = Dimensions.get("window").width;

const PedidosPopularesScreen = () => {
  const [visibleModal, setVisibleModal] = useState(false);

  const handleImagePress = (id) => {
    console.log(`Imagem ${id} pressionada`);
    // Lógica para o que acontece quando a imagem é pressionada
  };

  const handleOpenModal = () => {
    setVisibleModal(true);
  };

  const handleCloseModal = () => {
    setVisibleModal(false);
  };

  const itemWidth = screenWidth / numColumns - 20; // 20 é o espaçamento total (10 de cada lado)

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { width: itemWidth, height: itemWidth }]}
      onPress={() => handleImagePress(item.id)}
    >
      <Image source={item.image} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerSpace} />
        <TouchableOpacity style={styles.cartButton} onPress={handleOpenModal}>
          <Text style={styles.cartText}>Carrinho</Text>
        </TouchableOpacity>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.listContainer}
        />
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
  },
  headerSpace: {
    height: 60, // Ajuste este valor conforme necessário para o seu header
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cartButton: {
    position: "absolute",
    top: 20,
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

export default PedidosPopularesScreen;
