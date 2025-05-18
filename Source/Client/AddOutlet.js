import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ValidatedInput from '../components/Inputs/ValidatedInput';

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
    country: '',
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

  const handleChange = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const validateRequired = value => value && value.trim().length > 0;

  const handleSave = async () => {
    const {name, address, city, billingAddress, GST, state, country} = form;

    if (
      !validateRequired(name) ||
      !validateRequired(address) ||
      !validateRequired(city) ||
      !validateRequired(billingAddress) ||
      !validateRequired(GST) ||
      !validateRequired(state) ||
      !validateRequired(country)
    ) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    const outletId = Math.floor(Math.random() * 100000);
    const url = `https://api-v7quhc5aza-uc.a.run.app/addOutlet/${outletId}/${phoneNumber}/${name}/${address}/${billingAddress}/${city}/${state}/${country}`;

    try {
      const response = await axios.get(url, {
        headers: {'Content-Type': 'application/json'},
      });

      if (response.status === 200 || response.status === 201) {
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
      <View style={styles.outletView}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={25} color={'black'} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.outletText}>Add New Outlet</Text>
      </View>

      <ValidatedInput
        label="Name"
        placeholder="Enter name"
        value={form.name}
        onChangeText={value => handleChange('name', value)}
        validationFunc={validateRequired}
        errorMessage="Name is required"
      />
      <ValidatedInput
        label="Address"
        placeholder="Enter address"
        value={form.address}
        onChangeText={value => handleChange('address', value)}
        validationFunc={validateRequired}
        errorMessage="Address is required"
      />
      <ValidatedInput
        label="City"
        placeholder="Enter city"
        value={form.city}
        onChangeText={value => handleChange('city', value)}
        validationFunc={validateRequired}
        errorMessage="City is required"
      />
      <ValidatedInput
        label="Billing Address"
        placeholder="Enter billing address"
        value={form.billingAddress}
        onChangeText={value => handleChange('billingAddress', value)}
        validationFunc={validateRequired}
        errorMessage="Billing address is required"
      />
      <ValidatedInput
        label="GST"
        placeholder="Enter GST number"
        keyboardType="numeric"
        value={form.GST}
        onChangeText={value => handleChange('GST', value)}
        validationFunc={validateRequired}
        errorMessage="GST number is required"
      />
      <ValidatedInput
        label="State"
        placeholder="Enter state"
        value={form.state}
        onChangeText={value => handleChange('state', value)}
        validationFunc={validateRequired}
        errorMessage="State is required"
      />
      <ValidatedInput
        label="Country"
        placeholder="Enter country"
        value={form.country}
        onChangeText={value => handleChange('country', value)}
        validationFunc={validateRequired}
        errorMessage="Country is required"
      />

      <View style={styles.buttonsView}>
        <TouchableOpacity style={styles.cancelTouchableOpacity}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveTouchableOpacity}
          onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
  },
  outletView: {
    flexDirection: 'row',
    padding: 10,
    height: 80,
    alignItems: 'center',
  },
  outletText: {
    marginLeft: 10,
    color: '#0F1828',
    fontSize: 22,
    fontWeight: 'bold',
  },
  buttonsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    marginBottom: 20,
  },
  cancelTouchableOpacity: {
    width: 150,
    height: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: -10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#76B117',
  },
  cancelText: {
    color: '#76B117',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  saveTouchableOpacity: {
    width: 150,
    height: 40,
    backgroundColor: '#76B117',
    alignItems: 'center',
    marginRight: 20,
    marginTop: -10,
    borderRadius: 10,
  },
  saveText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
});
