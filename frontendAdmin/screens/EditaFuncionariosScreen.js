import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { atualizarInformacoesDoUsuario } from "../api/apiAuth";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const screenHeight = Dimensions.get("window").height;

const EditaFuncionarioScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setPassword("");
      setRole(user.role);
    }
  }, [user]);

  const animateScaleIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateScaleOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleSave = async () => {
    animateScaleIn();
    const token = await AsyncStorage.getItem("token");
    try {
      const userData = {
        username: username,
        email: email,
        role: role,
        password: password,
      };
      console.log(userData);
      await atualizarInformacoesDoUsuario(token, user.id, userData);
      Alert.alert("Sucesso", "Funcionário atualizado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error.message);
      Alert.alert("Erro", "Falha ao atualizar funcionário.");
    } finally {
      animateScaleOut();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name={"arrow-back-outline"}
            size={24}
            color={COLORS.accent}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>
          Editar Funcionário
        </Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: COLORS.secondary, color: COLORS.text },
          ]}
          placeholder="Nome de usuário"
          placeholderTextColor={COLORS.text}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: COLORS.secondary, color: COLORS.text },
          ]}
          placeholder="Email"
          placeholderTextColor={COLORS.text}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: COLORS.secondary, color: COLORS.text },
          ]}
          placeholder="Password"
          placeholderTextColor={COLORS.text}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: COLORS.secondary, color: COLORS.text },
          ]}
          placeholder="Role"
          placeholderTextColor={COLORS.text}
          value={role}
          onChangeText={setRole}
        />
        <Animated.View style={[styles.buttonAnimated, { transform: [{ scale: scaleValue }] }]}>
        <Pressable
          style={[styles.saveButton, { backgroundColor: COLORS.accent }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Salvar</Text>
        </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp('5%'),
    paddingHorizontal: wp('2.5%'),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp('2.5%'),
    paddingVertical: hp('1.25%'),
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: "bold",
    marginLeft: wp('2.5%'),
  },
  backButton: {
    marginRight: wp('2.5%'),
  },
  form: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: wp('5%'),
  },
  input: {
    height: hp('5.95%'),
    borderRadius: 8,
    paddingHorizontal: wp('3.75%'),
    marginBottom: hp('2.5%'),
    fontSize: wp('3.85%'),
  },
  saveButton: {
    padding: hp('2%'),
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: wp('4%'),
    fontWeight: "bold",
  },
});

export default EditaFuncionarioScreen;
