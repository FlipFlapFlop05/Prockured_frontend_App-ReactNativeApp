import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function AddSupplier() {
  const navigation = useNavigation();
  const options = ["Email", "Whatsapp", "SMS"];
  const [selectedOption, setSelectedOption] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    pincode: '',
    state: '',
    country: '',
    supplierPhoneNumber: ''
  });

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    }
    fetchPhoneNumber();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    const id = phoneNumber;
    const { businessName, email, pincode, state, country, supplierPhoneNumber } = form;

    if (!id || !businessName || !email || !pincode || !state || !country || !supplierPhoneNumber) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address!');
      return;
    }

    if (pincode.length !== 6 || isNaN(pincode)) {
      Alert.alert('Error', 'Please enter a valid 6 digit pincode');
      return;
    }

    const url = `https://api-v7quhc5aza-uc.a.run.app/createSupplier/${supplierPhoneNumber}/${id}/${businessName}/${email}/${pincode}/${state}/${country}`;
    try {
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data === 'Ok' || response.status === 200) {
        Alert.alert('Success', 'Profile saved successfully!');
        navigation.navigate("Main", { screen: "Home" });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save profile');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
      console.error('Axios error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.addSuppliesView}>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color={"black"} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.addSuppliesText}>Add Supplier</Text>
      </View>

      <View style={styles.linkProductsView}>
        <Image source={require("../Images/ProckuredImage.jpg")} style={styles.linkProductsImage} />
        <TouchableOpacity style={styles.linkProductsTouchableOpacity} onPress={() => navigation.navigate('Link Product')}>
          <Text style={styles.linkProductsText}>Link Products</Text>
        </TouchableOpacity>
      </View>

      {['businessName', 'email', 'pincode', 'state', 'country', 'supplierPhoneNumber'].map((field) => (
        <View key={field} style={styles.inputContainer}>
          <Text style={styles.labelText}>{field.charAt(0).toUpperCase() + field.slice(1)}*</Text>
          <TextInput
            placeholder={`Enter ${field}`}
            placeholderTextColor="black"
            keyboardType={field === 'pincode' ? "numeric" : "default"}
            value={form[field]}
            onChangeText={(value) => handleChange(field, value)}
            style={styles.inputField}
          />
        </View>
      ))}

      <TouchableOpacity onPress={handleSave}>
        <View style={styles.addSupplierButtonView}>
          <Text style={styles.addSupplierButtonText}>Add Supplier</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  addSuppliesView: {
    flexDirection: "row",
    alignItems: "center",
  },
  goBackButton: {
    marginLeft: -20,
  },
  addSuppliesText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10,
  },
  linkProductsView: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  linkProductsImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: 50,
  },
  linkProductsTouchableOpacity: {
    backgroundColor: "green",
    width: "50%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  linkProductsText: {
    color: "white",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 15,
  },
  labelText: {
    fontWeight: "400",
    color: "green",
    fontSize: 16,
    marginBottom: 5,
  },
  inputField: {
    borderColor: "lightgray",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    color: "black",
    fontSize: 16,
  },
  addSupplierButtonView: {
    backgroundColor: "green",
    padding: 15,
    width: "70%",
    borderRadius: 50,
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: width * 0.1
  },
  addSupplierButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
