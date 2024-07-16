import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  obterInformacoesDoUtilizador,
  obterTodosOsUtilizadores,
  deleteUser,
} from "../api/apiAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const FuncionariosScreen = () => {
  const [logins, setLogins] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchLogins();

    // Set up Socket.IO client
    const socket = io("https://willows-production.up.railway.app");
    //const socket = io("http://localhost:5000");

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

  const fetchLogins = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const loginsData = await obterTodosOsUtilizadores(token);
      setLogins(loginsData);
    } catch (error) {
      console.error("Erro ao buscar logins:", error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await deleteUser(token, userId);
      fetchLogins();
      alert("Utilizador eliminado com sucesso!");
    } catch (error) {
      console.error("Erro ao eliminar utilizador:", error.message);
      alert("Falha ao eliminar utilizador.");
    }
  };

  const handleViewDetails = (userId) => {
    navigation.navigate("DetalhesFuncionario", { userId });
  };

  const handleCreateUser = () => {
    navigation.navigate("CriarFuncionario");
  };

  const renderLogin = ({ item }) => (
    <Pressable style={styles.button} onPress={() => handleViewDetails(item.id)}>
      <View style={styles.card}>
        <Pressable
          style={[
            styles.deleteButton,
            { backgroundColor: "white", marginTop: 0 },
          ]}
          onPress={() => handleDeleteUser(item.id)}
        >
          <Ionicons name={"trash-outline"} size={22} color="grey" />
        </Pressable>
        <Text style={styles.cardTitle}>Funcionário: {item.username}</Text>
        <Text style={styles.cardDetail}>
          Estado: {item.status ? "Em serviço" : "Off"}
        </Text>
        <Text style={styles.cardDetail}>
          Última Atividade: {item.lastActive}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={"arrow-back-outline"} size={24} color="grey" />
        </Pressable>
        <View style={styles.containerAdd}>
          <Pressable style={styles.createButton} onPress={handleCreateUser}>
            <Ionicons name={"add-circle-outline"} size={24} color="grey" />
          </Pressable>
        </View>
      </View>
      <FlatList
        data={logins}
        renderItem={renderLogin}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: (screenHeight * 0.1) / 2,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginTop: hp("-6%"), // Espaço extra no topo
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    width: screenWidth * 0.9,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardTitle: {
    top: -(screenHeight * 0.1) / 2,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDetail: {
    top: -(screenHeight * 0.1) / 2.5,
    fontSize: 16,
    marginBottom: 10,
  },
  itemContainer: {
    marginLeft: 10,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    alignItems: "flex-end",
    alignSelf: "flex-end",
  },
  button: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f3f3f2",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  createButton: {
    top: -(screenHeight * 0.1) / 30,
    backgroundColor: "#f3f3f2",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginLeft: wp("-4%"),
    justifyContent: "flex-start",
  },
  containerAdd: {
    top: hp("4%"),
    left: wp("79%"),
    justifyContent: "flex-end",
  },
});

export default FuncionariosScreen;
