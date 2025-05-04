import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  FlatList
} from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ChevronLeftIcon } from 'react-native-heroicons/outline';


const { width: screenWidth } = Dimensions.get('window');

const VendorAddProduct = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    productName: "",
    productUnit: "",
    productPrice: "",
    productCategory: "",
  })
  const [phoneNumber, setPhoneNumber] = useState(null);


  useEffect(() => {
    fetchSupplierId();
  }, []);


  const fetchSupplierId = async () => {
    try {
      const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
      if (storedPhoneNumber) {
        setPhoneNumber(storedPhoneNumber);
      }
    } catch (error) {
      console.log('Error Fetching Client ID: ', error);
    }
  }

  const handleSave = async () => {
    const productId = Math.floor(Math.random() * 10000000);
    const PhoneNumber = phoneNumber;
    const { productName, productUnit, productCategory, productPrice } = formData;

    if (!PhoneNumber || !productName || !productUnit || !productPrice) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    const url = `https://api-v7quhc5aza-uc.a.run.app/supplierAddProductManually/${PhoneNumber}/${productId}/${productName}/${productUnit}/${productPrice}/${productCategory}`;
    console.log(url);


    try {
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Product added successfully!');
        navigation.navigate('Vendor App', {screen: 'Chat'})
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add product');
        Alert.alert(url);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to save product: ${error.message}`);
      console.error('Axios error:', error);
    }
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color = "black" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputContainerView}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.inputLabel}>Product Name*</Text>
            <TextInput
              value={formData.productName}
              onChangeText={(text) => setFormData({ ...formData, productName: text })}
              keyboardType={"default"}
              placeholder={"Enter the Product Name"}
              placeholderTextColor={"black"}
              style={{borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, color: "black", width: "130%"}}
            />
          </View>
          <Image source={{uri: 'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fvegetables.png?alt=media&token=53260745-7f43-45aa-8bd4-585fb38ed1f7'}} style={styles.productImage} />
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Unit</Text>
            <TextInput
              value={formData.productUnit}
              onChangeText={(text) => setFormData({ ...formData, productUnit: text })}
              keyboardType={"numeric"}
              placeholder={"Unit"}
              placeholderTextColor={"black"}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>My Price</Text>
            <TextInput
              value={formData.productPrice}
              onChangeText={(text) => setFormData({ ...formData, productPrice: text })}
              keyboardType={"numeric"}
              placeholder={"Price"}
              placeholderTextColor={"black"}
              style={styles.input}
            />
          </View>
        </View>


        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Link to Category</Text>
          <TextInput
            value={formData.productCategory}
            onChangeText={(text) => setFormData({ ...formData, productCategory: text })}
            keyboardType={"default"}
            placeholder={"Enter the Category"}
            placeholderTextColor={"black"}
            style={{borderWidth: 1,borderColor: '#ddd',borderRadius: 10,padding: 10, color: "black", width: "99%"}}
          />
        </View>

        <TouchableOpacity style={styles.addProductButton} onPress={handleSave}>
          <Text style={styles.addProductButtonText}>Add Product</Text>
        </TouchableOpacity>


      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 20
  },
  header: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10
  },
  content: {
    padding: 20,
  },
  inputContainerView: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 5,
    color: "#76B117",
    fontWeight: "500",
    fontStyle: "Montserrat",
    lineHeight: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    color: "black",
    width: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    width: screenWidth * 0.8,
  },
  addSupplierModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    width: screenWidth * 0.8,
    height: screenWidth * 1.0,
    justifyContent: 'center'
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: "row"
  },
  modalImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  modalText: {
    fontWeight: "bold",
    marginLeft: 5,
  },
  selectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#76B117',
    fontSize: 16,
  },
  addProductButton: {
    backgroundColor: '#76B117',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addProductButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addSupplierButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  addSupplierButtonText: {
    color: 'white',
  },
});

export default VendorAddProduct;
