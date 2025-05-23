import React, {useEffect, useState, useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import ValidatedInput from '../components/Inputs/ValidatedInput';
import Config from 'react-native-config';

const {width, height} = Dimensions.get('window');

export default function AddSupplier() {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    pincode: '',
    state: '',
    country: '',
    supplierPhoneNumber: '',
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
    };
    fetchPhoneNumber();
  }, []);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Add Supplier',
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
        justifyContent: 'center',
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
  const handleChange = (field, value) => {
    setForm({...form, [field]: value});
  };

  const handleSave = async () => {
    const id = phoneNumber;
    const {businessName, email, pincode, state, country, supplierPhoneNumber} =
      form;

    if (
      !id ||
      !businessName ||
      !email ||
      !pincode ||
      !state ||
      !country ||
      !supplierPhoneNumber
    ) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    const url = `https://api-v7quhc5aza-uc.a.run.app/createSupplier/${supplierPhoneNumber}/${id}/${businessName}/${email}/${pincode}/${state}/${country}`;

    try {
      const response = await axios.get(url, {
        headers: {'Content-Type': 'application/json'},
      });
      if (response.data === 'Ok' || response.status === 200) {
        Alert.alert('Success', 'Profile saved successfully!');
        navigation.navigate('Main', {screen: 'Home'});
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Axios Error:', JSON.stringify(error, null, 2));
      if (error.response) {
        Alert.alert(
          'Error',
          `Server Error: ${error.response.status} - ${error.response.data}`,
        );
      } else if (error.request) {
        Alert.alert('Error', 'No response received from server');
      } else {
        Alert.alert('Error', `Request setup error: ${error.message}`);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}

      <View style={styles.linkProductsView}>
        <Image
          source={require('../Images/ProckuredImage.jpg')}
          style={styles.linkProductsImage}
        />
        <TouchableOpacity
          style={styles.linkProductsTouchableOpacity}
          onPress={() => navigation.navigate('Link Product')}>
          <Text style={styles.linkProductsText}>Link Products</Text>
        </TouchableOpacity>
      </View>

      <ValidatedInput
        label="Business Name"
        placeholder="Enter Business Name"
        value={form.businessName}
        onChangeText={value => handleChange('businessName', value)}
        validationFunc={text => text.trim().length > 0}
        errorMessage="Business Name is required"
      />

      <ValidatedInput
        label="Email"
        placeholder="Enter Email"
        value={form.email}
        keyboardType="email-address"
        onChangeText={value => handleChange('email', value)}
        validationFunc={text => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)}
        errorMessage="Please enter a valid email address"
      />

      <ValidatedInput
        label="Pincode"
        placeholder="Enter Pincode"
        value={form.pincode}
        keyboardType="numeric"
        onChangeText={value => handleChange('pincode', value)}
        validationFunc={text => /^\d{6}$/.test(text)}
        errorMessage="Enter a valid 6-digit pincode"
      />

      <ValidatedInput
        label="State"
        placeholder="Enter State"
        value={form.state}
        onChangeText={value => handleChange('state', value)}
        validationFunc={text => text.trim().length > 0}
        errorMessage="State is required"
      />

      <ValidatedInput
        label="Country"
        placeholder="Enter Country"
        value={form.country}
        onChangeText={value => handleChange('country', value)}
        validationFunc={text => text.trim().length > 0}
        errorMessage="Country is required"
      />

      <ValidatedInput
        label="Supplier Phone Number"
        placeholder="Enter Supplier Phone Number"
        value={form.supplierPhoneNumber}
        keyboardType="phone-pad"
        onChangeText={value => handleChange('supplierPhoneNumber', value)}
        validationFunc={text => /^\d{10}$/.test(text)}
        errorMessage="Enter a valid 10-digit phone number"
      />

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
    padding: 16,
    backgroundColor: '#fff',
  },
  addSuppliesView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goBackButton: {
    marginRight: 10,
  },
  addSuppliesText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  linkProductsView: {
    alignItems: 'center',
    marginBottom: 20,
  },
  linkProductsImage: {
    width: width * 0.9,
    height: 150,
    resizeMode: 'contain',
  },
  linkProductsTouchableOpacity: {
    marginTop: 10,
    backgroundColor: '#76B117',
    padding: 10,
    borderRadius: 8,
  },
  linkProductsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addSupplierButtonView: {
    backgroundColor: '#76B117',
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  addSupplierButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
