import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  TextInput,
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

const InventarioScreen = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation();
  const [scaleValues, setScaleValues] = useState({});

  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    fetchItems();

    // Set up Socket.IO client
    const socket = io("https://willows-production.up.railway.app");
    //const socket = io("http://localhost:5000");

    // Listen for relevant events
    socket.on("itemUpdated", () => {
      fetchItems();
    });

    socket.on("itemDeleted", () => {
      fetchItems();
    });

    socket.on("itemCreated", () => {
      fetchItems();
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    handleSearch(searchText); // Filtra os itens conforme o texto da pesquisa
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
      console.error("Erro ao buscar itens:", error.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await deletarItemDoInventario(token, itemId);
      fetchItems();
      alert("Item eliminado com sucesso!");
    } catch (error) {
      console.error("Erro ao eliminar item:", error.message);
      alert("Falha ao eliminar item.");
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: wp("2%"),
  },
  searchInput: {
    flex: 1,
    height: hp("5%"),
    marginLeft: wp("1%"),
  },
  itemContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
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
    borderRadius: 25,
  },
  card: {
    width: "100%",
    borderRadius: 8,
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  cardDetail: {
    fontSize: 14,
    marginBottom: 5,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  createButton: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
  },
  backButton: {
    marginRight: wp("2%"),
  },
  containerAdd: {
    marginLeft: "auto",
    justifyContent: "flex-end",
  },
  buttonAnimated: {
    width: "100%",
  },
});

export default InventarioScreen;
