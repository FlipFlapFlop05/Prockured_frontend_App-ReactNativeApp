import React from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {ChevronLeftIcon, StarIcon} from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";

export default function ApprovalPending(){
    const navigation = useNavigation();
    let order_id = 1548745;
    useLayoutEffect(() => {
        navigation.setOptions({
          headerShown: true,
          headerTitle: 'Approval Pending',
          headerStyle: {
            backgroundColor: '#f8f8f8',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            justifyContent: 'center',
            alignItems: 'center',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
            fontFamily: 'Montserrat',
            justifyContent: 'center'
            // color: 'white',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{paddingHorizontal: 13}}>
                <ChevronLeftIcon size={28} color="#333" />
            </TouchableOpacity>
          ),
        });
      }, [navigation]);
    return(
        <View style={styles.container}>
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