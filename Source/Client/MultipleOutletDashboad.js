import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView} from 'react-native';
import {ChevronLeftIcon} from "react-native-heroicons/outline";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function MultipleOutletDashboard () {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (storedId) {
          setClientId(storedId);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };

    const fetchData = async () => {
      if (clientId) {
        try {
          const response = await axios.get(`https://api-v7quhc5aza-uc.a.run.app/getOutlets/${clientId}`);
          const dataArray = Object.values(response.data);
          setData(dataArray);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchClientId();
    fetchData();
  }, [clientId]); // Adding clientId to dependencies so it fetches data when clientId changes

  return (
    <ScrollView style = {{flex: 1, display: "flex", backgroundColor: "lightgray"}}>
      {/*Header*/}
      <View style={{flexDirection: "row", padding: 10, marginTop: 28, height: 80, alignItems: "center"}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={25} color={"black"} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={{marginLeft: 10, color: "#0F1828", fontFamily: "Montserrat", fontSize: 22, fontStyle: "normal", fontWeight: 700, lineHeight: 24}}>
          Outlets
        </Text>
      </View>
      <TouchableOpacity style={{flexDirection: "row", alignItems: "center", height: 48, backgroundColor: "white"}} onPress={() => navigation.navigate("Add Outlet")}>
        <Text style={{paddingLeft: 10, alignSelf: "center", color: "#76B117", fontFamily: "Montserrat", fontSize: 14, fontStyle: "normal", fontWeight: 700,  lineheight: 10}}>
          + Add New Outlet
        </Text>
      </TouchableOpacity>
      <Text style={{paddingLeft: 10, padding: 20, color: "black", fontFamily: "Montserrat", fontSize: 18, fontStyle: "normal", fontWeight: 700}}>
        Other Outlets
      </Text>
      {}
      <FlatList
        data = {data}
        keyExtractor={(item) => item.outletId}
        numColumns={1}
        renderItem={({ item }) => (
          <View style={{backgroundColor: "white", marginBottom: 10, padding: 10}}>
            <Text style = {{color: "#2C3E50", fontFamily: "Montserrat", fontSize: 14, fontStyle: "normal", fontWeight: 700, lineHeight: 20}}>
              {item.OutletName}
            </Text>
            <Text style={{color: "#2C3E50", fontFamily: "Open Sans", fontSize: 14, fontStyle: "normal", fontWeight: 400, lineHeight: 20}}>
              {item.BillingAddress}
            </Text>
            <Text style={{color: "#2C3E50", fontFamily: "Open Sans", fontSize: 14, fontStyle: "normal", fontWeight: 400, lineHeight: 20}}>
              {item.Address}
            </Text>
            <Text style={{color: "#2C3E50", fontFamily: "Open Sans", fontSize: 14, fontStyle: "normal", fontWeight: 400, lineHeight: 20}}>
              {item.city} {item.state} {item.country}
            </Text>
          </View>
        )}
      />
    </ScrollView>
  )
}
