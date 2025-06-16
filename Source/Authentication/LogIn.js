import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LogIn = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ phoneNumber: '', password: '', passwordVisible: false });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async() => {
    const {phoneNumber, password} = formData; // Assuming formData contains phoneNumber
    try {
      const response = await axios.post('https://api-v7quhc5aza-uc.a.run.app/getUserProfile', {
        "number": phoneNumber
      });

      if (response.status === 200 && response.data.success && response.data.data) {
        console.log('API Response Data:', response.data);
        Alert.alert('Success', `API Response: ${JSON.stringify(response.data)}`);

        // Corrected access to type and pgst (GST)
        const userType = response.data.data.type;
        const userGST = response.data.data.pgst; // Assuming 'pgst' is your GST field

        if (userType) {
          if (userType === "client") {
            if (userGST) {
              await AsyncStorage.setItem('clientGST', userGST);
              Alert.alert("Client GST Saved", `GST: ${userGST}`);
            }
            navigation.navigate("Main", {screen: "Home"});
          } else if (userType === "supplier") {
            if (userGST) {
              await AsyncStorage.setItem('supplierGST', userGST);
              Alert.alert("Supplier GST Saved", `GST: ${userGST}`);
            }
            navigation.navigate("Vendor App", {screen: "Chat"});
          } else {
            Alert.alert("Unknown Type", "User profile returned an unrecognized type.");
            navigation.navigate("Authentication", { screen: "CreateAnAccount" });
          }
        } else {
          Alert.alert("User Not Found", "The provided number does not exist or has an incomplete profile. Please create an account.");
          navigation.navigate("Authentication", { screen: "CreateAnAccount" });
        }
      } else {
        console.log('API Response Status:', response.status);
        console.log('API Response Data:', response.data);
        Alert.alert("API Status Issue", `Received status: ${response.status}. Data: ${JSON.stringify(response.data)}`);
        navigation.navigate("Authentication", { screen: "CreateAnAccount" });
      }
    } catch (error) {
      console.error("API Call Error:", error);

      let errorMessage = "An unknown error occurred. Please try again.";

      if (error.response) {
        errorMessage = `Server Error: ${error.response.status}. ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage = "Network Error: No response received from server. Check your internet connection or server status.";
      } else {
        errorMessage = `Request Setup Error: ${error.message}`;
      }

      Alert.alert("Error", errorMessage);
      // You might want to remove or conditionally keep the navigation here based on your app flow.
      // navigation.navigate("Authentication", { screen: "CreateAnAccount" });
    }
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
    Alert.alert('Success', 'Login details are valid!');
    
  }


  const validateInputs = () => {
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome{"\n"}Back!</Text>

      <View style={styles.inputContainer}>
        <PhoneIcon size={18} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Phone Number"
          style={styles.input}
          keyboardType="phone-pad"
          placeholderTextColor="black"
          value={formData.phoneNumber}
          onChangeText={(value) => handleChange('phoneNumber', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <LockClosedIcon size={18} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry={!formData.passwordVisible}
          placeholderTextColor="black"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
        />
        <TouchableOpacity onPress={() => handleChange('passwordVisible', !formData.passwordVisible)}>
          {formData.passwordVisible ? <EyeSlashIcon size={18} color="#888" /> : <EyeIcon size={18} color="#888" />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Authentication', { screen: 'ForgotPassword' })}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>


      <Text style={styles.orText}>- Or continue with -</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Authentication", { screen: "CreateAnAccount" })}>
        <Text style={styles.signupText}>Create An Account <Text style={styles.signupLink}>Sign Up</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "black",
  },
  forgotPassword: {
    color: '#16a34a',
    textAlign: 'right',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#6b7280',
    marginVertical: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  signupText: {
    textAlign: 'center',
    color: '#6b7280',
  },
  signupLink: {
    color: '#16a34a',
  },
});

export default LogIn;
