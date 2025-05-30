import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert} from 'react-native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import {useNavigation, useRoute} from '@react-navigation/native';
import { PlusIcon, PaperAirplaneIcon } from 'react-native-heroicons/outline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function CampaignOverview() {
  const route = useRoute();
  const { campaignData } = route.params;
  const navigation = useNavigation();
  const [gstNumber, setGSTNumber] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [data, setData] = useState({});
  const [completeData, setCompleteData] = useState({
    gstNumber: '', // filled later
    day: campaignData.date,
    month: campaignData.month,
    year: campaignData.year,
    hour: campaignData.timeHour,
    minute: campaignData.timeMinute,
    dayFormat: campaignData.period,
    audienceTag: 'All Restaurant',
    prodName: campaignData.selectedProducts?.[0]?.prodName || '',
    prodCategory: campaignData.selectedProducts?.[0]?.prodCategory || '',
    prodPrice: campaignData.selectedProducts?.[0]?.myPrice?.toString() || '',
    tagLine: campaignData.taglineText,
    live: "false",
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Preview',
      headerStyle: {
        backgroundColor: '#f8f8f8',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
        justifyContent: 'center',
        // color: 'white',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Vendor App", {screen: "Chat"});
          }}
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('supplierPhoneNumber');
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.log('Error Fetching Supplier Phone: ', error);
      }
    };
    fetchPhoneNumber();
  }, []);


  useEffect(() => {
    const fetchGSTNumber = async () => {
      try {
        const storedGSTNumber = await AsyncStorage.getItem('supplierGST');
        if (storedGSTNumber) {
          setGSTNumber(storedGSTNumber);
        }
      } catch (error) {
        console.log('Error Fetching Supplier GST: ', error);
      }
    };
    fetchGSTNumber();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (phoneNumber) {
        try {
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getSupplierDetails/${phoneNumber}`,
          );
          setData(response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (phoneNumber) {
      fetchData();
    }
  }, [phoneNumber]);

  const handleSubmit = async () => {
    if (!gstNumber || !campaignData.selectedProducts || campaignData.selectedProducts.length === 0) {
      Alert.alert('Error', 'Missing GST or Products');
      return;
    }

    const product = campaignData.selectedProducts[0]; // You can loop if needed

    const payload = {
      gstNumber: gstNumber,
      day: campaignData.date,
      month: campaignData.month,
      year: campaignData.year,
      hour: campaignData.timeHour,
      minute: campaignData.timeMinute,
      dayFormat: campaignData.period,
      audienceTag: 'All Restaurant',
      prodName: product?.prodName || '',
      prodCategory: product?.CategoryName || '',
      prodPrice: product?.myPrice?.toString() || '',
      tagLine: campaignData.taglineText,
      live: "true",
    };

    try {
      setCompleteData(payload); // Optional
      const response = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/createCampaign', // Replace with actual API endpoint
        payload
      );
      console.log('Submitted successfully:', response.data);
      Alert.alert('Success', 'Campaign sent successfully!');
      navigation.navigate("Vendor App", {screen: "Chat"});
    } catch (error) {
      console.log('Submission error:', error);
      Alert.alert('Error', 'Something went wrong while sending data.');
    }
  };

  return (
    <View style = {styles.container}>
      {/* Dotted Chat Container */}
      <View style={styles.dottedBox}>
        {/* Cafe Header */}
        <View style={styles.header}>
          <Image
            source={require('../Images/ClientSettingImage.png')} // Replace with your image path
            style={styles.avatar}
          />
          <Text style={styles.cafeName}>{data.BusinessName}</Text>
        </View>

        {/* Product Message Card */}
        <View style={styles.productCard}>
          <View style={{backgroundColor: 'white', borderRadius: 10, padding: 10}}>
            {campaignData.selectedProducts && campaignData.selectedProducts.map((product, index) => (
              <Text key={index} style={styles.productTitle}>
                {product?.prodName ?? "Unnamed"}
              </Text>
            ))}
            <Image
              source={require('../Images/AddProduct.png')} // Replace with actual image path
              style={styles.productImage}
            />
            <Text style={styles.productDescription}>
              {campaignData.taglineText}
            </Text>
          </View>
          <View style={styles.priceRow}>
            {campaignData.selectedProducts && campaignData.selectedProducts.map((product, index) => (
              <Text key={index} style={styles.strikePrice}>
                ₹ {product?.myPrice ?? "Unnamed"}
              </Text>
            ))}
            {campaignData.selectedProducts && campaignData.selectedProducts.map((product, index) => {
              const price = product?.myPrice;
              const finalPrice = price ? price - 0.1 * price : null; // 10% discount calculation

              return (
                <Text key={index} style={styles.finalPrice}>
                  ₹ {finalPrice !== null ? finalPrice.toFixed(2) : "Unnamed"}
                </Text>
              );
            })}
          </View>
        </View>

        {/* Message Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Type a message"
            placeholderTextColor="#bbb"
            style={styles.textInput}
          />
          <TouchableOpacity>
            <PlusIcon size={22} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton}>
            <PaperAirplaneIcon size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handleSubmit}>
        <View style={styles.addSupplierButtonView}>
          <Text style={styles.addSupplierButtonText}>Approve and Send</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  dottedBox: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 12,
    padding: 12,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#ECF0F1'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 15,
    marginRight: 8,
  },
  cafeName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#222',
  },
  productCard: {
    backgroundColor: '#76B117',
    borderWidth: 4,
    borderColor: '#8BC34A',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10,
    marginBottom: 12,
    width: '60%',
    alignSelf: 'flex-end'
  },
  productTitle: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  productImage: {
    width: 160,
    height: 160,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strikePrice: {
    textDecorationLine: 'line-through',
    color: 'lightgray',
    marginRight: 8,
    fontSize: 13,
    fontWeight: '400',
    FontFamily: 'OpenSans'
  },
  finalPrice: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputRow: {
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 20
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
    marginLeft: 6,
  },
  addSupplierButtonView: {
    backgroundColor: '#76B117',
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
    width: '90%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  addSupplierButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
