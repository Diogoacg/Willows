import { Image,StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from 'react';
import { useNavigation } from "@react-navigation/native";

const HomePage = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Image source={require("../assets/logofinal.jpg")} style={styles.logo}/>
            <Image source={require("../assets/imagemfundo.jpg")} style={styles.bgimage}/>
            <View style={styles.button1Container}>
                <TouchableOpacity style={[styles.gerirPedidosButton]}>
                    <Text style={styles.gerirPedidosButtonText}>Gerir Pedidos</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.button2Container}>
                <TouchableOpacity style={[styles.gerirPedidosButton]}
                                  onPress={() => navigation.navigate('PedidosPopulares')}>
                    <Text style={styles.fazerPedidosButtonText}>Fazer Pedidos</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create ({
    container:{
        flex: 1,
        alignItems: 'center',
    },
    logo: {
        height: 40,
        width: 140,
        marginVertical: 40,
    },
    bgimage:{
        height: 550,
        width: 320,
        marginVertical: 18,
    },
    button1Container:{
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#000000',
        width: '50%',
        height: 60,
        borderRadius: 100,
    },
    button2Container:{
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#000',
        width: '50%',
        height: 60,
        borderRadius: 100,
    },
    gerirPedidosButton:{
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        borderRadius: 98
    },
    gerirPedidosButtonText:{
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold'
    },
    fazerPedidosButtonText:{
        fontSize: 18,
        fontWeight: 'bold',
        alignItems: 'center',
    }
})

export default HomePage