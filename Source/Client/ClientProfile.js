import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity
} from "react-native";
import {
  ChevronLeftIcon
} from "react-native-heroicons/outline";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function ClientProfile() {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [clientPassword, setClientPassword] = useState(null);
  const [clientPhoneNumber, setClientPhoneNumber] = useState(null);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        const storedPassword = await AsyncStorage.getItem('password');
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        console.log(storedId);
        console.log(storedPassword);
        console.log(storedPhoneNumber);
        if (storedId) {
          setClientId(storedId);
        }
        if(storedPassword){
          setClientPassword(storedPassword);
        }
        if(storedPhoneNumber){
          setClientPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };

    fetchClientId();
  }, []);
  useEffect(() => {


    const fetchData = async () => {
      if (clientId) {
        try {
          const response = await axios.get(`https://api-v7quhc5aza-uc.a.run.app/getClient/${clientId}`);
          const dataArray = Object.values(response.data);
          setData(response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };

    if(clientId)fetchData();
  }, [clientId, clientPassword, clientPhoneNumber]);
  return (
    <ScrollView style={{flex: 1,display: "flex",fontFamily: "Montserrat",color: "#76B117"}}>
      <TouchableOpacity style = {{padding: 40, marginLeft: -20, flexDirection: 'row'}} onPress={() => navigation.goBack()} >
        <ChevronLeftIcon size={20} color={"black"} strokeWidth={5} />
      </TouchableOpacity>
      <Text style = {{alignSelf: "center", marginTop: -60, fontWeight: "bold", fontSize: 16}}>
        Profile
      </Text>

      <View style = {{alignContent: "center", alignSelf: "center", flexDirection: "column", paddingTop: 40}}>
        <Image
          source={{uri: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"}}
          style = {{width: 140, height: 140, borderRadius: 80}}
        />
        <Text style = {{fontWeight: "800", color: "black", fontSize: 28, alignSelf: "center", paddingTop: 10}}>
          {data?.Name}
        </Text>
        <Text style = {{fontWeight: "500", color: "black", alignContent: "center", alignSelf: "center", fontSize: 18}}>
          Client
        </Text>
      </View>



      <TouchableOpacity style={{padding: 20, borderColor: "gray", borderWidth: 1, width: "85%", alignSelf: "center", borderRadius: 10, marginTop: 50}} onPress={() => navigation.navigate("Main", {screen: "Catalogue"})}>
        <Text style={{marginTop: -8}}>
          Manage your catalogs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={{padding: 20, borderColor: "gray", borderWidth: 1, width: "85%", alignSelf: "center", borderRadius: 10, marginTop: 20}} onPress={() => navigation.navigate("Home Screen")}>
        <Text style={{marginTop: -8}}>
          Manage Teams
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={{padding: 20, borderColor: "gray", borderWidth: 1, width: "85%", alignSelf: "center", borderRadius: 10, marginTop: 20}} onPress={() => navigation.navigate("Add Outlet")}>
        <Text style={{marginTop: -8}}>
          Set up Outlet
        </Text>
      </TouchableOpacity>


      {/*PERSONAL DETAILS*/}

      <Text style = {{padding: 20, color: "black", fontFamily: "Montserrat", fontSize: 18, fontStyle: "normal", fontWeight: "bold", alignSelf: "stretch", lineHeight: 10, marginTop: 20}}>
        Personal Details
      </Text>
      <View style = {{alignSelf: "stretch", padding: 20, paddingTop: -20}}>
        <Text style = {{color: "black", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: "bold", lineHeight: 20, padding: 10}}>
          Phone Number
        </Text>
        <Text style = {{borderRadius: 10, borderColor: "gray", borderWidth: 1, height: 50, padding: 14, alignItems: "center", alignSelf: "stretch"}}>
          {clientPhoneNumber}
        </Text>
      </View>
      <View style = {{alignSelf: "stretch", padding: 20, paddingTop: -20}}>
        <Text style = {{color: "black", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: "bold", lineHeight: 20, padding: 10}}>
          Password
        </Text>
        <Text style = {{borderRadius: 10, borderColor: "gray", borderWidth: 1, height: 50, padding: 14, alignItems: "center", alignSelf: "stretch"}}>
          {clientPassword}
        </Text>
      </View>
      <View>
        <Text style = {{color: "#76B117", textAlign: "right", fontFamily: "Montserrat", fontSize: 12, fontStyle: "normal", fontWeight: 600, lineHeight: 20, textDecorationLine: "underline", textDecorationStyle: "solid", marginRight: 20}}>
          Change Password
        </Text>
      </View>


      {/*Business Address Details*/}
      <View>
        <Text style = {{alignSelf: "stretch", color: "black", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: 800, lineHeight: 30, padding: 10}}>
          Business Address Details
        </Text>
      </View>
      <View style = {{alignSelf: "stretch", padding: 20, paddingTop: -20}}>
        <Text style = {{color: "#76B117", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: "bold", lineHeight: 20, padding: 10}}>
          Pincode
        </Text>
        <Text style = {{borderRadius: 10, borderColor: "gray", borderWidth: 1, height: 50, padding: 14, alignItems: "center", alignSelf: "stretch"}}>
          {data?.pincode}
        </Text>
      </View>
      <View style = {{alignSelf: "stretch", padding: 20, paddingTop: -20}}>
        <Text style = {{color: "#76B117", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: "bold", lineHeight: 20, padding: 10}}>
          Shipping Address
        </Text>
        <TextInput
          placeholder={"Enter Shipping Address"}
          keyboardType={"default"}
          style = {{borderRadius: 10, borderColor: "gray", borderWidth: 1, height: 50, padding: 14, alignItems: "center", alignSelf: "stretch", color: "black"}}
        />
      </View>
      <View style = {{alignSelf: "stretch", padding: 20, paddingTop: -20}}>
        <Text style = {{color: "#76B117", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: "bold", lineHeight: 20, padding: 10}}>
          Billing Address
        </Text>
        <TextInput
          placeholder={"Enter Billing Address"}
          keyboardType={"default"}
          style = {{borderRadius: 10, borderColor: "gray", borderWidth: 1, height: 50, padding: 14, alignItems: "center", alignSelf: "stretch", color: "black"}}
        />
      </View>
      <View style = {{alignSelf: "stretch", padding: 20, paddingTop: -20}}>
        <Text style = {{color: "#76B117", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: "bold", lineHeight: 20, padding: 10}}>
          GST Number
        </Text>
        <TextInput
          placeholder={"Enter GST Number"}
          keyboardType={"default"}
          style = {{borderRadius: 10, borderColor: "gray", borderWidth: 1, height: 50, padding: 14, alignItems: "center", alignSelf: "stretch", color: "black"}}
        />
      </View>
      <View style = {{alignSelf: "stretch", padding: 20, paddingTop: -20}}>
        <Text style = {{color: "#76B117", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: "bold", lineHeight: 20, padding: 10}}>
          State
        </Text>
        <Text style = {{borderRadius: 10, borderColor: "gray", borderWidth: 1, height: 50, padding: 14, alignItems: "center", alignSelf: "stretch"}}>
          {data?.state}
        </Text>
      </View>
      <View style = {{alignSelf: "stretch", padding: 20, paddingTop: -20}}>
        <Text style = {{color: "#76B117", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: "bold", lineHeight: 20, padding: 10}}>
          Country
        </Text>
        <Text style = {{borderRadius: 10, borderColor: "gray", borderWidth: 1, height: 50, padding: 14, alignItems: "center", alignSelf: "stretch"}}>
          {data?.country}
        </Text>
      </View>

      {/*Buttons*/}
      <TouchableOpacity style = {{display: "flex", width: 327, padding: 14, alignSelf: "center", backgroundColor: "#76B117", alignItems: "center", justifyContent: "center", borderRadius: 20}}>
        <Text style={{color: "#FFF", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: 500, lineHeight: 22}}>
          Save
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style = {{display: "flex", width: 327, padding: 14, alignSelf: "center", backgroundColor: "#E74C3C", alignItems: "center", justifyContent: "center", borderRadius: 20, marginTop: 10}}>
        <Text style={{color: "#FFF", fontFamily: "Montserrat", fontSize: 16, fontStyle: "normal", fontWeight: 500, lineHeight: 22}}>
          Log Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {flex: 1,display: "flex",fontFamily: "Montserrat",color: "#76B117"},
  profileView: {},
})
