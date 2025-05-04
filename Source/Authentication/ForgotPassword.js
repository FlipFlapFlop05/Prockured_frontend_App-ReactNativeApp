import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { PhoneIcon } from 'react-native-heroicons/outline';
import { GoogleIcon, AppleIcon, FacebookIcon } from 'react-native-heroicons/solid';
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ phoneNumber: '' });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateInputs = () => {
    const phoneRegex = /^[0-9]{10}$/; // Validates a 10-digit phone number

    if (!phoneRegex.test(formData.phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Phone number must be 10 digits long.');
      return;
    }
    Alert.alert('Success', 'A reset link has been sent to your phone number!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Forgot{"\n"}Password?</Text>

      {/* Phone Number Input */}
      <View style={styles.inputContainer}>
        <PhoneIcon size={24} color="#888" style={styles.icon} />
        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="black"
          style={styles.input}
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={(value) => handleChange('phoneNumber', value)}
        />
      </View>

      <Text style={styles.infoText}>~ We will send you a message to set or reset{"\n"}your new password</Text>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={validateInputs}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>- Or continue with -</Text>

      {/* Social Logins */}
      <View style={styles.socialContainer}>
        <TouchableOpacity>
          <GoogleIcon size={40} color="#DB4437" />
        </TouchableOpacity>
        <TouchableOpacity>
          <AppleIcon size={40} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <FacebookIcon size={40} color="#1877F2" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Authentication", { screen: "CreateAnAccount" })}>
        <Text style={styles.signUpText}>
          Create An Account <Text style={styles.signUpLink}>Sign Up</Text>
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
    paddingHorizontal: width * 0.05,
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
    color: "black",
  },
  infoText: {
    color: '#6B7280',
    textAlign: 'left',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  submitText: {
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
  signUpText: {
    textAlign: 'center',
    color: '#6B7280',
  },
  signUpLink: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
});

export default ForgotPassword;
