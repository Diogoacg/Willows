import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { registarNovoUtilizador } from "../api/apiAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";
const CriarFuncionarioScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const COLORS = isDarkMode ? colors.dark : colors.light;

  const styles = useMemo(() => createStyles(COLORS), [COLORS]);

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

  const handleCreateUser = async () => {
    animateScaleIn();
    const token = await AsyncStorage.getItem("token");
    try {
      await registarNovoUtilizador(token, username, email, password, role);
      setModalTitle("Sucesso");
      setModalMessage("Funcionário criado com sucesso!");
      setModalVisible(true);
    } catch (error) {
      console.error("Erro ao criar funcionário:", error.message);
      setModalTitle("Erro");
      setModalMessage("Erro ao criar funcionário: " + error.message);
      setModalVisible(true);
    } finally {
      animateScaleOut();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={"return-down-back"} size={24} color={COLORS.accent} />
        </Pressable>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Criar Novo Funcionário</Text>
        <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: COLORS.secondary,
              color: COLORS.text,
              borderColor: COLORS.neutral,
            },
          ]}
          onChangeText={setUsername}
          value={username}
          placeholder="Nome de Utilizador"
          placeholderTextColor={COLORS.text}
          inputMode="name-phone-pad"
        />
        <Ionicons
          name="person-outline"
          size={24}
          color={COLORS.text}
          style={styles.sideIcon}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: COLORS.secondary,
              color: COLORS.text,
              borderColor: COLORS.neutral,
            },
          ]}
          onChangeText={setEmail}
          value={email}
          placeholder="Email"
          placeholderTextColor={COLORS.text}
          inputMode="name-phone-pad"
        />
        <Ionicons
          name="mail-outline"
          size={24}
          color={COLORS.text}
          style={styles.sideIcon}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: COLORS.secondary,
              color: COLORS.text,
              borderColor: COLORS.neutral,
            },
          ]}
          onChangeText={setPassword}
          value={password}
          placeholder="Password"
          placeholderTextColor={COLORS.text}
          inputMode="name-phone-pad"
        />
        <Ionicons
          name="key-outline"
          size={24}
          color={COLORS.text}
          style={styles.sideIcon}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: COLORS.secondary,
              color: COLORS.text,
              borderColor: COLORS.neutral,
            },
          ]}
          onChangeText={setRole}
          value={role}
          placeholder="Função"
          placeholderTextColor={COLORS.text}
          inputMode="name-phone-pad"
        />
        <Ionicons
          name="construct-outline"
          size={24}
          color={COLORS.text}
          style={styles.sideIcon}
        />
      </View>
        <Animated.View
          style={[
            styles.buttonAnimated,
            { transform: [{ scale: scaleValue }] },
          ]}
        >
          <Pressable style={styles.button} onPress={handleCreateUser}>
            <Text style={styles.buttonText}>Criar Funcionário</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </View>
  );
};

const createStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      paddingTop: hp("5%"),
      flex: 1,
      backgroundColor: COLORS.primary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: hp("2%"),
      paddingVertical: hp("1%"),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.neutral,
    },
    backButton: {
      marginRight: wp("2%"),
    },
    formContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: hp("2%"),
    },
    title: {
      color: COLORS.text,
      fontSize: wp("6%"),
      fontWeight: "bold",
      marginBottom: hp("3%"),
    },
    input: {
      color: COLORS.text,
      width: wp("80%"),
      height: hp("5.75%"),
      borderColor: COLORS.neutral,
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: hp("2.65%"),
      paddingHorizontal: wp("2.5%"),
      backgroundColor: COLORS.secondary,
    },
    button: {
      width: wp("80%"),
      backgroundColor: COLORS.accent,
      padding: hp("2%"),
      borderRadius: wp("6%"),
      alignItems: "center",
    },
    buttonText: {
      color: "#000",
      fontSize: wp("4.25%"),
      fontWeight: "bold",
    },
    buttonAnimated: {
      width: "100%",
      alignItems: "center",
    },
    inputContainer: {
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
    },
    sideIcon: {
      position: "absolute",
      right: wp("5.5%"),
      top: hp("0.5%"),
      padding: wp("2.5%"),
    },
  });

export default CriarFuncionarioScreen;
