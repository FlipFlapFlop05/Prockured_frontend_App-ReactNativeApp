import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { MagnifyingGlassIcon, QuestionMarkCircleIcon } from 'react-native-heroicons/outline';
import { BellIcon } from 'react-native-heroicons/solid';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchBar() {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [clientId, setClientId] = useState(null);

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
          const response = await axios.get(`https://api-v7quhc5aza-uc.a.run.app/getSupplier/${clientId}`);
          const dataArray = Object.values(response.data);
          setData(dataArray);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchClientId();
    fetchData();
  }, [clientId]); // Adding clientId to dependencies so it fetches data when clientId changes

  return (
    <View style={{ flex: 1, display: "flex", backgroundColor: 'white' }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10, paddingTop: 40 }}>
        <BellIcon size={30} color={"#a9a9a9"} strokeWidth={2} />
        <QuestionMarkCircleIcon size={30} color={"#a9a9a9"} strokeWidth={2} />
      </View>
      <View style={{ backgroundColor: 'gainsboro', width: "90%", alignSelf: "center", borderRadius: 20, flexDirection: "row", alignItems: "center" }}>
        <MagnifyingGlassIcon size={20} color={'black'} strokeWidth={3} style={{ marginLeft: 20 }} />
        <TextInput placeholder={'Search any Product'} style={{ marginLeft: 10, width: "70%", color: "black" }} />
      </View>

      <View>
        {data.length !== 0 ? (
          <>
            <FlatList
              data={data}
              keyExtractor={(item) => item.supplierId}
              renderItem={({ item }) => (
                <View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20, padding: 20, borderWidth: 2, borderColor: 'lightgray' }}>
                    <View style={{ flexDirection: "row" }}>
                      <Image
                        source={require('../Images/ProckuredImage.jpg')}
                        style={{ width: 80, height: 80, borderRadius: 20 }}
                      />
                      <View style={{ flexDirection: "column", justifyContent: "space-evenly" }}>
                        <Text style={{ color: "black", fontWeight: 'bold', fontSize: 18 }}>
                          {item.businessName}
                        </Text>
                        <Text>{item.email}</Text>
                        <Text>{item.country}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={{ flexDirection: "column", alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "green" }}>+</Text>
                      <Text style={{ color: "green" }}>Send for</Text>
                      <Text style={{ color: "green" }}>Review</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#76B117", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, width: 320, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 30
              }}
              onPress={() => navigation.navigate("Add Supplier")}
            >
              <Text style={{ fontSize: 18, color: "#fff", fontWeight: 700, alignSelf: "center", font: "Montserrat" }}>+ Add Supplier</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <Image
              source={{ uri: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg" }}
              style={{ width: 320, height: 320, alignSelf: "center", justifyContent: "center", alignItems: "center", marginTop: 100, borderRadius: 40 }}
            />
            {/* Add Supplier Button */}
            <TouchableOpacity
              style={{ backgroundColor: "#76B117", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, width: 320, alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 30 }}
              onPress={() => navigation.navigate("Add Supplier")}
            >
              <Text style={{ fontSize: 18, color: "#fff", fontWeight: 700, alignSelf: "center", alignItems: "center", justifyContent: "center", font: "Montserrat" }}>+ Add Supplier</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
