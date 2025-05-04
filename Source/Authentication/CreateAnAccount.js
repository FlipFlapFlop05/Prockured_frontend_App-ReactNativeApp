import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, Image} from 'react-native';
import tw from 'twrnc';
import {useNavigation} from "@react-navigation/native";
import {EyeIcon, EyeSlashIcon, LockClosedIcon, PhoneIcon} from 'react-native-heroicons/outline';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateAnAccount = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ phoneNumber: '', password: '', confirmPassword: '', passwordVisible: false });
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  };

  const validateInputs = async () => {
    const phoneRegex = /^[0-9]{10}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!phoneRegex.test(formData.phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Phone number must be 10 digits long.');
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long, contain one letter, one number, and one special character.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Confirm password does not match the entered password.');
      return;
    }
    Alert.alert('Success', 'Account created successfully!');
    await AsyncStorage.setItem("password", formData.password);
    await AsyncStorage.setItem("phoneNumber", formData.phoneNumber);
    navigation.navigate('Authentication', {screen: "ChooseMode"});
  };



  return (
    <View style={tw`flex-1 bg-white justify-center px-8`}>
      <Text style={tw`text-3xl font-bold mb-6`}>Create an{"\n"}account!</Text>

      {/* Phone Number Input */}
      <View style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-4`}>
        <PhoneIcon size={18} color="#888" style={tw`mr-2`} />
        <TextInput
          placeholder="Phone Number"
          style={tw`flex-1`}
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={(value) => handleChange('phoneNumber', value)}
          placeholderTextColor={'black'}
        />
      </View>

      {/* Password Input */}
      <View style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-2`}>
        <LockClosedIcon size={18} color="#888" style={tw`mr-2`} />
        <TextInput
          placeholder="Password"
          style={{flex: 1, color: 'black'}}
          secureTextEntry={!formData.passwordVisible}
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          placeholderTextColor={'black'}
        />
        <TouchableOpacity onPress={() => handleChange('passwordVisible', !formData.passwordVisible)}>
          {formData.passwordVisible ? <EyeSlashIcon size={18} color="#888" /> : <EyeIcon size={18} color="#888" />}
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-2`}>
        <LockClosedIcon size={18} color="#888" style={tw`mr-2`} />
        <TextInput
          placeholder="Confirm Password"
          style={{flex: 1, color: 'black'}}
          secureTextEntry={!formData.passwordVisible}
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          placeholderTextColor={'black'}
        />
        <TouchableOpacity onPress={() => handleChange('passwordVisible', !formData.passwordVisible)}>
          {formData.passwordVisible ? <EyeSlashIcon size={18} color="#888" /> : <EyeIcon size={18} color="#888" />}
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={tw`text-red-500 mb-2`}>{passwordError}</Text> : null}

      {/* Sign Up Button */}
      <TouchableOpacity style={tw`bg-green-600 p-4 rounded-lg mt-20`} onPress={validateInputs}>
        <Text style={tw`text-white text-center font-bold`}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={tw`text-center text-gray-500 my-4`}>- Or continue with -</Text>

      {/* Social Logins */}
      <View style={{flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity style={{marginTop: 15}} onPress={() => navigation.navigate('Authentication', {screen: 'GoogleLoadingPage'})}>
          <Image
            source={require('../Images/GoogleImage.png')}
            style = {{width: 45, height: 45}}
          />
        </TouchableOpacity>
        <TouchableOpacity style = {{marginLeft: 20, marginRight: 20}} onPress={() => navigation.navigate('Authentication', {screen: 'AppleLoadingPage'})}>
          <Image
            source={require('../Images/AppleImage.png')}
            style = {{width: 45, height: 52}}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Authentication', {screen: 'FacebookLoadingPage'})}>
          <Image
            source={require('../Images/Facebook.png')}
            style = {{width: 45, height: 45}}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Authentication", {screen: "LogIn"})}>
        <Text style={tw`text-center text-gray-600`}>
          Already have an account <Text style={tw`text-green-600`}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateAnAccount;
