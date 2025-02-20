import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, CheckBox} from 'react-native';
import {ChevronLeftIcon} from "react-native-heroicons/outline";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function AddOutlet() {
  const navigation = useNavigation();
  const [clientId, setClientId] = useState(null);
  const [form, setForm] = React.useState({
    name: '',
    address: '',
    city: '',
    billingAddress: '',
    GST: '',
    state: '',
    country: ''
  });
  const [isBillingAddressSame, setIsBillingAddressSame] = useState(false);
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



  const handleSave = async () => {
    const { name, address, city,  billingAddress, GST, state, country} = form;
    const id = clientId;
    const outletId = Math.floor(Math.random() * 100000)
    if (!name || !address || !city || !billingAddress || !GST || !state || !country) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }


    navigation.navigate("Main", { screen: "Home Page" });
    const url = `https://api-v7quhc5aza-uc.a.run.app/addOutlet/${outletId}/${id}/${name}/${address}/${billingAddress}/${city}/${state}/${country}`;
    //console.log(url);

    // const payload = {
    //     name,
    //     id,
    //     businessName,
    //     email,
    //     pincode,
    //     state,
    //     country
    // };
    // const url1 = url+payload;
    // console.log(url1);

    try {
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' }

      });
      console.log(response);

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Outlet Added');
        navigation.navigate("Main", { screen: "Home Page" });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save profile');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
      console.error('Axios error:', error);
    }
  };

  return (
    <ScrollView style = {styles.container}>
      {/*Header*/}
      <View style={styles.outletView}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={25} color={"black"} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.outletText}>
          Add New Outlet
        </Text>
      </View>
      {['name', 'address', 'city', 'billingAddress', 'GST', 'state', 'country'].map((field) => (
        <View key={field} style={{ marginBottom: 15, paddingLeft: 10 }}>
          <Text style={{ fontWeight: "bold", color: "green", fontSize: 18, marginBottom: 5 }}>
            {field.charAt(0).toUpperCase() + field.slice(1)}*
          </Text>
          <TextInput
            placeholder={`Enter ${field}`}
            keyboardType={field === 'GST' ? "numeric" : "default"}
            value={form[field]}
            onChangeText={(value) => handleChange(field, value)}
            style={{ borderColor: "lightgray", borderWidth: 1, padding: 10, borderRadius: 5, color: "black" }}
          />
        </View>
      ))}
      <View style = {styles.buttonsView}>
        <TouchableOpacity style = {styles.cancelTouchableOpacity}>
          <Text style = {styles.cancelText}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.saveTouchableOpacity} onPress={handleSave}>
          <Text style = {styles.saveText}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: "white"
  },
  outletView: {
    flexDirection: "row",
    padding: 10,
    marginTop: 28,
    height: 80,
    alignItems: "center"
  },
  outletText: {
    marginLeft: 10,
    color: "#0F1828",
    fontFamily: "Montserrat",
    fontSize: 22,
    fontStyle: "normal",
    fontWeight: 700,
    lineHeight: 24
  },
  addNewOutletView: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "white"
  },
  addNewOutletText: {
    paddingLeft: 10,
    alignSelf: "center",
    color: "#76B117",
    fontFamily: "Montserrat",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: 700,
    lineheight: 10
  },
  nameView: {
    alignSelf: "stretch",
    padding: 20,
    paddingTop: -20
  },
  nameText: {
    color: "#76B117",
    fontFamily: "Montserrat",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    lineHeight: 20,
    padding: 10
  },
  nameTextInput: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    height: 50,
    padding: 14,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "white"
  },
  addressView: {
    alignSelf: "stretch",
    padding: 20,
    paddingTop: -20
  },
  addressText: {
    color: "#76B117",
    fontFamily: "Montserrat",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    lineHeight: 20,
    padding: 10
  },
  addressTextInput: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    height: 50,
    padding: 14,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "white"
  },
  cityView: {
    alignSelf: "stretch",
    padding: 20,
    paddingTop: -20
  },
  cityText: {
    color: "#76B117",
    fontFamily: "Montserrat",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    lineHeight: 20,
    padding: 10
  },
  cityTextInput: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    height: 50,
    padding: 14,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "white"
  },
  billingAddressView: {
    alignSelf: "stretch",
    padding: 20,
    paddingTop: -20
  },
  billingAddressText: {
    color: "#76B117",
    fontFamily: "Montserrat",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    lineHeight: 20,
    padding: 10
  },
  billingAddressTextInput: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    height: 50,
    padding: 14,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "white"
  },
  gstView: {
    alignSelf: "stretch",
    padding: 20,
    paddingTop: -20
  },
  gstText: {
    color: "#76B117",
    fontFamily: "Montserrat",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    lineHeight: 20,
    padding: 10
  },
  gstTextInput: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    height: 50,
    padding: 14,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "white"
  },
  stateView: {
    alignSelf: "stretch",
    padding: 20,
    paddingTop: -20
  },
  stateText: {
    color: "#76B117",
    fontFamily: "Montserrat",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    lineHeight: 20,
    padding: 10
  },
  stateTextInput: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    height: 50,
    padding: 14,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "white"
  },
  countryView: {
    alignSelf: "stretch",
    padding: 20,
    paddingTop: -20
  },
  countryText: {
    color: "#76B117",
    fontFamily: "Montserrat",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
    lineHeight: 20,
    padding: 10
  },
  countryTextInput: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    height: 50,
    padding: 14,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "white"
  },
  buttonsView: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    marginBottom: 20
  },
  cancelTouchableOpacity: {
    width: 150,
    height: 40,
    backgroundColor: "white",
    alignItems: "center",
    marginLeft: 20,
    marginTop: -10,
    borderRadius: 10
  },
  cancelText: {
    color: "#76B117",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 5
  },
  saveTouchableOpacity: {
    width: 150,
    height: 40,
    backgroundColor: "#76B117",
    alignItems: "center",
    marginRight: 20,
    marginTop: -10,
    borderRadius: 10
  },
  saveText: {
    color: "white",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 5
  },
})
