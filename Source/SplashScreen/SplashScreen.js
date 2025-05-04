import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  const checkUserId = async () => {
    try {
      setLoading(true);
      const storedClientPhoneNumber = await AsyncStorage.getItem('clientPhoneNumber');
      const storedSupplierId = await AsyncStorage.getItem('supplierPhoneNumber');

      if (storedClientPhoneNumber) {
        console.log("Existing User ID Found:", storedClientPhoneNumber);
        setLoading(false);
        navigation.navigate("Main", { screen: "Home" });
      }
      else if(storedSupplierId){
        console.log("Existing User ID Found:", storedSupplierId);
        setLoading(false);
        navigation.navigate("Vendor App", { screen: "Chat" });
      }
      else {
        setLoading(false);
        navigation.navigate("Authentication", { screen: "CreateAnAccount" });
      }
    } catch (error) {
      console.log('Error checking User ID: ', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserId();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../Images/ProckuredImage.jpg')}
        style={styles.logo}
      />
      {loading && <ActivityIndicator size="large" color="green" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  logo: {
    width: 200,
    height: 200,
  },
});
