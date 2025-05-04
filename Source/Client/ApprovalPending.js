import React from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {ChevronLeftIcon, StarIcon} from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";

export default function ApprovalPending(){
    const navigation = useNavigation();
    let order_id = 1548745
    return(
        <View style={styles.container}>
            <View style = {styles.headerView}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeftIcon size={22} color={"black"} strokeWidth={4} />
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    Approval Pending
                </Text>
            </View>
            <View style = {styles.contentView}>
                <StarIcon size={50} color={"#76B117"} />
                <Text style = {styles.contentViewText1}>
                    Approval Pending
                </Text>
                <Text style = {styles.orderIdText}>
                    Order id: {order_id}
                </Text>
                <Text style={styles.contentViewText2}>
                    Your order has been placed successfully.
                </Text>
                <Text style={styles.contentViewText3}>
                    Thanks for choosing us!
                </Text>
            </View>
            <TouchableOpacity style = {styles.buttonView} onPress={() => navigation.navigate("Main", {screen: "Home"})}>
                <Text style = {styles.buttonText}>
                    Track Order
                </Text>
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between"
    },
    headerView: {
        paddingTop: 25,
        marginTop: -5,
        flexDirection: "row"
    },
    headerText: {
        fontStyle: "normal",
        fontWeight: "bold",
        fontSize: 18,
        marginLeft: 10
    },
    contentView: {
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center"
    },
    contentViewText1: {
        color: "#76B117",
        fontStyle: "normal",
        fontWeight: "bold",
        fontSize: 28
    },
    contentViewText2: {
        fontStyle: "normal",
        fontWeight: "bold",
        fontSize: 16
    },
    contentViewText3: {
        fontStyle: "normal",
        fontWeight: "bold",
        fontSize: 16
    },
    buttonView: {
        alignItems: "center",
        width: "90%",
        backgroundColor: "green",
        padding: 10,
        alignSelf: "center",
        borderRadius: 20,
        marginBottom: 20
    },
    buttonText: {
        color: "white",
        fontStyle: "normal",
        fontWeight: "bold",
        fontSize: 18
    },
    orderIdText: {
        color: "#76B117",
        marginTop: 20,
        fontStyle: "normal",
        fontWeight: 800,
        fontSize: 16
    }
})