import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BasicClientProfile() {
  const navigation = useNavigation();
  const [clientId, setClientId] = useState(null);
  const [form, setForm] = React.useState({
    name: '',
    businessName: '',
    email: '',
    city: '',
    pincode: '',
    state: '',
    country: '',
    gstNumber: '',
    billingAddress: '',
    shippingAddress: ''
  });
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('ClientUserId');
        if (storedId) {
          setClientId(storedId);
        }
      } catch (error) {
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
    const {
      name,
      businessName,
      email,
      pincode,
      state,
      country,
      city,
      gstNumber,
      billingAddress,
      shippingAddress
    } = form;
    const phone = await AsyncStorage.getItem('phoneNumber');
    if (!name || !businessName || !email || !pincode || !state || !country || !city || !gstNumber || !shippingAddress || !billingAddress) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address!');
      return;
    }

    if (pincode.length !== 6 || isNaN(pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode!');
      return;
    }
    navigation.navigate("Main", { screen: "Home" });
    const url = `https://api-v7quhc5aza-uc.a.run.app/createClient/${name}/${businessName}/${email}/${pincode}/${state}/${country}/${gstNumber}/${phone}/${billingAddress}/${shippingAddress}`;

    try {
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Profile saved successfully!');
        navigation.navigate("Main", { screen: "Home" });
        await AsyncStorage.setItem('clientPhoneNumber', phone);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save profile');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
      console.error('Axios error:', error);
    }
  };

  // Get screen dimensions for responsive design
  const { width, height } = Dimensions.get('window');
  const imageSize = width * 0.25; // 25% of the screen width for the image

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
        <View>
          <Text style={{ fontWeight: "bold", fontSize: 34 }}>Create</Text>
          <Text style={{ fontWeight: "bold", fontSize: 34 }}>Profile</Text>
        </View>
        <Image
          source={require("../Images/ProckuredImage.jpg")}
          style={{ width: imageSize, height: imageSize, borderRadius: imageSize / 2 }}
        />
      </View>

      {/* Input Fields */}
      {['name', 'businessName', 'email', 'city', 'pincode', 'state', 'country', 'gstNumber', 'billingAddress', 'shippingAddress'].map((field) => (
        <View key={field} style={{ marginBottom: 15 }}>
          <Text style={{ fontWeight: "400", color: "green", fontSize: 16, marginBottom: 5 }}>
            {field.charAt(0).toUpperCase() + field.slice(1)}*
          </Text>
          <TextInput
            placeholder={`Enter ${field}`}
            placeholderTextColor={"black"}
            keyboardType={field === 'pincode' ? "numeric" : "default"}
            value={form[field]}
            onChangeText={(value) => handleChange(field, value)}
            style={{
              borderColor: "lightgray",
              borderWidth: 1,
              padding: 10,
              borderRadius: 5,
              color: "black",
              fontSize: 16
            }}
          />
        </View>
      ))}

      {/* Save Button */}
      <TouchableOpacity onPress={handleSave}>
        <View style={{
          backgroundColor: "green",
          paddingVertical: 15,
          paddingHorizontal: 30,
          borderRadius: 100,
          alignItems: "center",
          alignSelf: "center",
          justifyContent: "center",
          marginTop: 20,
          width: width * 0.7,
          marginBottom: 40
        }}>
          <Text style={{ color: "white", fontSize: 20 }}>Save Profile</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}
