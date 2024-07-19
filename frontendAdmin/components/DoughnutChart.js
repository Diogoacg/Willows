import React from "react";
import { PieChart } from "react-native-svg-charts";
import { Text } from "react-native-svg";
import { colors } from "../config/theme";
import { useTheme } from "../ThemeContext";

const DoughnutChart = ({ data }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const COLORS = isDarkMode ? colors.dark : colors.light;
  const pieData = data
    .filter((item) => item.value > 0)
    .map((item, index) => ({
      key: item.key,
      value: item.value,
      svg: { fill: COLORS[index % COLORS.length] },
    }));

  return (
    <PieChart
      style={{ height: 300, width: 300 }}
      data={pieData}
      innerRadius={60}
      outerRadius={80}
      padAngle={0.05}
      animate={true}
    >
      {pieData.map((item, index) => (
        <Text
          key={`label-${index}`}
          x={item.labelX || 0}
          y={item.labelY || 0}
          fill="white"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize={16}
        >
          {item.value}
        </Text>
      ))}
    </PieChart>
  );
};

export default DoughnutChart;
