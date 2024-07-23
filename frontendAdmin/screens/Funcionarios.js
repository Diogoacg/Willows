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
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { obterTodosOsUtilizadores, deleteUser } from "../api/apiAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";

const FuncionariosScreen = () => {
  const [logins, setLogins] = useState([]);
  const [scaleValues, setScaleValues] = useState({});
  const [searchText, setSearchText] = useState("");
  const [filteredLogins, setFilteredLogins] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const navigation = useNavigation();

  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    fetchLogins();

    // Set up Socket.IO client
    const socket = io("https://willows-production.up.railway.app");
    // const socket = io("http://localhost:5000");

    // Listen for relevant events
    socket.on("userCreated", () => {
      fetchLogins();
    });

    socket.on("userDeleted", () => {
      fetchLogins();
    });

    socket.on("userRoleUpdated", () => {
      fetchLogins();
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    handleSearch(searchText); // Filtra os itens conforme o texto da pesquisa
  }, [searchText, logins]);

  const fetchLogins = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const loginsData = await obterTodosOsUtilizadores(token);
      setLogins(loginsData);
      setFilteredLogins(loginsData);
      const initialScaleValues = {};
      loginsData.forEach((login) => {
        initialScaleValues[login.id] = new Animated.Value(1);
      });
      setScaleValues(initialScaleValues);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao obter utilizadores: " + error.message);
      setModalVisible(true);
      console.error("Erro ao buscar logins:", error.message);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const normalizedText = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (text) {
      const filtered = logins.filter((login) =>
        (login.username + " " + login.email) // Concatenate username and email
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(normalizedText)
      );
      setFilteredLogins(filtered);
    } else {
      setFilteredLogins(logins); // Show all if search text is empty
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await deleteUser(token, userId);
      fetchLogins();
      setModalTitle("Sucesso");
      setModalMessage("Utilizador eliminado com sucesso!");
      setModalVisible(true);
    } catch (error) {
      console.error("Erro ao eliminar utilizador:", error.message);
      setModalTitle("Erro");
      setModalMessage("Erro ao eliminar utilizador: " + error.message);
      setModalVisible(true);
    }
  };

  const handleViewDetails = (userId) => {
    navigation.navigate("DetalhesFuncionario", { userId });
  };

  const handleEditUser = (user) => {
    navigation.navigate("EditaFuncionario", { user });
  };

  const handleCreateUser = () => {
    navigation.navigate("CriarFuncionario");
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

  const renderLogin = ({ item }) => (
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
          { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral },
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
                Funcionário: {item.username}
              </Text>
              <View style={styles.cardActions}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => handleEditUser(item)}
                >
                  <Ionicons
                    name={"pencil-outline"}
                    size={22}
                    color={COLORS.accent}
                  />
                </Pressable>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(item.id)}
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
              Email: {item.email}
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
        <Pressable style={styles.createButton} onPress={handleCreateUser}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.accent} />
        </Pressable>
      </View>

      <FlatList
        data={filteredLogins}
        renderItem={renderLogin}
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
    padding: wp("3.4%"),
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
  cardActions: {
    flexDirection: "row",
  },
});

export default FuncionariosScreen;
