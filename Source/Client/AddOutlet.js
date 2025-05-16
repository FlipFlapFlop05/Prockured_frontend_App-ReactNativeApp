import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function AddOutlet() {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [form, setForm] = useState({
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
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };
    fetchPhoneNumber();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    const {
      name,
      address,
      city,
      billingAddress,
      GST,
      state,
      country
    } = form;
    const PhoneNumber = phoneNumber;
    const outletId = Math.floor(Math.random() * 100000);

    if (!name || !address || !city || !billingAddress || !GST || !state || !country) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    const url = `https://api-v7quhc5aza-uc.a.run.app/addOutlet/${outletId}/${PhoneNumber}/${name}/${address}/${billingAddress}/${city}/${state}/${country}`;

    try {
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Outlet Added');
        navigation.navigate('Multiple Outlet Dashboard');
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
        <View key={field} style={styles.inputView}>
          <Text style={styles.inputLabel}>
            {field.charAt(0).toUpperCase() + field.slice(1)}*
          </Text>
          <TextInput
            placeholder={`Enter ${field}`}
            keyboardType={field === 'GST' ? "numeric" : "default"}
            value={form[field]}
            onChangeText={(value) => handleChange(field, value)}
            style={styles.textInput}
            placeholderTextColor="black"
          />
        </View>
      ))}

      <View style={styles.buttonsView}>
        <TouchableOpacity style={styles.cancelTouchableOpacity}>
          <Text style={styles.cancelText}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveTouchableOpacity} onPress={handleSave}>
          <Text style={styles.saveText}>
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
    backgroundColor: "white"
  },
  outletView: {
    flexDirection: "row",
    padding: 10,
    height: 80,
    alignItems: "center"
  },
  outletText: {
    marginLeft: 10,
    color: "#0F1828",
    fontFamily: "Montserrat",
    fontSize: 22,
    fontWeight: "bold",
  },
  inputView: {
    marginBottom: 15,
    paddingLeft: 10
  },
  inputLabel: {
    fontWeight: "bold",
    color: "green",
    fontSize: 18,
    marginBottom: 5
  },
  textInput: {
    borderColor: "lightgray",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    color: 'black'
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
    fontSize: 20,
    fontWeight: "bold",
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
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5
  }
});
