import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  Animated,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  obterItensDoInventario,
  deletarItemDoInventario,
} from "../api/apiInventory";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal"; // Atualize o caminho conforme necessário

const InventarioScreen = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const navigation = useNavigation();
  const [scaleValues, setScaleValues] = useState({});

  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    fetchItems();

    // Set up Socket.IO client
    const socket = io("https://willows-production.up.railway.app");
    // const socket = io("http://localhost:5000");

    socket.on("itemUpdated", () => {
      fetchItems();
    });

    socket.on("itemDeleted", () => {
      fetchItems();
    });

    socket.on("itemCreated", () => {
      fetchItems();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, items]);

  const fetchItems = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const itemsData = await obterItensDoInventario(token);
      setItems(itemsData);
      setFilteredItems(itemsData);
      const initialScaleValues = {};
      itemsData.forEach((item) => {
        initialScaleValues[item.id] = new Animated.Value(1);
      });
      setScaleValues(initialScaleValues);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao obter itens do inventário: " + error.message);
      setModalVisible(true);
      console.error("Erro ao buscar itens:", error.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await deletarItemDoInventario(token, itemId);
      fetchItems();
      setModalTitle("Sucesso");
      setModalMessage("Item eliminado com sucesso!");
      setModalVisible(true);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao eliminar item: " + error.message);
      setModalVisible(true);
      console.error("Erro ao eliminar item:", error.message);
    }
  };

  const handleViewDetails = (itemId) => {
    navigation.navigate("DetalhesItem", { itemId });
  };

  const handleEditItem = (item) => {
    navigation.navigate("EditaItem", { item });
  };

  const handleCreateItem = () => {
    navigation.navigate("CriarItem");
  };

  const animateScaleIn = (scaleValue) => {
    Animated.timing(scaleValue, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateScaleOut = (scaleValue) => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const normalizedText = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (text) {
      const filtered = items.filter((item) =>
        item.nome
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(normalizedText)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  };

  const renderItem = ({ item }) => (
    <Animated.View
      style={[
        styles.buttonAnimated,
        {
          transform: [{ scale: scaleValues[item.id] || new Animated.Value(1) }],
        },
      ]}
    >
      <View
        style={[
          styles.itemContainer,
          {
            backgroundColor: COLORS.secondary,
            borderColor: COLORS.neutral,
            shadowColor: COLORS.neutral,
          },
        ]}
      >
        <Pressable
          style={styles.button}
          onPress={() => handleViewDetails(item.id)}
          onPressIn={() => animateScaleIn(scaleValues[item.id])}
          onPressOut={() => animateScaleOut(scaleValues[item.id])}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: COLORS.text }]}>
                Item: {item.nome}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => handleEditItem(item)}
                >
                  <Ionicons
                    name={"pencil-outline"}
                    size={22}
                    color={COLORS.accent}
                  />
                </Pressable>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Ionicons
                    name={"trash-outline"}
                    size={22}
                    color={COLORS.accent}
                  />
                </Pressable>
              </View>
            </View>
            <Text style={[styles.cardDetail, { color: COLORS.text }]}>
              Preço: {item.preco} €
            </Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <View
          style={[
            styles.searchContainer,
            {
              borderColor: COLORS.neutral,
              backgroundColor: COLORS.secondary,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={24}
            style={[styles.searchIcon, { color: COLORS.text }]}
          />
          <TextInput
            style={[styles.searchInput, { color: COLORS.text }]}
            placeholder="Digite aqui para pesquisar"
            placeholderTextColor={COLORS.text}
            onChangeText={handleSearch}
            value={searchText}
          />
        </View>
        <Pressable style={styles.createButton} onPress={handleCreateItem}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.accent} />
        </Pressable>
      </View>
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <CustomAlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp("1.6%"),
    paddingTop: hp("1.32%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderRadius: wp("2%"),
    borderWidth: wp("0.2%"),
    paddingHorizontal: wp("2%"),
  },
  searchInput: {
    flex: 1,
    height: hp("5%"),
    marginLeft: wp("1%"),
  },
  itemContainer: {
    borderRadius: wp("2%"),
    borderWidth: wp("0.2%"),
    padding: wp("2.5%"),
    marginTop: hp("1%"),
    marginBottom: hp("1%"),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 3,
    marginLeft: wp("4%"),
    marginRight: wp("4%"),
  },
  button: {
    width: "100%",
    borderRadius: wp("6%"),
  },
  card: {
    width: "100%",
    borderRadius: wp("2%"),
    padding: wp("3.8%"),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("1%"),
  },
  cardTitle: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    flex: 1,
  },
  cardDetail: {
    fontSize: wp("3.5%"),
    marginBottom: hp("0.5%"),
  },
  deleteButton: {
    padding: wp("2%"),
    borderRadius: wp("2%"),
    marginLeft: wp("2%"),
  },
  editButton: {
    padding: wp("2%"),
    borderRadius: wp("2%"),
  },
  createButton: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
  },
  buttonAnimated: {
    width: "100%",
  },
});

export default InventarioScreen;
