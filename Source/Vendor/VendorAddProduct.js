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
import { categories } from '../Constant/constant';

const { width: screenWidth } = Dimensions.get('window');

const VendorAddProduct = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    productName: "",
    productUnit: "",
    productPrice: "",
    productCategory: "",
  })
  const [gstNumber, setGSTNumber] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
      categoryImage: '',
      categoryName: '',
  });


  useEffect(() => {
    fetchSupplierId();
  }, []);


  const fetchSupplierId = async () => {
    try {
      const storedGSTNumber = await AsyncStorage.getItem('phoneNumber');
      if (storedGSTNumber) {
        setGSTNumber(storedGSTNumber);
      }
    } catch (error) {
      console.log('Error Fetching GST ID: ', error);
    }
  }

  const handleSelectCategory = category => {
    setSelectedCategory({
      categoryImage: category.image,
      categoryName: category.name,
    });
    // Add this line to update formData.productCategory
    setFormData(prevFormData => ({
      ...prevFormData,
      productCategory: category.name,
    }));
    setCategoryModalVisible(false);
  };
  
  const renderCategoryItemModal = ({item}) => (
    <TouchableOpacity
      style={styles.categoryItemModal}
      onPress={() => handleSelectCategory(item)}
    >
      <Image source={{uri: item.image}} style={styles.categoryImage} />
      <Text
        style={styles.categoryText}
        numberOfLines={2}
        ellipsizeMode={'tail'}
    >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const handleSave = async () => {
    const productId = Math.floor(Math.random() * 10000000);
    const GSTNumber = gstNumber;
    const { productName, productUnit, productPrice } = formData;

    if (!GSTNumber || !productName || !productUnit || !productPrice) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }
    const payload = {
      supplierGST: gstNumber,
      productId: productId,
      prodName: productName,
      prodUnit: productUnit,
      myPrice : productPrice,
      CategoryName: productCategory,
    }
    try {
      const response = await axios.post('https://api-v7quhc5aza-uc.a.run.app/supplierAddProductManually',
        payload);
      navigation.navigate('Vendor App', {screen: "Chat"});
      Alert.alert('Success', 'Product added successfully!');
    } catch (error) {
        console.error('Error adding product:', error);
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
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setCategoryModalVisible(true)}
          >
              <Text style={styles.selectButtonText}>
                {selectedCategory.categoryName || 'Select Category'}
              </Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={categoryModalVisible}
          onRequestClose={() => setCategoryModalVisible(false)}
        >
            <View style={styles.categoryModalOverlay}>
              <View style={styles.categoryModalContent}>
                <FlatList
                  data={categories}
                  numColumns={3}
                  renderItem={renderCategoryItemModal}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.flatListContent}
                />
              </View>
            </View>
        </Modal>
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
  },categoryItem: {
    flex: 1,
    margin: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 100,
    width: (screenWidth - 40) / 3,
  },
  categoryItemModal: {
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 100,
    width: (screenWidth - 100) / 3,
  },
  categoryImage: {
    width: 65,
    height: 65,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    flexWrap: 'wrap',
    width: 80,
  },
  categoryModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  categoryModalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default VendorAddProduct;
