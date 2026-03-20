import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { atualizarItemNoInventario } from "../api/apiInventory";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";

const screenHeight = Dimensions.get("window").height;

const EditaItemScreen = () => {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (item) {
      setNome(item.nome);
      setPreco(item.preco.toString());
    }
  }, [item]);

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
    setSubmitting(true);
    const token = await AsyncStorage.getItem("token");
    try {
      await atualizarItemNoInventario(token, item.id, nome, preco);
      setModalTitle("Sucesso");
      setModalMessage("Item atualizado com sucesso!");
      setModalAction(() => () => navigation.goBack());
      setModalVisible(true);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Falha ao atualizar item: " + error.message);
      setModalAction(null);
      setModalVisible(true);
    } finally {
      animateScaleOut();
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={"return-down-back"} size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>
          Editar Item
        </Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: COLORS.secondary, color: COLORS.text },
          ]}
          placeholder="Nome do item"
          placeholderTextColor={COLORS.text}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: COLORS.secondary, color: COLORS.text },
          ]}
          placeholder="Preço"
          placeholderTextColor={COLORS.text}
          value={preco}
          keyboardType="numeric"
          onChangeText={setPreco}
        />
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <Pressable
            style={[styles.saveButton, { backgroundColor: COLORS.accent, opacity: submitting ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={[styles.saveButtonText, { color: COLORS.text }]}>
                Salvar
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </View>

      {/* Custom Alert Modal */}
      <CustomAlertModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          if (modalAction) modalAction();
        }}
        title={modalTitle}
        message={modalMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp("5%"),
    paddingHorizontal: wp("2.5%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("2.5%"),
    paddingVertical: hp("1.5%"),
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    marginLeft: wp("2%"),
  },
  backButton: {
    marginRight: wp("2%"),
  },
  form: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: wp("5%"),
  },
  input: {
    height: hp("6%"),
    borderRadius: 8,
    paddingHorizontal: wp("4.5%"),
    marginBottom: hp("2.2%"),
    fontSize: wp("4%"),
  },
  saveButton: {
    padding: hp("2%"),
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
});

export default EditaItemScreen;
