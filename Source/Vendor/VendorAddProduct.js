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
import { categories } from '../Constant/constant'; // Assuming this path is correct

const { width: screenWidth } = Dimensions.get('window');

// Define your product units with both a display name and a value
const productUnits = [
  {name: 'kg', value: 'kg'},
  {name: 'grams', value: 'grams'},
  {name: 'pounds', value: 'pounds'},
  {name: 'liters', value: 'liters'},
  {name: 'ml', value: 'ml'},
  {name: 'Pcs', value: 'Pcs'}, // Pieces
  {name: 'dozen', value: 'dozen'},
];

const VendorAddProduct = () => {
  const navigation = useNavigation();

  // State to hold form data, now with 'unitQuantity' and 'productUnit' separate
  const [formData, setFormData] = useState({
    productName: "",
    unitQuantity: "", // For the numerical part (e.g., "2")
    productUnit: "",  // For the unit type (e.g., "liters")
    productPrice: "",
    productCategory: "",
  });

  const [gstNumber, setGSTNumber] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);

  // State for displaying the selected category and unit in buttons
  const [selectedCategory, setSelectedCategory] = useState({
    categoryImage: '',
    categoryName: '',
  });
  const [selectedProductUnit, setSelectedProductUnit] = useState({
    name: '', // Display name for the unit (e.g., "liters")
    value: '', // Value to be used in payload (e.g., "liters")
  });

  // Fetch supplier GST number on component mount
  useEffect(() => {
    fetchSupplierId();
  }, []);

  const fetchSupplierId = async () => {
    try {
      const storedGSTNumber = await AsyncStorage.getItem('supplierGST');
      if (storedGSTNumber) {
        setGSTNumber(storedGSTNumber);
      }
    } catch (error) {
      console.log('Error Fetching GST ID: ', error);
      Alert.alert('Error', 'Failed to fetch GST number. Please log in again.');
    }
  };

  // Handler for selecting a product category from the modal
  const handleSelectCategory = category => {
    setSelectedCategory({
      categoryImage: category.image,
      categoryName: category.name,
    });
    // Update formData with the selected category name
    setFormData(prevFormData => ({
      ...prevFormData,
      productCategory: category.name,
    }));
    setCategoryModalVisible(false); // Close the modal
  };

  // Renderer for each category item in the modal FlatList
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

  // Handler for selecting a product unit from the modal
  const handleSelectUnit = unit => {
    setSelectedProductUnit(unit); // Set the selected unit object for display
    // Update formData with the selected unit's 'value' (e.g., "kg", "liters")
    setFormData(prevFormData => ({
      ...prevFormData,
      productUnit: unit.value,
    }));
    setUnitModalVisible(false); // Close the modal
  };

  // Renderer for each unit item in the modal FlatList
  const renderUnitItemModal = ({item}) => (
    <TouchableOpacity
      style={styles.unitItemModal}
      onPress={() => handleSelectUnit(item)}
    >
        <Text style={styles.unitTextModal}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Handler for saving the product
  const handleSave = async () => {
    // Generate a simple product ID (you might want a more robust solution for production)
    const productId = Math.floor(Math.random() * 10000000);
    const GSTNumber = gstNumber;

    // Destructure all necessary fields from formData
    const { productName, unitQuantity, productUnit, productPrice, productCategory } = formData;

    // Basic validation: ensure all required fields are filled
    if (!GSTNumber || !productName || !unitQuantity || !productUnit || !productPrice || !productCategory) {
      Alert.alert('Error', 'All fields marked with * are required!');
      return;
    }

    // Combine the numerical quantity and the unit type into the desired string format
    const combinedProductUnit = `${unitQuantity} ${productUnit}`;

    // Construct the payload for the API call
    const payload = {
      gstNumber: GSTNumber,
      productId: productId,
      prodName: productName,
      prodUnit: combinedProductUnit, // This will be "2 liters", "5 kg", etc.
      myPrice: productPrice,
      CategoryName: productCategory,
    };

    try {
      // Make the API call to add the product
      const response = await axios.post('https://api-v7quhc5aza-uc.a.run.app/supplierAddProductManually', payload);

      // Handle successful response
      if (response.status === 200) {
        Alert.alert('Success', 'Product added successfully!');
        // Optionally, reset the form fields after successful submission
        setFormData({
          productName: "",
          unitQuantity: "",
          productUnit: "",
          productPrice: "",
          productCategory: "",
        });
        setSelectedCategory({ categoryImage: '', categoryName: '' });
        setSelectedProductUnit({ name: '', value: '' });
        // Navigate to the 'Chat' screen within 'Vendor App' stack
        navigation.navigate('Vendor App', { screen: "Chat" });
      } else {
        // Handle API errors (e.g., bad request, server error)
        Alert.alert('Error', 'Failed to add product: ' + (response.data?.message || 'Unknown error.'));
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error adding product:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to add product. ${error.response?.data?.message || 'Please try again.'}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color = "black" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Name and Image */}
        <View style={styles.inputContainerView}>
          <View style={{ flexDirection: "column", flex: 1 }}> {/* Added flex:1 for better spacing */}
            <Text style={styles.inputLabel}>Product Name*</Text>
            <TextInput
              value={formData.productName}
              onChangeText={(text) => setFormData({ ...formData, productName: text })}
              keyboardType={"default"}
              placeholder={"Enter the Product Name"}
              placeholderTextColor={"#666"} 
              style={styles.fullWidthInput} 
            />
          </View>
          <Image source={{uri: 'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fvegetables.png?alt=media&token=53260745-7f43-45aa-8bd4-585fb38ed1f7'}} style={styles.productImage} />
        </View>

        {/* Unit Quantity, Unit Type, and Price in a row */}
        <View style={styles.row}>
          {/* Unit Quantity and Type Selection */}
          <View style = {styles.unitSelectionRow}> {/* Inner container for quantity and type */}
              <View style={styles.inputContainerHalf}> {/* Half width for quantity */}
                <Text style={styles.inputLabel}>Unit Quantity*</Text>
                <TextInput
                  value={formData.unitQuantity}
                  onChangeText={(text) => setFormData({ ...formData, unitQuantity: text })}
                  keyboardType={"numeric"}
                  placeholder={"e.g., 2"}
                  placeholderTextColor={"#666"}
                  style={styles.halfWidthInput}
                />
              </View>
              <View style={styles.inputContainerHalf}> {/* Half width for unit type button */}
                  {/* Empty label for alignment with quantity input */}
                  <Text style={styles.inputLabel}></Text>
                  <TouchableOpacity
                    style={styles.selectButtonHalf}
                    onPress={() => setUnitModalVisible(true)}
                  >
                    <Text style={styles.selectButtonText}>
                      {selectedProductUnit.name || 'Unit'}
                    </Text>
                  </TouchableOpacity>
              </View>
          </View>

          {/* My Price input */}
          <View style={styles.inputContainerPrice}>
            <Text style={styles.inputLabel}>My Price*</Text>
            <TextInput
              value={formData.productPrice}
              onChangeText={(text) => setFormData({ ...formData, productPrice: text })}
              keyboardType={"numeric"}
              placeholder={"Price"}
              placeholderTextColor={"#666"}
              style={styles.priceInput}
            />
          </View>
        </View>

        {/* Unit Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={unitModalVisible}
          onRequestClose={() => setUnitModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.unitModalContent}>
              <FlatList
                data={productUnits}
                keyExtractor={item => item.value}
                renderItem={renderUnitItemModal}
                contentContainerStyle={styles.flatListContent}
              />
            </View>
          </View>
        </Modal>


        {/* Link to Category */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Link to Category*</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setCategoryModalVisible(true)}
          >
              <Text style={styles.selectButtonText}>
                {selectedCategory.categoryName || 'Select Category*'}
              </Text>
          </TouchableOpacity>
        </View>

        {/* Category Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={categoryModalVisible}
          onRequestClose={() => setCategoryModalVisible(false)}
        >
            <View style={styles.modalBackdrop}>
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

        {/* Add Product Button */}
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
    justifyContent: "space-between",
    alignItems: 'flex-end', // Align items to the bottom
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%', // Default full width for single input rows
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 5,
    color: "#76B117",
    fontWeight: "500",
    // fontFamily: "Montserrat", // Uncomment if you have this font loaded
    lineHeight: 15,
  },
  fullWidthInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    color: "black",
    width: '100%',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10, // Adjust border radius for consistency
    marginLeft: 15, // Add some margin to separate from text input
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'flex-end', // Align inputs bottoms
  },
  unitSelectionRow: {
    flexDirection: 'row',
    flex: 0.6, // Takes up 60% of the row space
    marginRight: 10, // Space between unit selection and price
  },
  inputContainerHalf: {
    width: '45%', // Approx half of its parent (unitSelectionRow)
    marginLeft: 3
  },
  halfWidthInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    color: "black",
    width: '100%',
  },
  selectButtonHalf: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  inputContainerPrice: {
    flex: 0.4, // Takes up 40% of the row space
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    color: "black",
    width: '100%',
  },
  selectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '100%',
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
    marginTop: 20,
  },
  addProductButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modals common styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    alignItems: 'center', // Center items in FlatList
  },

  // Category Modal Specific Styles
  categoryModalContent: {
    width: screenWidth * 0.85, // Adjusted width
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20, // Adjusted padding
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxHeight: screenWidth * 1.2, // Limit max height
  },
  categoryItemModal: {
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: screenWidth * 0.25, // Responsive height
    width: (screenWidth * 0.85 - 40) / 3, // Calculated width for 3 columns with padding
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginBottom: 5, // Space between image and text
  },
  categoryText: {
    fontSize: 12, // Smaller font for category names
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },

  // Unit Modal Specific Styles
  unitModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: screenWidth * 0.7,
    maxHeight: screenWidth * 0.8,
    alignItems: 'center',
  },
  unitItemModal: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
    alignItems: 'center',
  },
  unitTextModal: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },

  // Removed unused styles to keep the code cleaner
  // modalBackdrop1, inputLabel1, selectButton1, selectButtonText1, modalContent,
  // addSupplierModalContent, modalItem, modalImage, modalText, addSupplierButton,
  // addSupplierButtonText, categoryItem
});

export default VendorAddProduct;