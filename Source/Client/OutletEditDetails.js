import React, {useEffect, useLayoutEffect, useState} from 'react';
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
import Config from 'react-native-config';
import {useRoute} from '@react-navigation/native';

export default function OutletEditDetails() {
  const route = useRoute();
  const { outletData } = route.params;
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
  const [sameAsShipping, setSameAsShipping] = useState(false);
  useEffect(() => {
    if(outletData) {
      setForm({
        name: outletData.OutletName || '',
        address: outletData.Address || '',
        city: outletData.city || '',
        billingAddress: outletData.BillingAddress || '',
        GST: outletData.GST || '',
        state: outletData.state || '',
        country: outletData.country || '',
      });
    }
  }, [outletData]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Edit Details',
      headerStyle: {
        backgroundColor: '#f8f9fe',
        elevation: 0,
        shadowColor: 'transparent',
        shadowOffset: {height: 0},
        shadowRadius: 0,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Multiple Outlet Dashboard')}
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={23} strokeWidth={2} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Edit Details',
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
    setForm(prev => {
      const updated = {...prev, [field]: value};
      if (field === 'address' && sameAsShipping) {
        updated.billingAddress = value;
      }
      return updated;
    });
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
      <ValidatedInput
        label="Name"
        placeholder={outletData?.OutletName || 'Enter outlet name'}
        placeholderTextColor="black"
        value={form.name}
        onChangeText={value => handleChange('name', value)}
        validationFunc={validateRequired}
        errorMessage="Name is required"
      />
      <ValidatedInput
        label="Address"
        placeholder={outletData?.Address || 'Enter address'}
        placeholderTextColor="black"
        value={form.address}
        onChangeText={value => handleChange('address', value)}
        validationFunc={validateRequired}
        errorMessage="Address is required"
      />
      <ValidatedInput
        label="City"
        placeholder={outletData?.city || 'Enter city'}
        placeholderTextColor="black"
        value={form.city}
        onChangeText={value => handleChange('city', value)}
        validationFunc={validateRequired}
        errorMessage="City is required"
      />
      <ValidatedInput
        label="Billing Address"
        placeholder={outletData?.BillingAddress || 'Enter billing address'}
        placeholderTextColor="black"
        value={form.billingAddress}
        onChangeText={value => handleChange('billingAddress', value)}
        validationFunc={validateRequired}
        errorMessage="Billing address is required"
      />
      <ValidatedInput
        label="GST"
        placeholder={outletData?.GST || 'Enter GST number'}
        placeholderTextColor="black"
        keyboardType="numeric"
        value={form.GST}
        onChangeText={value => handleChange('GST', value)}
        validationFunc={validateRequired}
        errorMessage="GST number is required"
      />
      <ValidatedInput
        label="State"
        placeholder={outletData?.state || 'Enter state'}
        placeholderTextColor="black"
        value={form.state}
        onChangeText={value => handleChange('state', value)}
        validationFunc={validateRequired}
        errorMessage="State is required"
      />
      <ValidatedInput
        label="Country"
        placeholder={outletData?.country || 'Enter country'}
        placeholderTextColor="black"
        value={form.country}
        onChangeText={value => handleChange('country', value)}
        validationFunc={validateRequired}
        errorMessage="Country is required"
      />
      <View style = {styles.buttonsView}>
        <TouchableOpacity style = {styles.cancelTouchableOpacity} onPress={() => navigation.goBack()}>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fe',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  AddOutletHeader: {
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ECF0F1',
    width: '100%',
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  AddOutletHeaderText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#2C3E50',
    fontFamily: 'Montserrat',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#76B117',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  checkboxTick: {
    width: 12,
    height: 12,
    backgroundColor: '#76B117',
    borderRadius: 2,
  },

  checkboxLabel: {
    fontSize: 14,
    color: '#2C3E50',
    fontFamily: 'Montserrat',
  },
});
