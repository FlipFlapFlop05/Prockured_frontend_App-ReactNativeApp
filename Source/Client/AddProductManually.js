import React, {useEffect, useState} from 'react';
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
  Alert, FlatList
} from 'react-native';
import {useNavigation, useRoute} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width: screenWidth } = Dimensions.get('window');

const AddProductManually = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    productName: "",
    productUnit: "",
    productHSN: "",
    productGST: "",
    productPrice: "",
    productSKU: "",
    productCategory: "",
  })
  const [clientId, setClientId] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState({
    supplierId: '',
    supplierName: ''
  });
  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    fetchClientId();
  }, []);

  useEffect(() => {
    if(clientId){
      fetchSuppliers();
    }
  }, [clientId]);

  const fetchClientId = async () => {
    try{
      const storedId = await AsyncStorage.getItem('userId');
      if(storedId){
        setClientId(storedId);
      }
      else{}
    }
    catch(error){
      console.log('Error Fetching Client ID: ', error);
    }
  }



  const fetchSuppliers = async () => {
    if(clientId){
      axios
        .get(`https://api-v7quhc5aza-uc.a.run.app/getSupplier/${clientId}`)
        .then(response => {
          const dataArray = Object.values(response.data);
          setSuppliers(dataArray);
          console.log(dataArray)
        })
        .catch(error => console.log(error));
    }
  };




  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setModalVisible(false);
  }
  const handleSave = async () => {
    const productId = Math.floor(Math.random() * 10000000);
    const id = clientId;
    const {productName, productUnit, productHSN, productGST, productCategory, productPrice, productSKU} = formData;

    if(!id || !businessName || !email || !pincode || !state || !country) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    if(!validateEmail(email)){
      Alert.alert('Error', 'Please enter a valid email address!');
      return;
    }

    if(pincode.length !== 6 || isNaN(pincode)){
      Alert.alert('Error', 'Please enter a valid 6 digit pincode')
    }

    const url = `https://api-v7quhc5aza-uc.a.run.app/addProductManually/${clientId}/${productId}/${productName}/${productUnit}/${productHSN}/${productGST}/${productPrice}/${productSKU}/${productCategory}/${selectedSupplier.supplierId}/${selectedSupplier.supplierName}`;
    console.log("this is the url "+url);

    try{
      const response = await axios.get(url, {
        headers: {'Content-Type': 'application/json'}
      })
      if (response.data === 'Ok' || response.status === 200) {
        Alert.alert('Success', 'Profile saved successfully!');
        navigation.navigate("Main", { screen: "Home Page" });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save profile');
      }
    } catch(error){
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
      console.error('Axios error:', error);
    }

  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Product</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputContainerView}>
          <View style = {{flexDirection: "column"}}>
            <Text style={styles.inputLabel}>Product Name*</Text>
            <TextInput
              keyboardType={"default"}
              placeholder={"Enter the Product Name"}
              style={{borderColor: "gray", borderWidth: 1, width: "130%", borderRadius: 10, color: "black"}}
            />
          </View>
          <Image source={require('../Images/ProckuredImage.jpg')} style={styles.productImage} />
        </View>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Unit</Text>
            <TextInput
              keyboardType={"default"}
              placeholder={"Unit"}
              style={{borderColor: "gray", borderWidth: 1, width: 70, borderRadius: 10, color: "black"}}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>HSN</Text>
            <TextInput
              keyboardType={"default"}
              placeholder={"HSN"}
              style={{borderColor: "gray", borderWidth: 1, width: 100, borderRadius: 10, color: "black"}}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>GST</Text>
            <TextInput
              keyboardType={"default"}
              placeholder={"GST"}
              style={{borderColor: "gray", borderWidth: 1, width: 70, borderRadius: 10, color: "black"}}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>My Price</Text>
            <TextInput
              keyboardType={"default"}
              placeholder={"Price"}
              style={{borderColor: "gray", borderWidth: 1, width: 100, borderRadius: 10, color: "black"}}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>SKU's</Text>
            <TextInput
              keyboardType={"default"}
              placeholder={"SKU's"}
              style={{borderColor: "gray", borderWidth: 1, width: 100, borderRadius: 10, color: "black"}}
            />
          </View>
        </View>


        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Link to Category</Text>
          <TextInput
            keyboardType={"default"}
            placeholder={"Enter the Category"}
            style = {{borderColor: "gray", borderWidth: 1, width: "100%", borderRadius: 10, color: "black"}}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Link to Supplier *</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.selectButtonText}>
              {selectedSupplier ? selectedSupplier.businessName : "Select Supplier"}
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
          {
            suppliers !== 0 ? (
              <View style={styles.modalBackdrop}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={suppliers}
                    keyExtractor={(item) => item.supplierId.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectSupplier(item)}>
                        <Image
                          source={require("../Images/ProckuredImage.jpg")}
                          style = {{width: 50, height: 50, borderRadius: 10}}
                        />
                        <Text style = {{alignItems: "center", alignSelf: "center", fontWeight: "bold", fontStyle: "normal", marginLeft: 5}}>{item.businessName}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            ):(
              <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center', backgroundColor: "green", alignSelf: 'center', width: "90%", borderRadius: 20}} onPress={() => navigation.navigate("Add Supplier")}>
                <Text style = {{color: "white"}}>
                  Add Supplier
                </Text>
              </TouchableOpacity>
            )
          }
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
  header: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    marginTop: 30
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderRadius: 5,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    flex: 1, // Make dropdowns take equal width
    marginRight: 5,
  },
  dropdownButtonText: {
    color: '#333',
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
  productImage: {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 5,
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  uploadButtonText: {
    flex: 1,
    color: 'blue',
    fontSize: 16,
  },
  uploadIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
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
});

export default AddProductManually;
