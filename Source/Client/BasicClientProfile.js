import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ValidatedInput from '../components/Inputs/ValidatedInput';
import Config from 'react-native-config';

const {width} = Dimensions.get('window');
const imageSize = width * 0.25;

export default function BasicClientProfile() {
  const navigation = useNavigation();
  const [clientId, setClientId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    city: '',
    pincode: '',
    state: '',
    country: '',
    gstNumber: '',
    billingAddress: '',
    shippingAddress: '',
  });

  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('ClientUserId');
        if (storedId) setClientId(storedId);
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };
    fetchClientId();
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const validateRequired = value => {
    if (!value || value.trim() === '') return 'This field is required';
    return null;
  };

  const validateEmail = value => {
    if (!value) return 'This field is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Invalid email address';
  };

  const validatePincode = value => {
    if (!value) return 'This field is required';
    if (!/^\d{6}$/.test(value)) return 'Pincode must be 6 digits';
    return null;
  };

  const handleSave = async () => {
    const allFields = Object.keys(form);
    const errors = allFields.map(field => {
      const validator =
        field === 'email'
          ? validateEmail
          : field === 'pincode'
          ? validatePincode
          : validateRequired;
      return validator(form[field]);
    });

    const hasErrors = errors.some(err => err !== null);
    if (hasErrors) {
      Alert.alert('Error', 'Please correct the errors before submitting');
      return;
    }

    const phone = await AsyncStorage.getItem('phoneNumber');
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
      shippingAddress,
    } = form;

    const url = `https://api-v7quhc5aza-uc.a.run.app/createClient/${name}/${businessName}/${email}/${pincode}/${state}/${country}/${gstNumber}/${phone}/${billingAddress}/${shippingAddress}`;

    try {
      const response = await axios.get(url, {
        headers: {'Content-Type': 'application/json'},
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Profile saved successfully!');
        await AsyncStorage.setItem('clientPhoneNumber', phone);
        navigation.navigate('Main', {screen: 'Home'});
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
      <View style={styles.profileView}>
        <View>
          <Text style={styles.createText}>Create</Text>
          <Text style={styles.profileText}>Profile</Text>
        </View>
        <Image
          source={require('../Images/ProckuredImage.jpg')}
          style={styles.profileImage}
        />
      </View>

      <ValidatedInput
        label="Name"
        value={form.name}
        onChangeText={v => handleChange('name', v)}
        placeholder="Enter name"
        validationFunc={validateRequired}
        errorMessage="Name is required"
      />
      <ValidatedInput
        label="Business Name"
        value={form.businessName}
        onChangeText={v => handleChange('businessName', v)}
        placeholder="Enter business name"
        validationFunc={validateRequired}
        errorMessage="Business name is required"
      />
      <ValidatedInput
        label="Email"
        value={form.email}
        onChangeText={v => handleChange('email', v)}
        placeholder="Enter email"
        validationFunc={validateEmail}
        errorMessage="Invalid email address"
      />
      <ValidatedInput
        label="City"
        value={form.city}
        onChangeText={v => handleChange('city', v)}
        placeholder="Enter city"
        validationFunc={validateRequired}
        errorMessage="City is required"
      />
      <ValidatedInput
        label="Pincode"
        value={form.pincode}
        onChangeText={v => handleChange('pincode', v)}
        placeholder="Enter pincode"
        keyboardType="numeric"
        validationFunc={validatePincode}
        errorMessage="Pincode must be 6 digits"
      />
      <ValidatedInput
        label="State"
        value={form.state}
        onChangeText={v => handleChange('state', v)}
        placeholder="Enter state"
        validationFunc={validateRequired}
        errorMessage="State is required"
      />
      <ValidatedInput
        label="Country"
        value={form.country}
        onChangeText={v => handleChange('country', v)}
        placeholder="Enter country"
        validationFunc={validateRequired}
        errorMessage="Country is required"
      />
      <ValidatedInput
        label="GST Number"
        value={form.gstNumber}
        onChangeText={v => handleChange('gstNumber', v)}
        placeholder="Enter GST number"
        validationFunc={validateRequired}
        errorMessage="GST number is required"
      />
      <ValidatedInput
        label="Billing Address"
        value={form.billingAddress}
        onChangeText={v => handleChange('billingAddress', v)}
        placeholder="Enter billing address"
        validationFunc={validateRequired}
        errorMessage="Billing address is required"
      />
      <ValidatedInput
        label="Shipping Address"
        value={form.shippingAddress}
        onChangeText={v => handleChange('shippingAddress', v)}
        placeholder="Enter shipping address"
        validationFunc={validateRequired}
        errorMessage="Shipping address is required"
      />

      <TouchableOpacity onPress={handleSave}>
        <View style={styles.saveButtonView}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  profileView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  createText: {fontWeight: 'bold', fontSize: 34},
  profileText: {fontWeight: 'bold', fontSize: 34},
  profileImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
  },
  saveButtonView: {
    backgroundColor: 'green',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 100,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: width * 0.7,
    marginBottom: 40,
  },
  saveButtonText: {color: 'white', fontSize: 20},
});
