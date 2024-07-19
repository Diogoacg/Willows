import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import {
  obterLucroTotalPorUsuario,
  obterTotalPedidosDMW,
  obterOrdersPorItem,
  obterLucro,
} from "../api/apiStats";
import DoughnutChart from "../components/DoughnutChart";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StatsScreen = () => {
  const [profitPerUser, setProfitPerUser] = useState(null);
  const [totalOrdersDMW, setTotalOrdersDMW] = useState(null);
  const [ordersPerItem, setOrdersPerItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("token");
      try {
        const profitData = await obterLucro(token);
        const ordersData = await obterTotalPedidosDMW(token);
        const itemsData = await obterOrdersPorItem(token);

        console.log("profitData", profitData);
        console.log("ordersData", ordersData);
        console.log("itemsData", itemsData);

        setProfitPerUser(profitData);
        setTotalOrdersDMW(ordersData);
        setOrdersPerItem(itemsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  console.log("ordersPerItem", ordersPerItem);
  // Prepare data for doughnut chart (first 5 items + others)
  const doughnutData = ordersPerItem.slice(0, 5);
  if (ordersPerItem.length > 5) {
    const others = ordersPerItem
      .slice(5)
      .reduce((acc, item) => acc + item.totalOrders, 0);
    doughnutData.push({ key: "Outros", value: others });
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Estatísticas</Text>
      <DoughnutChart data={doughnutData} />
      <Text>Lucro diário: {totalOrdersDMW.dailyProfit}</Text>
      <Text>Lucro semanal: {totalOrdersDMW.weeklyProfit}</Text>
      <Text>Lucro mensal: {totalOrdersDMW.monthlyProfit}</Text>
    </View>
  );
};

export default StatsScreen;
