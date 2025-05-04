import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {myCatalogueProducts} from '../Constant/constant';
import {suppliersCatalogueProducts} from '../Constant/constant';

const { width: screenWidth } = Dimensions.get('window');

const SpecificVendorOrderNow = () => {
  const [selectedTab, setSelectedTab] = useState('My Catalogue');
  const [cartItems, setCartItems] = useState([]);



  const products = selectedTab === 'My Catalogue' ? myCatalogueProducts : suppliersCatalogueProducts;
  const [selectedUnit, setSelectedUnit] = useState('Kg');

  const handleAddToCart = (product) => {
    const existingItemIndex = cartItems.findIndex(item => item.name === product.name && item.unit === selectedUnit);

    const updatedProduct = products.find(p => p.name === product.name);
    if (updatedProduct) {
      if (existingItemIndex !== -1) {
        const updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity += 1;
        setCartItems(updatedCart);
      } else {
        setCartItems([...cartItems, { ...updatedProduct, quantity: 1, unit: selectedUnit }]);
      }
      updatedProduct.quantity += 1;
    }

  };

  const handleDecrement = (product) => {
    const existingItemIndex = cartItems.findIndex(item => item.name === product.name && item.unit === selectedUnit);
    const updatedProduct = products.find(p => p.name === product.name);

    if (updatedProduct) {
      if (existingItemIndex !== -1) {
        const updatedCart = [...cartItems];
        if (updatedCart[existingItemIndex].quantity > 0) {
          updatedCart[existingItemIndex].quantity -= 1;
          setCartItems(updatedCart);
          if (updatedProduct.quantity > 0) {
            updatedProduct.quantity -= 1;
          }
        }
      }
    }
  };


  const getPrice = (product) => {
    return selectedUnit === 'Kg' ? product.pricePerKg : product.pricePerCarton;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Now</Text>
      </View>

      <View style={styles.vendorInfo}>
        <Image source={require('../Images/VendorProfileImage.png')} style={styles.vendorLogo} />
        <View style={styles.vendorDetails}>
          <Text style={styles.vendorName}>DM Agro Care</Text>
          <Text style={styles.vendorType}>Vendor</Text>
        </View>
        <TouchableOpacity style={styles.addProductsButton}>
          <Text style={styles.addProductsButtonText}>+ Add Products</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'My Catalogue' && styles.activeTabButton]}
          onPress={() => setSelectedTab('My Catalogue')}
        >
          <Text style={[styles.tabButtonText, selectedTab === 'My Catalogue' && styles.activeTabButtonText]}>My Catalogue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Supplier\'s Catalogue' && styles.activeTabButton]}
          onPress={() => setSelectedTab('Supplier\'s Catalogue')}
        >
          <Text style={[styles.tabButtonText, selectedTab === 'Supplier\'s Catalogue' && styles.activeTabButtonText]}>Supplier's Catalogue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.unitSelector}>
        <TouchableOpacity
          style={[styles.unitButton, selectedUnit === 'Kg' && styles.activeUnitButton]}
          onPress={() => setSelectedUnit('Kg')}
        >
          <Text style={[styles.unitButtonText, selectedUnit === 'Kg' && styles.activeUnitButtonText]}>Per Kg</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.unitButton, selectedUnit === 'Carton' && styles.activeUnitButton]}
          onPress={() => setSelectedUnit('Carton')}
        >
          <Text style={[styles.unitButtonText, selectedUnit === 'Carton' && styles.activeUnitButtonText]}>Per 10 kg Carton</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {products.map((product, index) => (
          <View key={index} style={styles.productRow}>
            <Image source={product.image} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productQuantity}>{product.category} {product.quantity}{selectedUnit}</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", marginRight: 20 }}>
              <Text style={styles.productPrice}>₹{getPrice(product)}</Text>
              <Text style={styles.productSave}>Save ₹200</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => handleDecrement(product)}>
                <Text style={{ color: "white" }}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{product.quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={() => handleAddToCart(product)}>
                <Text style={{ color: "white" }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.viewBasketButton}>
        <Text style={styles.viewBasketButtonText}>View Basket</Text>
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
    alignItems: 'center',
    marginTop: 20
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vendorInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  vendorLogo: {
    width: 80,
    height: 80,
    borderRadius: 30,
    marginRight: 10,
  },
  vendorDetails: {
    alignItems: "center"
  },
  vendorName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  vendorType: {
    fontSize: 17,
    color: '#666',
  },
  addProductsButton: {
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 8,
    marginTop: 30
  },
  addProductsButtonText: {
    color: 'white',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabButton: {
    padding: 8,
    marginRight: 10,
  },
  tabButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
  },
  activeTabButtonText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  unitButton: {
    padding: 8,
    marginRight: 10,
  },
  unitButtonText: {
    color: 'gray',
    fontSize: 16,
  },
  content: {
    padding: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: "#4CAF50"
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
  },
  productSave: {
    fontSize: 14,
    color: 'green',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#4CAF50"
  },
  addToCartButton: {
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 8,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 14,
  },
  viewBasketButton: {
    backgroundColor: 'green',
    borderRadius: 8,
    padding: 12,
    margin: 10,
    alignItems: 'center',
  },
  viewBasketButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SpecificVendorOrderNow;
