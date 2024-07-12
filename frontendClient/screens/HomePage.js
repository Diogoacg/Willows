import { Image,StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from 'react';

const HomePage = () => {
    return (
        <View style={styles.container}>
            <Image source={require("../assets/logofinal.jpg")} style={styles.logo}/>
            <Image source={require("../assets/imagemfundo.jpg")} style={styles.bgimage}/>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.gerirPedidosButton,{backgroundColor: '#a2d2ff'}]}>
                    <Text style={styles.gerirPedidosButtonText}>Gerir Pedidos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.gerirPedidosButton]}>
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
    buttonContainer:{
        flexDirection: 'row',
        marginTop: 32,
        borderWidth: 1,
        borderColor: '#a2d2ff',
        width: '78%',
        height: 60,
        borderRadius: 100,
    },
    gerirPedidosButton:{
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        borderRadius: 98
    },
    gerirPedidosButtonText:{
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    fazerPedidosButtonText:{
        fontSize: 18,
        fontWeight: 'bold'
    }
})


export default HomePage