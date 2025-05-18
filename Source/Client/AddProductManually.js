import React, {useEffect, useState} from 'react';
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
import {categories} from '../Constant/constant';
import ValidatedInput from '../components/Inputs/ValidatedInput'; // Make sure this path is correct

const {width: screenWidth, height} = Dimensions.get('window');

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
  const [selectedCategory, setSelectedCategory] = useState({
    categoryImage: '',
    categoryName: '',
  });

  const [formData, setFormData] = useState({
    productName: '',
    productUnit: '',
    productPrice: '',
    productCategory: selectedCategory.categoryName,
  });

  useEffect(() => {
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    if (clientPhoneNumber) {
      fetchSuppliers();
    }
  }, [clientPhoneNumber]);

  const fetchPhoneNumber = async () => {
    try {
      const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
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
      supplierId: supplier.supplierId,
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

  const handleSave = async () => {
    const productId = Math.floor(Math.random() * 10000000);
    const PhoneNumber = clientPhoneNumber;
    const {productName, productUnit, productCategory, productPrice} = formData;

    if (
      !PhoneNumber ||
      !productName ||
      !productUnit ||
      !productPrice ||
      !selectedSupplier.supplierId
    ) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    const url = `https://api-v7quhc5aza-uc.a.run.app/addProductManually/${PhoneNumber}/${productId}/${productName}/${productUnit}/${productPrice}/${selectedCategory.categoryName}/${selectedSupplier.supplierId}/${selectedSupplier.supplierName}`;

    try {
      const response = await axios.get(url, {
        headers: {'Content-Type': 'application/json'},
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Product added successfully!');
        navigation.navigate('Main', {screen: 'Home'});
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add product');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to save product: ${error.message}`);
      console.error('Axios error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color="black" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputContainerView}>
          <View style={{flexDirection: 'column'}}>
            {/* <Text style={styles.inputLabel}>Product Name*</Text> */}
            <ValidatedInput
              label={'Product Name'}
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
          <View style={styles.inputContainer}>
            {/* <Text style={styles.inputLabel}>Unit</Text> */}
            <ValidatedInput
              label={'Unit'}
              labelStyle={{color: '#76B117'}}
              value={formData.productUnit}
              onChangeText={text =>
                setFormData({...formData, productUnit: text})
              }
              placeholder="Unit"
              keyboardType="numeric"
              validationFunc={val => /^\d+(\.\d+)?$/.test(val)}
              errorMessage="Enter a valid unit"
            />
          </View>

          <View style={styles.inputContainer}>
            {/* <Text style={styles.inputLabel}>My Price</Text> */}
            <ValidatedInput
              label={'My Price'}
              labelStyle={{color: '#76B117'}}
              value={formData.productPrice}
              onChangeText={text =>
                setFormData({...formData, productPrice: text})
              }
              placeholder="Price"
              keyboardType="numeric"
              validationFunc={val => /^\d+(\.\d+)?$/.test(val)}
              errorMessage="Enter a valid price"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Link to Category</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setCategoryModalVisible(true)}>
            <Text style={styles.selectButtonText}>
              {selectedCategory.categoryName || 'Select Category'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Link to Supplier *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.selectButtonText}>
              {selectedSupplier.supplierName || 'Select Supplier'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addProductButton} onPress={handleSave}>
          <Text style={styles.addProductButtonText}>Add Product</Text>
        </TouchableOpacity>

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
                  keyExtractor={item => item.supplierId}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleSelectSupplier(item)}>
                      <Image
                        source={require('../Images/ProckuredImage.jpg')}
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
                  source={require('../Images/FindAnySupplier.png')}
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
    fontStyle: 'Montserrat',
    lineHeight: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    color: 'black',
    width: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
    flexDirection: 'row',
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
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
  },
  modalImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  modalText: {
    fontWeight: 'bold',
    marginLeft: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  categoryModalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default AddProductManually;
