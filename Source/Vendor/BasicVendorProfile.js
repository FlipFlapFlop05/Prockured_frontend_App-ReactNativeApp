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
import {PencilIcon} from 'react-native-heroicons/outline';

const {width} = Dimensions.get('window');
const imageSize = width * 0.25;

export default function BasicVendorProfile() {
  const navigation = useNavigation();
  const [supplierId, setSupplierId] = useState(null);
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
        const storedId = await AsyncStorage.getItem('SupplierUserId');
        if (storedId) setSupplierId(storedId);
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
    const url = `https://api-v7quhc5aza-uc.a.run.app/supplierSignUp/${name}/${businessName}/${email}/${pincode}/${state}/${country}/${gstNumber}/${phone}/${billingAddress}/${shippingAddress}`;
    try {
      const response = await axios.get(url, {
        headers: {'Content-Type': 'application/json'},
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Profile saved successfully!');
        await AsyncStorage.setItem('supplierPhoneNumber', phone);
        await AsyncStorage.setItem('supplierGST', gstNumber);
        navigation.navigate('Vendor App', {screen: 'Chat'});
        Alert.alert('Success', 'Profile saved successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save profile');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
      console.error('Axios error:', error);
    }
  };

  const isFilled = text => text.trim().length > 0;
  const isValidEmail = text => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  const isValidPincode = text => /^\d{6}$/.test(text);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileView}>
        <View style={{paddingLeft: '5%'}}>
          <Text style={styles.createText}>Create</Text>
          <Text style={styles.profileText}>Profile</Text>
        </View>
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
            }}
            style={styles.profileImage}
          />

          <View style={styles.iconWrapper}>
            <TouchableOpacity style={styles.editIconButton}>
              <PencilIcon fill={'#fff'} size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ValidatedInput
        label="Name"
        value={form.name}
        onChangeText={v => handleChange('name', v)}
        placeholder="Enter name"
        validationFunc={isFilled}
        errorMessage="Name is required"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
      />
      <ValidatedInput
        label="Business Name"
        value={form.businessName}
        onChangeText={v => handleChange('businessName', v)}
        placeholder="Enter business name"
        validationFunc={isFilled}
        errorMessage="Business name is required"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
      />
      <ValidatedInput
        label="Email"
        value={form.email}
        onChangeText={v => handleChange('email', v)}
        placeholder="Enter email"
        validationFunc={isValidEmail}
        errorMessage="Invalid email address"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
      />
      <ValidatedInput
        label="City"
        value={form.city}
        onChangeText={v => handleChange('city', v)}
        placeholder="Enter city"
        validationFunc={isFilled}
        errorMessage="City is required"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
      />
      <ValidatedInput
        label="Pincode"
        value={form.pincode}
        onChangeText={v => handleChange('pincode', v)}
        placeholder="Enter pincode"
        keyboardType="numeric"
        validationFunc={isValidPincode}
        errorMessage="Pincode must be 6 digits"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
      />
      <ValidatedInput
        label="State"
        value={form.state}
        onChangeText={v => handleChange('state', v)}
        placeholder="Enter state"
        validationFunc={isFilled}
        errorMessage="State is required"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
      />
      <ValidatedInput
        label="Country"
        value={form.country}
        onChangeText={v => handleChange('country', v)}
        placeholder="Enter country"
        validationFunc={isFilled}
        errorMessage="Country is required"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
      />
      <ValidatedInput
        label="GST Number"
        value={form.gstNumber}
        onChangeText={v => handleChange('gstNumber', v)}
        placeholder="Enter GST number"
        validationFunc={isFilled}
        errorMessage="GST number is required"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
      />
      <ValidatedInput
        label="Billing Address"
        value={form.billingAddress}
        onChangeText={v => handleChange('billingAddress', v)}
        placeholder="Enter billing address"
        validationFunc={isFilled}
        errorMessage="Billing address is required"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
      />
      <ValidatedInput
        label="Shipping Address"
        value={form.shippingAddress}
        onChangeText={v => handleChange('shippingAddress', v)}
        placeholder="Enter shipping address"
        validationFunc={isFilled}
        errorMessage="Shipping address is required"
        labelStyle={{fontFamily: 'Montserrat', color: '#76B117'}}
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
    marginBottom: '5',
    marginTop: '6%',
  },
  createText: {fontWeight: 'bold', fontSize: 36, fontFamily: 'Montserrat'},
  profileText: {fontWeight: 'bold', fontSize: 36, fontFamily: 'Montserrat'},
  profileImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
  },
  saveButtonView: {
    backgroundColor: '#76B117',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
    marginBottom: 40,
  },
  saveButtonText: {color: 'white', fontSize: 20, fontFamily: 'Montserrat'},
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconWrapper: {
    position: 'absolute',
    top: 80,
    right: 1,
  },

  editIconButton: {
    backgroundColor: '#76B117',
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Optional: for slight shadow on Android
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 1.5,
  },
});
