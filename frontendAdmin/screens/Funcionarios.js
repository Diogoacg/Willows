import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
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

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const FuncionariosScreen = () => {
  const [logins, setLogins] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchLogins();
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
      setLogins((prevLogins) =>
        prevLogins.filter((login) => login.id !== userId)
      );
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
    <TouchableOpacity
      style={styles.button}
      onPress={() => handleViewDetails(item.id)}
      >
      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: "white", marginTop: 0 }]}
          onPress={() => handleDeleteUser(item.id)}
        >
          <Ionicons
              name={"trash-outline"}
              size={22}
              color="grey"
            />
        </TouchableOpacity>
        <Text style={styles.cardTitle}>Funcionário: {item.username}</Text>
        <Text style={styles.cardDetail}>
          Estado: {item.status ? "Em serviço" : "Off"}
        </Text>
        <Text style={styles.cardDetail}>Última Atividade: {item.lastActive}</Text>

      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateUser}>
      <Ionicons
            name={"add-circle-outline"}
            size={24}
            color="grey"
          />
      </TouchableOpacity>
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
    paddingTop: screenHeight * 0.1 / 2,
    paddingHorizontal: 10,
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDetail: {
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
    top: -(screenHeight * 0.1)/30,
    backgroundColor: "#f3f3f2",
    padding: 15,
    borderRadius: 8,
    alignItems: "flex-end",
    marginBottom: 15,
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FuncionariosScreen;
