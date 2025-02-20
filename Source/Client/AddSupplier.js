import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, ScrollView} from 'react-native';
import {ChevronLeftIcon} from "react-native-heroicons/outline";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function AddSupplier(){
  const navigation = useNavigation();
  const options = ["Email", "Whatsapp", "SMS"];
  const [selectedOption, setSelectedOption] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    pincode: '',
    state: '',
    country: ''
  });
  useEffect(() => {
    const fetchClientId = async () => {
      try{
        const storedId = await AsyncStorage.getItem('userId');
        if(storedId){
          setClientId(storedId);
        }
        else{}
      }
      catch(error){
        console.log('Error Fetching Client ID: ', error);
      }
    }
    fetchClientId();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    const supplierId = Math.floor(Math.random() * 10000000);
    const id = clientId;
    console.log(id);
    const {businessName, email, pincode, state, country} = form;

    if(!id || !businessName || !email || !pincode || !state || !country) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    if(!validateEmail(email)){
      Alert.alert('Error', 'Please enter a valid email address!');
      return;
    }

    if(pincode.length !== 6 || isNaN(pincode)){
      Alert.alert('Error', 'Please enter a valid 6 digit pincode')
    }

    const url = `https://api-v7quhc5aza-uc.a.run.app/createSupplier/${supplierId}/${id}/${businessName}/${email}/${pincode}/${state}/${country}`;
    console.log("this is the url "+url);

    try{
      const response = await axios.get(url, {
        headers: {'Content-Type': 'application/json'}
      })
      if (response.data === 'Ok' || response.status === 200) {
        Alert.alert('Success', 'Profile saved successfully!');
        navigation.navigate("Main", {screen: "Home Screen"});
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save profile');
      }
    } catch(error){
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
      console.error('Axios error:', error);
    }

  }

  return (
    <ScrollView style={styles.container}>
      {/*Header*/}
      <View style = {styles.addSuppliesView}>
        <TouchableOpacity style={{marginLeft: -20}} onPress={() => navigation.goBack()} >
          <ChevronLeftIcon size={24} color={"black"} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.addSuppliesText}>
          Add Supplier
        </Text>
      </View>
      <View style = {styles.linkProductsView}>
        <Image
          source={require("../Images/ProckuredImage.jpg")}
          style = {styles.linkProductsImage}
        />
        <TouchableOpacity style = {styles.linkProductsTouchableOpacity} onPress={handleSave}>
          <Text style={styles.linkProductsText}>
            Link Products
          </Text>
        </TouchableOpacity>
      </View>
      {['businessName', 'email', 'pincode', 'state', 'country'].map((field) => (
        <View key={field} style={{ marginBottom: 15, marginLeft: 10 }}>
          <Text style={{ fontWeight: "400", color: "green", fontSize: 16, marginBottom: 5 }}>
            {field.charAt(0).toUpperCase() + field.slice(1)}*
          </Text>
          <TextInput
            placeholder={`Enter ${field}`}
            keyboardType={field === 'pincode' ? "numeric" : "default"}
            value={form[field]}
            onChangeText={(value) => handleChange(field, value)}
            style={{ borderColor: "lightgray", borderWidth: 1, padding: 10, borderRadius: 5, color: "black" }}
          />
        </View>
      ))}
      <TouchableOpacity onPress={handleSave}>
        <View style={styles.addSupplierButtonView}>
          <Text style = {styles.addSupplierButtonText}>
            Add Supplier
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1
  },
  addSuppliesView: {
    flexDirection: "row",
    padding: 30
  },
  addSuppliesText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
    margin: -2,
    marginLeft: 10
  },
  linkProductsView: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  linkProductsImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  linkProductsTouchableOpacity: {
    backgroundColor: "green",
    width: "50%",
    height: "15%",
    borderRadius: 50
  },
  linkProductsText: {
    alignItems: "center",
    alignSelf: "center",
    marginTop: 5,
    color: "white"
  },
  nameView: {
    flexDirection: "column",
    padding: 20,
    justifyContent: "space-between",
    paddingTop: -20
  },
  nameText: {
    fontWeight: "400",
    color: "green",
    fontSize: 16
  },
  nameTextInput: {
    borderColor: "lightgray",
    borderWidth: 1,
    width: "100%"
  },
  categoryView: {
    flexDirection: "column",
    padding: 20,
    justifyContent: "space-between",
    paddingTop: -20
  },
  categoryText: {
    fontWeight: "400",
    color: "green",
    fontSize: 16
  },
  categoryTextInput: {
    borderColor: "lightgray",
    borderWidth: 1,
    width: "100%"
  },
  emailAddressView: {
    flexDirection: "column",
    padding: 20,
    justifyContent: "space-between",
    paddingTop: -20
  },
  emailAddressText: {
    fontWeight: "400",
    color: "green",
    fontSize: 16
  },
  emailAddressTextInput: {
    borderColor: "lightgray",
    borderWidth: 1,
    width: "100%"
  },
  contactInformationView: {
    flexDirection: "column",
    padding: 20,
    justifyContent: "space-between",
    paddingTop: -20
  },
  contactInformationText: {
    fontWeight: "400",
    color: "green",
    fontSize: 16
  },
  contactInformationTextInput: {
    borderColor: "lightgray",
    borderWidth: 1,
    width: "100%"
  },
  sendOrderViaView: {
    padding: 20,
    flex: 1
  },
  sendOrderViaText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
    marginBottom: 10
  },
  sendOrderViaOptionTouchableOpacity: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  sendOrderViaOptionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10
  },
  addSupplierButtonView: {
    backgroundColor: "green",
    padding: 15,
    width: "70%",
    borderRadius: 50,
    justifyContent: "center",
    alignSelf: "center",
  },
  addSupplierButtonText: {
    marginLeft: 75,
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },
})
