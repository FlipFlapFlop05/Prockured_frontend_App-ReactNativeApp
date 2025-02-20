import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const FacebookLoadingPage = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  useEffect(() => {
    // Simulate data fetching (replace this with actual API call)
     setTimeout(() => {
         setLoading(false);
         navigation.navigate('Basic Client Profile'); // Navigate to Home screen when loading is done
     }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Dots Animation */}
      <ActivityIndicator size="large" color="green" />

      <Text style={styles.text}>Signing In with</Text>

      <MaterialCommunityIcons name="apple" size={40} color="#DB4437" style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  text: {
    color: 'gray',
    marginTop: 80,
    fontSize: 18,
  },
  icon: {
    width: 48,
    height: 48,
    marginTop: 8,
  }
});

export default FacebookLoadingPage;
