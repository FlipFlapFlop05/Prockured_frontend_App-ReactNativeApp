import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';


const CreateAnAccount = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phoneNumber: '', password: '', confirmPassword: '', passwordVisible: false });
  const [passwordError, setPasswordError] = useState('');


  const checkUserId = async() => {
    try{
      const storedId = await AsyncStorage.getItem('userId');
      if(storedId){
        navigation.navigate("Main", {screen: "Home Screen"});
      }
      else{
        setLoading(false);
      }
    }
    catch(error){
      console.log('Error checking User ID: ', error);
      setLoading(false);
    }
  }
  useEffect(() => {
    checkUserId();
  }, []);
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
    const {phoneNumber, password} = formData;
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
    const newUserId = Math.floor(Math.random() * 100000).toString();
    await AsyncStorage.setItem('userId', newUserId);
    await AsyncStorage.setItem('phoneNumber', phoneNumber);
    await AsyncStorage.setItem('password', password);
    navigation.navigate('Authentication', {screen: 'ChooseMode'});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create an{"\n"}account!</Text>

      {/* Phone Number Input */}
      <View style={styles.inputContainer}>
        <Icon name="phone" size={18} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Phone Number"
          style={styles.input}
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={(value) => handleChange('phoneNumber', value)}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={18} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry={!formData.passwordVisible}
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
        />
        <TouchableOpacity onPress={() => handleChange('passwordVisible', !formData.passwordVisible)}>
          <Icon name={formData.passwordVisible ? "eye-slash" : "eye"} size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={18} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          secureTextEntry={!formData.passwordVisible}
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
        />
        <TouchableOpacity onPress={() => handleChange('passwordVisible', !formData.passwordVisible)}>
          <Icon name={formData.passwordVisible ? "eye-slash" : "eye"} size={18} color="#888" />
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpButton} onPress={validateInputs}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>- Or continue with -</Text>

      {/* Social Logins */}
      <View style={styles.socialContainer}>
        <TouchableOpacity>
          <MaterialCommunityIcons name="google" size={40} color="#DB4437" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="apple" size={40} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="facebook" size={40} color="#1877F2" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Authentication", { screen: "LogIn" })}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "black"
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  signUpButton: {
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 10,
    marginTop: 40,
  },
  signUpText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    color: '#6B7280',
    marginVertical: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  loginText: {
    textAlign: 'center',
    color: '#6B7280',
  },
  loginLink: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
});

export default CreateAnAccount;
