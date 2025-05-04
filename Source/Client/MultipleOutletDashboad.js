import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView, // Import SafeAreaView
  Dimensions, // Import Dimensions
} from 'react-native';
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width, height } = Dimensions.get('window'); // Get screen width

export default function MultipleOutletDashboard() {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('ClientUserId');
        if (storedId) {
          setClientId(storedId);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };

    const fetchData = async () => {
      if (clientId) {
        try {
          const response = await axios.get(`https://api-v7quhc5aza-uc.a.run.app/getOutlets/${clientId}`);
          setData(Object.values(response.data)); // Direct assignment, no need for dataArray
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchClientId();
    if (clientId) { // Only fetch data if clientId is available
      fetchData();
    }
  }, [clientId]);

  const renderOutletItem = ({ item }) => (
    <View style={styles.outletItem}>
      <Text style={styles.outletName}>{item.OutletName}</Text>
      <Text style={styles.outletAddress}>{item.BillingAddress}</Text>
      <Text style={styles.outletAddress}>{item.Address}</Text>
      <Text style={styles.outletAddress}>
        {item.city} {item.state} {item.country}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}> {/* Wrap with SafeAreaView */}
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={25} color={"black"} strokeWidth={3} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Outlets</Text>
        </View>

        <TouchableOpacity
          style={styles.addOutletButton}
          onPress={() => navigation.navigate("Add Outlet")}
        >
          <Text style={styles.addOutletText}>+ Add New Outlet</Text>
        </TouchableOpacity>

        <Text style={styles.otherOutletsTitle}>Other Outlets</Text>

        <FlatList
          data={data}
          renderItem={renderOutletItem}
          keyExtractor={(item) => item.outletId} // Use outletId as key
          numColumns={1}
          contentContainerStyle={styles.flatListContent} // Add padding to FlatList
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FE', // Set background color on SafeAreaView
  },
  container: {
    flex: 1,
    backgroundColor: 'lightgray', // Set background color on ScrollView
  },
  header: {
    flexDirection: "row",
    padding: 10,
    height: 80,
    alignItems: "center",
  },
  headerTitle: {
    marginLeft: 10,
    color: "#0F1828",
    fontSize: 22,
    fontWeight: "700",
  },
  addOutletButton: {
    flexDirection: "row",
    alignItems: "center",
    height: height * 0.06,
    backgroundColor: "white",
  },
  addOutletText: {
    paddingLeft: width * 0.05,
    color: "#76B117",
    fontSize: 14,
    fontWeight: "700",
  },
  otherOutletsTitle: {
    paddingLeft: 10,
    padding: 20,
    color: "black",
    fontSize: 18,
    fontWeight: "700",
  },
  outletItem: {
    backgroundColor: "white",
    marginBottom: 10,
    padding: 10,
    borderRadius: 5, // Add border radius for visual appeal
  },
  outletName: {
    color: "#2C3E50",
    fontSize: 14,
    fontWeight: "700",
  },
  outletAddress: {
    color: "#2C3E50",
    fontSize: 14,
    fontWeight: "400",
    marginTop: 5, // Add margin top for spacing
  },
  flatListContent: {
    paddingHorizontal: 10, // Add horizontal padding to the FlatList content
    paddingBottom: 20, // Add padding to the bottom
  },
});
