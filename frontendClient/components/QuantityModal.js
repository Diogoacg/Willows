import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const QuantityModal = ({ visible, onClose, onAdd, item }) => {
  const [quantity, setQuantity] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const handleAdd = () => {
    onAdd(quantity, observacoes.trim());
    setQuantity(1);
    setObservacoes("");
  };

  const handleClose = () => {
    setQuantity(1);
    setObservacoes("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}>
          <Text style={[styles.itemName, { color: COLORS.text }]} numberOfLines={2}>
            {item?.nome}
          </Text>

          <View style={styles.quantityRow}>
            <Pressable
              style={[styles.qtyBtn, { borderColor: COLORS.neutral }]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={[styles.qtyBtnText, { color: COLORS.accent }]}>−</Text>
            </Pressable>
            <Text style={[styles.qtyText, { color: COLORS.text }]}>{quantity}</Text>
            <Pressable
              style={[styles.qtyBtn, { borderColor: COLORS.neutral }]}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={[styles.qtyBtnText, { color: COLORS.accent }]}>+</Text>
            </Pressable>
          </View>

          <TextInput
            style={[styles.obsInput, { color: COLORS.text, borderColor: COLORS.neutral, backgroundColor: COLORS.primary }]}
            placeholder="Observações (ex: sem açúcar)"
            placeholderTextColor={COLORS.text + "88"}
            value={observacoes}
            onChangeText={setObservacoes}
            maxLength={120}
          />

          <Pressable style={[styles.addBtn, { backgroundColor: COLORS.accent }]} onPress={handleAdd}>
            <Text style={[styles.addBtnText, { color: COLORS.primary }]}>Adicionar</Text>
          </Pressable>
          <Pressable style={[styles.cancelBtn, { borderColor: COLORS.neutral }]} onPress={handleClose}>
            <Text style={[styles.cancelBtnText, { color: COLORS.text }]}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modal: {
    width: wp("80%"),
    borderRadius: wp("3%"),
    borderWidth: 1,
    padding: wp("6%"),
    gap: hp("1.5%"),
  },
  itemName: {
    fontSize: wp("4.5%"),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp("0.5%"),
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp("4%"),
  },
  qtyBtn: {
    borderWidth: 1,
    borderRadius: wp("2%"),
    width: wp("10%"),
    height: wp("10%"),
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    lineHeight: wp("7%"),
  },
  qtyText: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    minWidth: wp("10%"),
    textAlign: "center",
  },
  obsInput: {
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1%"),
    fontSize: wp("3.8%"),
  },
  addBtn: {
    borderRadius: wp("2%"),
    paddingVertical: hp("1.5%"),
    alignItems: "center",
  },
  addBtnText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  cancelBtn: {
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingVertical: hp("1%"),
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: wp("3.8%"),
  },
});

export default QuantityModal;
