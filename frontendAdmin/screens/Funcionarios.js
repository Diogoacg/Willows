import { StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { obterLogins } from "../api/apiAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View, TouchableOpacity } from "react-native";

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
      const loginsData = await obterLogins(token);
      setLogins(loginsData);
    } catch (error) {
      console.error("Erro ao buscar logins:", error.message);
    }
  };

  const handleLogins = async (loginId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await retirarLogin(token, loginId);
      setLogins(prevLogins => prevLogins.filter(login => login.id !== loginId));
      alert("Login retirado com sucesso!");
    } catch (error) {
      console.error("Erro ao retirar login:", error.message);
      alert("Falha ao retirar login.");
    }
  };

  const renderLogin = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Funcionário: {item.username}</Text>
      <Text style={styles.cardDetail}>Estado: {item.status ? "Em servico" : "Off"}</Text>
      <Text style={styles.cardDetail}>Última Atividade: {item.lastActive}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => RetirarLogin(item.id)}
      >
        <Text style={styles.buttonText}>Visualizar Info</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={logins}
        renderItem={renderLogin}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: screenHeight * 0.1, // Add some padding at the top
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 20, // Add some padding at the bottom
  },
  card: {
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
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderColor: "#000",
    borderWidth: 1
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default FuncionariosScreen;