import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  FlatList, TextInput,
} from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

const { width: screenWidth } = Dimensions.get('window');

const AddProduct = () => {
  const route = useRoute();
  const { category, subcategory, productName, productDesc, productImage } = route.params;
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState({
    supplierId: '',
    supplierName: ''
  });
  const [modalVisible, setModalVisible] = useState(false);

  let prodPrice = "200";
  let prodUnit = "kg";

  useEffect(() => {
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    if (phoneNumber) {
      fetchSuppliers();
    }
  }, [phoneNumber]);

  const fetchPhoneNumber = async () => {
    try {
      const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
      if (storedPhoneNumber) {
        setPhoneNumber(storedPhoneNumber);
      }
    } catch (error) {
      console.log('Error Fetching Phone Number: ', error);
    }
  };

  const fetchSuppliers = async () => {
    if (phoneNumber) {
      axios
        .get(`https://api-v7quhc5aza-uc.a.run.app/getSupplier/${phoneNumber}`)
        .then(response => {
          const dataArray = Object.values(response.data);
          setSuppliers(dataArray);
        })
        .catch(error => {
          Alert.alert("Error", "Failed to fetch suppliers");
        });
    }
  };

  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier({
      supplierId: supplier.supplierId,
      businessName: supplier.businessName
    });
    setModalVisible(false);
  };

  const cleanData = (productName) => {
    if (typeof productName === "string") {
      return productName.replace(/\s+/g, " ").trim().replace(/,+/g, ",");
    } else if (typeof productNAme === "object") {
      return JSON.parse(JSON.stringify(productName, (key, value) =>
        typeof value === "string" ? value.replace(/\s+/g, " ").trim().replace(/,+/g, ",") : value
      ));
    }
    return productName;
  };

  const handleSave = async () => {
    const productId = Math.floor(Math.random() * 10000000);
    const PhoneNumber = phoneNumber;
    const { supplierId, businessName } = selectedSupplier;
    if (!selectedSupplier || !selectedSupplier.supplierId || !selectedSupplier.businessName) {
      Alert.alert('Error', 'Please select a valid supplier!');
      return;
    }
    if (!PhoneNumber || !productName || !prodUnit || !category || !prodPrice) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }


    try {
      const url = `https://api-v7quhc5aza-uc.a.run.app/addProductManually/${PhoneNumber}/${productId}/${productName}/${prodUnit}/${prodPrice}/${category}/${supplierId}/${businessName}`;


      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("API Response:", response);

      if (response.data === 'Ok' || response.status === 200) {
        Alert.alert('Success', 'Product added successfully!');
        navigation.navigate("Main", { screen: "Home" });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add product');
      }
    } catch (error) {
      console.log("Error adding product:", error);
      console.log("API Error Response:", error.response);
      Alert.alert('Error', `Failed to add product: ${error.message}`);
    }
  };

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
            <Text style={styles.inputLabel}>Product Name</Text>
            <Text style={{fontStyle: "normal", fontWeight: "bold", fontSize: 15}}>{productName}</Text>
          </View>
          <Image source={require('../Images/ProckuredImage.jpg')} style={styles.productImage} />
        </View>

        <View style={styles.inputContainerView}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.inputLabel}>Product Description</Text>
            <Text style={{fontStyle: "normal", fontWeight: "bold", fontSize: 15}}>{productDesc}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Unit</Text>
            <Text style={{fontStyle: "normal", fontWeight: "bold", fontSize: 15}}>{prodUnit}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>My Price</Text>
            <Text style={{fontStyle: "normal", fontWeight: "bold", fontSize: 15}}>{prodPrice}</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Sub Category</Text>
          <Text style={{fontStyle: "normal", fontWeight: "bold", fontSize: 15}}>{subcategory}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Category</Text>
          <Text style={{fontStyle: "normal", fontWeight: "bold", fontSize: 15}}>{category}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Link to Supplier *</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.selectButtonText}>
              {selectedSupplier.businessName || "Select Supplier"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addProductButton} onPress={handleSave}>
          <Text style={styles.addProductButtonText}>Add Product</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          {suppliers.length > 0 ? (
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <FlatList
                  data={suppliers}
                  keyExtractor={(item) => item.supplierId.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectSupplier(item)}>
                      <Image
                        source={require("../Images/ProckuredImage.jpg")}
                        style={styles.modalImage}
                      />
                      <Text style={styles.modalText}>{item.businessName}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          ) : (
            <View style = {styles.modalBackdrop}>
              <TouchableOpacity
                style={styles.addSupplierButton}
                onPress={() => navigation.navigate("Add Supplier")}>
                <Text style={styles.addSupplierButtonText}>Add Supplier</Text>
              </TouchableOpacity>
            </View>
          )}
        </Modal>

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
    fontSize: 16,
    marginBottom: 5,
    color: "#76B117",
    fontWeight: "bold"
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    color: "black",
    width: "100%",
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: "center",
    alignSelf: 'center',
    height: 50,
    width: "90%",
  },
  addSupplierButtonText: {
    color: 'white',
  },
});

export default AddProduct;
