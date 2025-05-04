import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, TextInput, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {ChevronLeftIcon, PencilIcon, PlusIcon} from 'react-native-heroicons/outline';

const { width: screenWidth } = Dimensions.get('window');

const LinkProduct = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('ClientUserId');
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
          setProducts(dataArray);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchClientId();
    fetchData();
  }, [clientId]);

  const handleProductSelect = (product) => {
    if (selectedProducts.includes(product)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== product));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} style={'black'} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Catalog</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={{alignItems: 'center', flexDirection: 'column'}}>
            <PencilIcon size={20} color={'black'} strokeWidth={2} />
            <Text style={styles.headerButton}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Add Product Manually')} style={{alignItems: 'center', flexDirection: 'column'}}>
            <PlusIcon size={20} color={'black'} strokeWidth={2} />
            <Text style={styles.headerButton}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={'black'}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>


        {products.map((product, index) => (
          <View style={{flexDirection: 'column'}}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{product.CategoryName}</Text>
            </View>
            <View key={index} style={styles.productRow}>
              <View style={styles.productDetails}>
                <View style={{ flexDirection: "row", alignItems: 'center' }}>
                  <Image source={require('../Images/AddProduct.png')} style={styles.productImage} />
                  <Text style={styles.productName}>{product.prodName}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.linkButton, selectedProducts.includes(product) && styles.linkButtonSelected]}
                  onPress={() => handleProductSelect(product)}
                >
                  <Text style={styles.linkButtonText}>
                    {selectedProducts.includes(product) ? 'Unlink Product' : 'Link Product'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "column", justifyContent: 'center' }}>
                <Text style={styles.productUnit}>{product.prodUnit}</Text>
                <Text style={styles.productPrice}>₹{product.myPrice}</Text>
              </View>

              <View style={{ flexDirection: "column", justifyContent: 'center' }}>
                <Text style={{ color: "black" }}>
                  Bulk Price/10Kg
                </Text>
                <Text style={styles.productBulkPrice}>{product.myPrice * 100}</Text>
              </View>

            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.linkSelectedButton} onPress={() => navigation.goBack()}>
        <Text style={styles.linkSelectedButtonText}>Link Selected Products</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    color: 'blue',
    fontSize: 16,
    marginLeft: 10,
  },
  searchBar: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    paddingLeft: 15,
    color: 'black'
  },
  content: {
    padding: 20,
  },
  categoryHeader: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between'
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    flexDirection: "column",
    justifyContent: 'center'
  },
  productName: {
    fontSize: 18,
    marginBottom: 5,
  },
  productUnit: {
    fontSize: 14,
    color: '#666',
  },
  productPrice: {
    fontSize: 16,
    marginRight: 10,
  },
  productBulkPrice: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
    alignItems: 'center',
    alignSelf: 'center'
  },
  linkButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: 140,
    alignItems: 'center',
    marginTop: 10,
  },
  linkButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  linkButtonText: {
    color: 'white',
    fontSize: 14,
  },
  linkSelectedButton: {
    backgroundColor: 'green',
    borderRadius: 8,
    paddingVertical: 12,
    margin: 20,
    alignItems: 'center',
  },
  linkSelectedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LinkProduct;
