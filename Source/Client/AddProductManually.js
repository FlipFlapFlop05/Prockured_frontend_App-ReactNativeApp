import React, {useEffect, useLayoutEffect, useState} from 'react';
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
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import {categories} from '../Constant/constant'; // Assuming 'categories' is defined here
import ValidatedInput from '../components/Inputs/ValidatedInput';
// import Config from 'react-native-config'; // Not used in the provided snippet, so keeping it commented

const {width: screenWidth, height} = Dimensions.get('window');

// Define your available units
const productUnits = [
  {name: 'kg', value: 'kg'},
  {name: 'grams', value: 'grams'},
  {name: 'pounds', value: 'pounds'},
  {name: 'liters', value: 'liters'},
  {name: 'ml', value: 'ml'},
  {name: 'Pcs', value: 'Pcs'}, // Pieces
  {name: 'dozen', value: 'dozen'},
];

const AddProductManually = () => {
  const navigation = useNavigation();
  const [clientPhoneNumber, setClientPhoneNumber] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState({
    supplierId: '',
    supplierName: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false); // New state for unit modal
  const [selectedCategory, setSelectedCategory] = useState({
    categoryImage: '',
    categoryName: '',
  });

  const [selectedProductUnit, setSelectedProductUnit] = useState({ // New state for selected unit
    name: '',
    value: '',
  });

  const [formData, setFormData] = useState({
    productName: '',
    productQuantity: '', // Changed from productUnit to productQuantity for clarity
    productPrice: '',
    productCategory: '',
  });

  useEffect(() => {
    fetchPhoneNumber();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Add Product',
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
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (clientPhoneNumber) {
      fetchSuppliers();
    }
  }, [clientPhoneNumber]);

  // Add this useEffect to sync formData with selectedCategory
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      productCategory: selectedCategory.categoryName,
    }));
  }, [selectedCategory]);

  // New useEffect to sync formData with selectedProductUnit
  useEffect(() => {
    // The actual unit type will now be stored in selectedProductUnit.value,
    // so we don't need to put it into formData for quantity itself.
    // If you had a field like 'unitType' in formData, you'd update it here.
  }, [selectedProductUnit]);


  const fetchPhoneNumber = async () => {
    try {
      const storedPhoneNumber = await AsyncStorage.getItem('clientGST');
      if (storedPhoneNumber) {
        setClientPhoneNumber(storedPhoneNumber);
      }
    } catch (error) {
      console.log('Error Fetching Client ID: ', error);
    }
  };

  const fetchSuppliers = async () => {
    if (clientPhoneNumber) {
      axios
        .get(
          `https://api-v7quhc5aza-uc.a.run.app/getSupplier/${clientPhoneNumber}`,
        )
        .then(response => {
          const dataArray = Object.values(response.data);
          setSuppliers(dataArray);
        })
        .catch(error => console.log(error));
    }
  };

  const handleSelectSupplier = supplier => {
    setSelectedSupplier({
      supplierId: supplier.phone,
      supplierName: supplier.businessName,
    });
    setModalVisible(false);
  };

  const handleSelectCategory = category => {
    setSelectedCategory({
      categoryImage: category.image,
      categoryName: category.name,
    });
    setCategoryModalVisible(false);
  };

  const handleSelectUnit = unit => { // New handler for unit selection
    setSelectedProductUnit(unit);
    setUnitModalVisible(false);
  };

  const renderCategoryItemModal = ({item}) => (
    <TouchableOpacity
      style={styles.categoryItemModal}
      onPress={() => handleSelectCategory(item)}>
      <Image source={{uri: item.image}} style={styles.categoryImage} />
      <Text
        style={styles.categoryText}
        numberOfLines={2}
        ellipsizeMode={'tail'}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderUnitItemModal = ({item}) => ( // New render function for units
    <TouchableOpacity
      style={styles.unitItemModal}
      onPress={() => handleSelectUnit(item)}>
      <Text style={styles.unitTextModal}>{item.name}</Text>
    </TouchableOpacity>
  );

  console.log(formData);
  console.log("Selected Product Unit:", selectedProductUnit); // Log the selected unit

  const handleSave = async () => {
    const productId = Math.floor(Math.random() * 10000000);
    const PhoneNumber = clientPhoneNumber;
    const {productName, productQuantity, productPrice} = formData; // Changed productUnit to productQuantity

    if (
      !PhoneNumber ||
      !productName ||
      !productQuantity ||
      !productPrice ||
      !selectedSupplier.supplierId ||
      !selectedProductUnit.value // Ensure a unit is selected
    ) {
      Alert.alert('Error', 'All fields (Product Name, Quantity, Price, Unit, Category, Supplier) are required!');
      return;
    }

    const payload = {
      clientGST: PhoneNumber,
      productId: productId,
      prodName: productName,
      prodUnit: parseFloat(productQuantity) + ' ' + selectedProductUnit.value, // <--- Send the selected unit here
      myPrice: parseFloat(productPrice), // Ensure price is a number
      CategoryName: selectedCategory.categoryName, // Use selectedCategory.categoryName
      supplierPhone: selectedSupplier.supplierId,
      supplierName: selectedSupplier.supplierName,
    };
    console.log("Payload to API:", payload);

    try {
      const response = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/addProductManually',
        payload,
      );
      console.log("API Response:", response.data); // Log response.data for more info

      navigation.navigate('Main', {screen: 'Home'});
      Alert.alert('Success', 'Product added successfully!');
    } catch (error) {
      console.error("Error adding product:", error.response ? error.response.data : error.message);
      Alert.alert('Error', `Failed to add product: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputContainerView}>
          <View style={{flexDirection: 'column'}}>
            <ValidatedInput
              label={'Product Name'}
              placeholderTextColor="black"
              labelStyle={{color: '#76B117'}}
              value={formData.productName}
              onChangeText={text =>
                setFormData({...formData, productName: text})
              }
              placeholder="Enter the Product Name"
              validationFunc={val => val.trim().length > 0}
              errorMessage="Product name is required"
              inputStyle={{width: '130%'}}
            />
          </View>
          <Image
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fvegetables.png?alt=media&token=53260745-7f43-45aa-8bd4-585fb38ed1f7',
            }}
            style={styles.productImage}
          />
        </View>

        <View style={styles.row}>
        <View style = {styles.row1}>
          <View style={styles.inputContainerHalf}> {/* Use a new style for half width */}
            <ValidatedInput
              label={'Unit'} 
              labelStyle={{color: '#76B117'}}
              placeholderTextColor="black"
              value={formData.productQuantity} // Changed from productUnit to productQuantity
              onChangeText={text =>
                setFormData({...formData, productQuantity: text})
              }
              placeholder="Quantity"
              keyboardType="numeric"
              validationFunc={val => /^\d+(\.\d+)?$/.test(val) && parseFloat(val) > 0} // Ensure positive number
              errorMessage="Enter a valid quantity"
            />
          </View>

          <View style={styles.inputContainerHalf}> {/* Use a new style for half width */}
            <Text style={styles.inputLabel}></Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setUnitModalVisible(true)}>
              <Text style={styles.selectButtonText}>
                {selectedProductUnit.name || 'Unit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
          <View style={styles.inputContainer}>
            <ValidatedInput
              label={'My Price'}
              labelStyle={{color: '#76B117'}}
              placeholderTextColor="black"
              value={formData.productPrice}
              onChangeText={text =>
                setFormData({...formData, productPrice: text})
              }
              placeholder="Price"
              keyboardType="numeric"
              validationFunc={val => /^\d+(\.\d+)?$/.test(val) && parseFloat(val) > 0} // Ensure positive number
              errorMessage="Enter a valid price"
            />
          </View>
        </View>

        

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Link to Category</Text>
          <TouchableOpacity
            style={styles.selectButton1}
            onPress={() => setCategoryModalVisible(true)}>
            <Text style={styles.selectButtonText}>
              {selectedCategory.categoryName || 'Select Category'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Link to Supplier *</Text>
          <TouchableOpacity
            style={styles.selectButton1}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.selectButtonText}>
              {selectedSupplier.supplierName || 'Select Supplier'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addProductButton} onPress={handleSave}>
          <Text style={styles.addProductButtonText}>Add Product</Text>
        </TouchableOpacity>

        {/* Category Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={categoryModalVisible}
          onRequestClose={() => setCategoryModalVisible(false)}>
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

        {/* Unit Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={unitModalVisible}
          onRequestClose={() => setUnitModalVisible(false)}>
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

        {/* Supplier Selection Modal */}
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
                  keyExtractor={item => item.phone} 
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleSelectSupplier(item)}>
                      <Image
                        source={require('../Images/ProckuredImage.jpg')} // Make sure this path is correct
                        style={styles.modalImage}
                      />
                      <Text style={styles.modalText}>{item.businessName}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          ) : (
            <View style={styles.modalBackdrop}>
              <View style={styles.addSupplierModalContent}>
                <Image
                  source={require('../Images/FindAnySupplier.png')} // Make sure this path is correct
                  style={styles.addSupplierImage}
                />
                <TouchableOpacity
                  style={styles.addSupplierButton}
                  onPress={() => navigation.navigate('Add Supplier')}>
                  <Text style={styles.addSupplierButtonText}>Add Supplier</Text>
                </TouchableOpacity>
              </View>
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
    borderRadius: 20,
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
    marginLeft: 10,
  },
  content: {
    padding: 20,
  },
  inputContainerView: {
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 5,
    color: '#76B117',
    fontWeight: '500',
    // fontFamily: 'Montserrat', // Commented out as it might not be a valid font on all devices
    lineHeight: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    color: 'black',
    // width: 100, // Removed this as ValidatedInput handles width
  },
  row: {
    flexDirection: 'row', // Use flex for horizontal arrangement
    justifyContent: 'space-between', // Distribute space evenly between children
    marginBottom: 15,
  },
  row1: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  inputContainerHalf: { // New style for half-width inputs
    width: '35%', 
    marginLeft: 5,
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
    maxHeight: screenWidth * 1.2, // Limit height for long lists
  },
  addSupplierModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    width: screenWidth * 0.8,
    height: screenWidth * 1.0,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically
  },
  modalImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10, // Space between image and text
  },
  modalText: {
    fontWeight: 'bold',
    flex: 1, // Allow text to take remaining space
  },
  selectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
    width: '70%'
  },
  selectButton1: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
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
  addSupplierImage: {
    width: screenWidth * 0.6,
    height: height * 0.3,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    marginBottom: 20,
  },
  categoryItem: {
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
  // New styles for Unit Modal
  unitModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: screenWidth * 0.7,
    maxHeight: screenWidth * 0.8, // Limit height
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
});

export default AddProductManually;