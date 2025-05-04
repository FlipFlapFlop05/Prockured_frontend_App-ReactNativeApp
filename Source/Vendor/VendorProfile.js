import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions, Alert,
} from 'react-native';
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width: screenWidth } = Dimensions.get("window");

export default function VendorProfile() {
  const navigation = useNavigation();
  const [data, setData] = useState({});
  const [clientPassword, setClientPassword] = useState("");
  const [clientPhoneNumber, setClientPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const storedPassword = await AsyncStorage.getItem("password");
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const storedShippingAddress = await AsyncStorage.getItem("shippingAddress");
        const storedBillingAddress = await AsyncStorage.getItem("billingAddress");
        const storedGSTNumber = await AsyncStorage.getItem("gstNumber");

        if (storedPassword) {
          setClientPassword(storedPassword);
        }
        if (storedPhoneNumber) {
          setClientPhoneNumber(storedPhoneNumber);
        }
        if (storedShippingAddress) {
          setShippingAddress(storedShippingAddress);
        }
        if (storedBillingAddress) {
          setBillingAddress(storedBillingAddress);
        }
        if (storedGSTNumber) {
          setGstNumber(storedGSTNumber);
        }

        if (storedPhoneNumber) {
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getSupplierDetails/${storedPhoneNumber}`
          );
          setData(response.data);
          setName(response.data.Name);
          setBusinessName(response.data.BusinessName);
          setEmail(response.data.email);
          setPincode(response.data.pincode || "");
          setState(response.data.state || "");
          setCountry(response.data.country || "");
          setBillingAddress(response.data.BillingAddress);
          setGstNumber(response.data.gst || "");
          setShippingAddress(response.data.ShippingAddress || "");
        }
      } catch (error) {
        console.log("Error Fetching Client Data: ", error);
      }
    };

    fetchClientData();
  }, []);


  const handlePassword = async () => {
    try{
      await AsyncStorage.setItem("password", clientPassword);
      Alert.alert('Success', 'Password Changed Successfully');
      navigation.goBack();
    }
    catch (error){
      console.log('Error Updating Profile')
    }
  }
  const handleSave = async () => {
    const userName = name;
    const userEmail = email;
    const userPhoneNumber = clientPhoneNumber;
    const userBusinessName = businessName;
    const userPincode = pincode;
    const userShippingAddress = shippingAddress;
    const userBillingAddress = billingAddress;
    const userGSTNumber = gstNumber;
    const userState = state;
    const userCountry = country;
    try {

      // Update API
      await axios.get(`https://api-v7quhc5aza-uc.a.run.app/supplierSignUp/${userName}/${userBusinessName}/${userEmail}/${userPincode}/${userState}/${userCountry}/${userGSTNumber}/${userPhoneNumber}/${userBillingAddress}/${userShippingAddress}`)

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.log("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeftIcon size={20} color={"black"} strokeWidth={5} />
      </TouchableOpacity>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileImageContainer}>
        <Image
          source={{
            uri: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{data?.Name}</Text>
        <Text style={styles.profileType}>Client</Text>
      </View>


      <Text style={styles.sectionTitle}>Personal Details</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          keyboardType={'default'}
        />
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType={'default'}
        />
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Phone Number</Text>
        <TextInput
          value={clientPhoneNumber}
          onChangeText={setClientPhoneNumber}
          style={styles.input}
          keyboardType={'numeric'}
        />
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Password</Text>
        <TextInput
          placeholder={"Enter Password"}
          value={clientPassword}
          onChangeText={setClientPassword}
          style={styles.input}
          keyboardType={'default'}
        />
      </View>
      <TouchableOpacity style={{ paddingHorizontal: 20 }} onPress = {handlePassword}>
        <Text style={styles.changePassword}>Change Password</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Business Address Details</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Business Name</Text>
        <TextInput
          placeholder={"Enter Business Name"}
          value={businessName}
          onChangeText={setBusinessName}
          style={styles.input}
          keyboardType={'numeric'}
        />
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Pincode</Text>
        <TextInput
          placeholder={"Enter Pincode"}
          value={pincode}
          onChangeText={setPincode}
          style={styles.input}
          keyboardType={'numeric'}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.detailLabel}>Shipping Address</Text>
        <TextInput
          placeholder={"Enter Shipping Address"}
          keyboardType={"default"}
          style={styles.input}
          value={shippingAddress}
          onChangeText={setShippingAddress}
          placeholderTextColor={'black'}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.detailLabel}>Billing Address</Text>
        <TextInput
          placeholder={"Enter Billing Address"}
          keyboardType={"default"}
          style={styles.input}
          value={billingAddress}
          onChangeText={setBillingAddress}
          placeholderTextColor={'black'}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.detailLabel}>GST Number</Text>
        <TextInput
          placeholder={"Enter GST Number"}
          keyboardType={"default"}
          style={styles.input}
          value={gstNumber}
          onChangeText={setGstNumber}
          placeholderTextColor={'black'}
        />
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>State</Text>
        <TextInput
          placeholder={"Enter State"}
          keyboardType={"default"}
          style={styles.input}
          value={state}
          onChangeText={setState}
          placeholderTextColor={'black'}
        />
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>Country</Text>
        <TextInput
          placeholder={"Enter Country"}
          keyboardType={"default"}
          style={styles.input}
          value={country}
          onChangeText={setCountry}
          placeholderTextColor={'black'}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Added background color
  },
  backButton: {
    padding: 20,
    marginLeft: -10, // Adjusted margin
    flexDirection: "row",
  },
  title: {
    alignSelf: "center",
    marginTop: -40, // Adjusted margin
    fontWeight: "bold",
    fontSize: 16,
  },
  profileImageContainer: {
    alignItems: "center",
    paddingTop: 20,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70, // Half of width/height for perfect circle
  },
  profileName: {
    fontWeight: "800",
    color: "black",
    fontSize: 28,
    marginTop: 10,
  },
  profileType: {
    fontWeight: "500",
    color: "black",
    fontSize: 18,
    marginTop: 5,
  },
  manageButton: {
    padding: 20,
    borderColor: "gray",
    borderWidth: 1,
    width: "85%",
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  sectionTitle: {
    padding: 20,
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  detailContainer: {
    paddingHorizontal: 20,  // Consistent horizontal padding
    paddingVertical: 10, // Added vertical padding
  },
  detailLabel: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5, // Space between label and value
  },
  detailValue: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    height: 50,
    padding: 14,
    color: "black",
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  input: {
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    height: 50,
    padding: 14,
    color: "black",
  },
  changePassword: {
    color: "#76B117",
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
    marginRight: 0, // Removed unnecessary margin
  },
  saveButton: {
    width: "85%",
    padding: 14,
    alignSelf: "center",
    backgroundColor: "#76B117",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginTop: 20, // Added margin top
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    width: "85%",
    padding: 14,
    alignSelf: "center",
    backgroundColor: "#E74C3C",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginTop: 10,  // Added margin top
    marginBottom: 20, // Added margin bottom for spacing
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
})
