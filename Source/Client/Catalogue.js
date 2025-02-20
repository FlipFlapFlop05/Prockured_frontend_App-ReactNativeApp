import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

export default function Catalogue() {
  const navigation = useNavigation();
  const [clientId, setClientId] = useState(null);
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
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
          const response = await axios.get(`https://api-v7quhc5aza-uc.a.run.app/getCatalogue/${clientId}`);
          const dataArray = Object.values(response.data);
          setData(dataArray);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchClientId();
    fetchData();
  }, [clientId]);

  // Group products by category
  const groupedData = data.reduce((acc, item) => {
    const category = item.CategoryName;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Create the categories list for the picker
  const categories = [
    { label: "All", value: "All" },
    ...Object.keys(groupedData).map(category => ({
      label: category,
      value: category
    }))
  ];

  // Filtered data based on selected category
  const filteredData = selectedCategory === "All" ? groupedData : { [selectedCategory]: groupedData[selectedCategory] };

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ justifyContent: "space-between", alignSelf: "center", alignItems: "center", paddingTop: 40 }}>
        <Text style={{ fontWeight: "bold", fontStyle: "normal", fontSize: 22 }}>
          Your Catalog
        </Text>
      </View>

      {data.length !== 0 ? (
        <View style = {{marginTop: 20}}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedCategory(value)}
            items={categories}
            style={pickerSelectStyles}
            placeholder={{ label: "Select a category...", value: "All" }}
          />

          {/* Only display the selected category's data */}
          {selectedCategory === "All" ? (
            // Show all categories and their products
            Object.keys(groupedData).map((category, index) => (
              <FlatList
                key={index}
                data={groupedData[category]}
                keyExtractor={(item) => item.productId}
                renderItem={({ item }) => (
                  <View style={{ padding: 10, justifyContent: "space-between", flexDirection: "row", borderWidth: 1, backgroundColor: "white", marginBottom: 15, width: "95%", marginLeft: 10, borderRadius: 20, marginTop: 20 }}>
                    <View style={{ flexDirection: "column" }}>
                      <View style={{ flexDirection: "row" }}>
                        <Image
                          source={{uri: "https://www.themealdb.com/images/category/beef.png"}}
                          style={{ width: 80, height: 80, borderRadius: 35 }}
                        />
                        <View style={{ flexDirection: "column", marginLeft: 10 }}>
                          <Text style={{ fontStyle: "normal", fontWeight: "bold", color: "black", fontSize: 17 }}>
                            {item.prodName}
                          </Text>
                          <Text style={{ marginTop: 5, fontStyle: "normal", fontWeight: "bold", fontSize: 16 }}>
                            {item.CategoryName}
                          </Text>
                        </View>
                      </View>
                      {item.SupplierName ? (
                        <Text style={{ color: "black", textAlign: "center", fontStyle: "normal", fontWeight: "bold", fontSize: 14, marginTop: 2 }}>
                          {item.SupplierName}
                        </Text>
                      ) : (
                        <TouchableOpacity style={{ backgroundColor: "green", width: 100, borderRadius: 20, height: 25, marginTop: 15 }}>
                          <Text style={{ color: "white", textAlign: "center", fontStyle: "normal", fontWeight: "bold", fontSize: 14, marginTop: 2 }}>
                            Link Product
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={{ flexDirection: "column" }}>
                      <Text>Per KG</Text>
                      <Text style={{ marginTop: 5, marginLeft: 10 }}>{item.myPrice}</Text>
                    </View>
                    <View style={{ flexDirection: "column" }}>
                      <Text>Bulk Price/10Kg</Text>
                      <Text style={{ marginTop: 5, marginLeft: 20 }}>{item.myPrice * 10}</Text>
                    </View>
                  </View>
                )}
              />
            ))
          ) : (
            // Show only the selected category's products
            Object.keys(filteredData).map((category, index) => (
              <FlatList
                key={index}
                data={filteredData[category]}
                keyExtractor={(item) => item.productId}
                renderItem={({ item }) => (
                  <View style={{ padding: 10, justifyContent: "space-between", flexDirection: "row", borderWidth: 1, backgroundColor: "white", marginBottom: 15, width: "95%", marginLeft: 10, borderRadius: 20 }}>
                    <View style={{ flexDirection: "column" }}>
                      <View style={{ flexDirection: "row" }}>
                        <Image
                          source={require("../Images/ProckuredImage.jpg")}
                          style={{ width: 80, height: 80, borderRadius: 35 }}
                        />
                        <View style={{ flexDirection: "column", marginLeft: 10 }}>
                          <Text style={{ fontStyle: "normal", fontWeight: "bold", color: "black", fontSize: 17 }}>
                            {item.prodName}
                          </Text>
                          <Text style={{ marginTop: 5, fontStyle: "normal", fontWeight: "bold", fontSize: 16 }}>
                            {item.CategoryName}
                          </Text>
                        </View>
                      </View>
                      {item.SupplierName ? (
                        <Text style={{ color: "black", fontStyle: "normal", fontWeight: "bold", fontSize: 14, marginTop: 2, textAlign: "left" }}>
                          {item.SupplierName}
                        </Text>
                      ) : (
                        <TouchableOpacity style={{ backgroundColor: "green", width: 100, borderRadius: 20, height: 25, marginTop: 15 }}>
                          <Text style={{ color: "white", textAlign: "center", fontStyle: "normal", fontWeight: "bold", fontSize: 14, marginTop: 2 }}>
                            Link Product
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={{ flexDirection: "column" }}>
                      <Text>Per KG</Text>
                      <Text style={{ marginTop: 5, marginLeft: 10 }}>{item.myPrice}</Text>
                    </View>
                    <View style={{ flexDirection: "column" }}>
                      <Text>Bulk Price/10Kg</Text>
                      <Text style={{ marginTop: 5, marginLeft: 20 }}>NaN</Text>
                    </View>
                  </View>
                )}
              />
            ))
          )}
        </View>
      ) : (
        <View>
          <Image
            source={{ uri: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg" }}
            style={{ width: 320, height: 320, alignSelf: "center", justifyContent: "center", alignItems: "center", marginTop: 100, borderRadius: 40 }}
          />
          {/* Add Supplier Button */}
          <TouchableOpacity
            style={{ backgroundColor: "#76B117", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, width: 320, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 30 }}
            onPress={() => navigation.navigate("Add Product Manually")}
          >
            <Text style={{ fontSize: 18, color: "#fff", fontWeight: 700, alignSelf: "center", alignItems: "center", justifyContent: "center", font: "Montserrat" }}>+ Add Product Manually</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "#76B117", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, width: 320, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 30 }}
            onPress={() => navigation.navigate("Main", {screen: "Home Screen"})}
          >
            <Text style={{ fontSize: 18, color: "#fff", fontWeight: 700, alignSelf: "center", alignItems: "center", justifyContent: "center", font: "Montserrat" }}>+ Add Product By Categories</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",  // Green border color
    borderRadius: 8,
    backgroundColor: "#F5F5F5",  // Light grey background
    color: "#333",  // Dark text color
    marginBottom: 10,
    textAlign: "center",  // Center the text
  },
  inputAndroid: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FF5722",  // Orange border for Android
    borderRadius: 8,
    backgroundColor: "white",  // Light yellow background
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
    height: 50
  },
};
