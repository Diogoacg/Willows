import React, {useState} from 'react';
import { View } from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { Text } from 'react-native-svg';

const data = [
    { key: 'Categoria 1', value: 400 },
    { key: 'Categoria 2', value: 300 },
    { key: 'Categoria 3', value: 200 },
    { key: 'Categoria 4', value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
// const [categories, setCategories] = useState(null);
// const [selectedCategory, setSelectedCategory] = useState(null);

const StatsScreen = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <PieChart
                style={{ height: 300, width: 300 }}
                data={data}
                innerRadius={60}
                outerRadius={80}
                padAngle={0.05}
                animate={true}
            >
                {data.map((item, index) => (
                    <Text
                        key={`label-${index}`}
                        x={item.labelX || 0}
                        y={item.labelY || 0}
                        fill="white"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fontSize={16}
                    >
                        Estatísticas
                    </Text>
                ))}
            </PieChart>
        </View>
    );
};

export default StatsScreen;