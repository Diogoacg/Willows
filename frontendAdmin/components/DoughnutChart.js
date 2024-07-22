import React, { useState, useMemo } from "react";
import { View, Text as RNText, Dimensions, StyleSheet } from "react-native";
import { PieChart } from "react-native-svg-charts";
import { G, Text } from "react-native-svg";
import { colors } from "../config/theme";
import { useTheme } from "../ThemeContext";

const DoughnutChart = ({ data }) => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF1919",
  ];

  const { isDarkMode } = useTheme();
  const THEME = isDarkMode ? colors.dark : colors.light;

  const [selectedSlice, setSelectedSlice] = useState({ label: "", value: 0 });
  const [labelWidth, setLabelWidth] = useState(0);
  const deviceWidth = Dimensions.get("window").width;

  // Memoize sorted data
  const sortedData = useMemo(() => {
    return data
      .filter((item) => item.totalOrders !== undefined)
      .sort((a, b) => b.totalOrders - a.totalOrders);
  }, [data]);

  // Get the top 6 items and the rest as "Others"
  const topItems = useMemo(() => sortedData.slice(0, 6), [sortedData]);
  const totalOrders = useMemo(
    () => topItems.reduce((sum, item) => sum + item.totalOrders, 0),
    [topItems]
  );

  const pieData = useMemo(
    () =>
      topItems
        .filter((item) => item.totalOrders > 0)
        .map((item, index) => ({
          key: item.itemId,
          value: item.totalOrders,
          percentage: ((item.totalOrders / totalOrders) * 100).toFixed(2),
          svg: { fill: COLORS[index % COLORS.length] },
          arc: {
            outerRadius: `70%${
              item.itemId === selectedSlice.label ? " + 10" : ""
            }`,
            padAngle: item.itemId === selectedSlice.label ? 0.1 : 0,
          },
          onPress: () =>
            setSelectedSlice({ label: item.itemId, value: item.totalOrders }),
        })),
    [topItems, selectedSlice, totalOrders]
  );

  return (
    <View style={[styles.container, { backgroundColor: THEME.secondary }]}>
      <PieChart
        style={[styles.chart, { width: deviceWidth * 0.8 }]} // Dynamic width
        outerRadius={"80%"}
        innerRadius={"45%"}
        data={pieData}
      >
        {selectedSlice.label !== "" && (
          <G key="label" x={0} y={0}>
            <Text
              x={0}
              y={-10}
              fill={THEME.text}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={16}
              stroke={THEME.text}
              strokeWidth={0.2}
              onLayout={({
                nativeEvent: {
                  layout: { width },
                },
              }) => setLabelWidth(width)}
            >
              {topItems.find((item) => item.itemId === selectedSlice.label)
                ?.itemName || ""}
            </Text>
            <Text
              x={0}
              y={10}
              fill={THEME.text}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={16}
              stroke={THEME.text}
              strokeWidth={0.2}
            >
              {`${selectedSlice.value} (${(
                (selectedSlice.value / totalOrders) *
                100
              ).toFixed(2)}%)`}
            </Text>
          </G>
        )}
      </PieChart>
      <View style={styles.labelsContainer}>
        {pieData.map((item, index) => (
          <View key={`legend-${index}`} style={styles.label}>
            <View
              style={[
                styles.labelColor,
                { backgroundColor: COLORS[index % COLORS.length] },
              ]}
            />
            <RNText
              style={[styles.labelText, { color: THEME.text }]}
              numberOfLines={1}
            >
              {item.key === "others"
                ? "Outros"
                : data.find((d) => d.itemId === item.key).itemName}
            </RNText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
  },
  chart: {
    height: 300,
    marginBottom: -50,
  },
  labelsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  labelColor: {
    width: 12,
    height: 12,
    marginRight: 5,
    borderRadius: 6,
  },
  labelText: {
    fontSize: 8,
  },
});

export default DoughnutChart;
