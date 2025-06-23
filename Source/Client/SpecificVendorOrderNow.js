import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeftIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
} from 'react-native-heroicons/outline';
import {useNavigation, useRoute} from '@react-navigation/native'; // Import useRoute
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const SpecificVendorOrderNow = () => { // Removed {route} from props, use useRoute hook
  const navigation = useNavigation();
  const route = useRoute(); // Use useRoute hook to get route params

  // Destructure the parameters passed from the previous screen (CustomerChatDetails)
  const {clientGST: clientGstFromChat, vendorGST, customerName} = route.params || {};

  const [selectedTab, setSelectedTab] = useState('supplier');
  const [selectedUnit, setSelectedUnit] = useState('carton');
  const [clientGST, setClientGST] = useState(''); // This will store the current user's (client's) GST
  const [products, setProducts] = useState({my: [], supplier: []});
  const [loading, setLoading] = useState(true); // initial screen loader
  const [tabLoading, setTabLoading] = useState(false); // loader during tab switch

  // This useEffect now takes care of setting the clientGST from AsyncStorage
  // It also correctly prioritizes clientGstFromChat if available (passed from chat screen)
  useEffect(() => {
    const fetchAndSetClientGST = async () => {
      try {
        if (clientGstFromChat) {
          // If clientGST is passed as a route param, use it directly
          setClientGST(clientGstFromChat);
        } else {
          // Otherwise, try to get it from AsyncStorage
          const gst = await AsyncStorage.getItem('clientGST');
          if (gst) {
            setClientGST(gst);
          } else {
            // Handle case where client GST is not found (e.g., alert user, navigate back)
            Alert.alert("Error", "Your Client GST could not be found. Please log in again.");
            setLoading(false); // Stop loading, as we can't proceed
          }
        }
      } catch (error) {
        console.log('Error reading client GST:', error);
        Alert.alert("Error", "Failed to retrieve client GST.");
        setLoading(false);
      }
    };
    fetchAndSetClientGST();
  }, [clientGstFromChat]); // Rerun if clientGstFromChat changes

  const updateCount = (tab, productId, delta) => {
    setProducts(prev => {
      const updated = {...prev};
      updated[tab] = updated[tab].map(product =>
        product.productId === productId
          ? {...product, count: Math.max(0, product.count + delta)}
          : product,
      );
      return updated;
    });
  };

  const renderProduct = ({item}) => (
    <View style={styles.productCard}>
      <Image
        source={
          typeof item.image === 'number'
            ? item.image
            : require('../Images/VendorProfileImage.png')
        }
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.prodName}</Text>
        <Text style={styles.productBrand}>{item.SupplierName}</Text>
        <Text style={styles.productWeight}>Unit: {item.prodUnit}</Text>
      </View>
      <View style={styles.productPricing}>
        <Text style={styles.productPrice}>₹ {item.myPrice}</Text>
      </View>
      <View style={styles.counter}>
        <TouchableOpacity
          onPress={() => updateCount(selectedTab, item.productId, -1)}
          style={styles.counterBtn}>
          <MinusIcon size={15} color="white" />
        </TouchableOpacity>

        <Text style={styles.counterText}>{item.count}</Text>

        <TouchableOpacity
          onPress={() => updateCount(selectedTab, item.productId, 1)}
          style={styles.counterBtn}>
          <PlusIcon size={15} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Fetch catalogue function
  const fetchCatalogue = async selected => {
    let gstToFetch = '';
    let supplierDisplayName = ''; // To pass to products as SupplierName

    if (selected === 'my') {
      gstToFetch = clientGST; // This is the current user's GST
      supplierDisplayName = "My Products"; // Or client's own name/business name
    } else if (selected === 'supplier') {
      gstToFetch = vendorGST; // This is the vendor's GST passed from chat
      supplierDisplayName = customerName; // This is the vendor's display name passed from chat
    }

    if (!gstToFetch) {
      Alert.alert('Missing GST', 'Could not find a valid GST number for the selected catalogue.');
      setLoading(false); // Stop loading if GST is missing
      setTabLoading(false);
      return;
    }

    // Only fetch if products for this tab are not already loaded OR if it's the initial load
    // This prevents re-fetching unnecessarily on tab switch if data is already there.
    if (products[selected].length === 0 || loading) {
        setTabLoading(true); // Show tab-specific loader
    }


    try {
      console.log(`Fetching catalogue for GST: ${gstToFetch}, Tab: ${selected}`);
      const res = await axios.get(
        `https://api-v7quhc5aza-uc.a.run.app/getCatalogue/${gstToFetch}`,
      );
      const fetched = Object.values(res.data || []).map(p => ({
        ...p,
        productId: p.productId || p.prodId, // Ensure productId exists, sometimes it's prodId from API
        count: 0,
        image: require('../Images/VendorProfileImage.png'),
        SupplierName: supplierDisplayName, // Use the dynamically determined display name
        gstNumber: gstToFetch, // Store the GST number associated with these products
      }));

      setProducts(prev => ({
        ...prev,
        [selected]: fetched,
      }));
    } catch (err) {
      console.log('Catalogue fetch failed:', err.message);
      // More specific error message for the user
      Alert.alert('Error', `Failed to load ${selected} catalogue. Please try again.`);
      setProducts(prev => ({ // Clear products for the failed tab to allow re-fetch
        ...prev,
        [selected]: []
      }));
    } finally {
      setLoading(false); // Turn off initial loader
      setTabLoading(false); // Turn off tab loader
    }
  };

  // Initial fetch for default tab (supplier) AFTER clientGST is set
  useEffect(() => {
    if (clientGST || vendorGST) { // Ensure either clientGST or vendorGST is available before initial fetch
      fetchCatalogue(selectedTab);
    }
  }, [clientGST, vendorGST]); // Add vendorGST to dependencies for initial fetch

  // Refetch when tab changes
  const handleTabChange = tab => {
    setSelectedTab(tab);
    // Only refetch if data for the new tab is not already present
    // or if you always want to ensure fresh data.
    if (products[tab].length === 0) {
      fetchCatalogue(tab);
    }
  };

  const goToBasket = () => {
    const selectedProducts = products[selectedTab].filter(p => p.count > 0);

    if (selectedProducts.length === 0) {
      Alert.alert('No items', 'Please add at least one item to proceed.');
      return;
    }

    // Prepare cart data as an array of objects for easier processing on next screen
    const cartItems = selectedProducts.map(product => ({
      productId: product.productId,
      quantity: product.count,
      prodName: product.prodName,
      prodUnit: product.prodUnit,
      myPrice: product.myPrice,
      SupplierName: product.SupplierName,
      gstNumber: product.gstNumber, // The GST of the supplier of *this specific product*
    }));

    // Ensure we're passing the correct clientGST and vendorGST for the order
    // clientGST will be the current user's GST (from clientGstFromChat or AsyncStorage)
    // vendorGST will be the GST of the supplier for this order (from route.params)
    navigation.navigate('View Basket', {
      cartItems: cartItems, // Changed from 'cart' to 'cartItems' for clarity
      clientGST: clientGST, // The client's GST
      vendorGST: vendorGST, // The supplier/vendor's GST
      vendorName: customerName, // The display name of the vendor
    });
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="black" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Order Now</Text>
      </View>

      {/* Vendor Info */}
      <View style={styles.vendorBox}>
        <Image
          source={require('../Images/VendorProfileImage.png')}
          style={styles.vendorLogo}
        />
        {/* Display the vendor's name passed from chat */}
        <Text style={styles.vendorName}>{customerName}</Text>
        <Text style={styles.vendorLabel}>Vendor</Text>
        <TouchableOpacity
          style={styles.addProductBtn}
          onPress={() => Alert.alert('Add Product Manually', 'This feature is under development.')}>
          {/* You might want to remove this or make it functional if it's for this screen's products */}
          <Text style={styles.addProductText}>+ Add Products</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Options */}
      <View style={styles.tabWrapper}>
        <TouchableOpacity onPress={() => handleTabChange('my')}>
          <Text style={[styles.tab, selectedTab === 'my' && styles.activeTab]}>
            My Catalogue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTabChange('supplier')}>
          <Text
            style={[
              styles.tab,
              selectedTab === 'supplier' && styles.activeTab,
            ]}>
            Supplier’s Catalogue
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unit Switch - Commented out as per original code */}
      {/* <View style={styles.unitSwitch}>
         <TouchableOpacity
           onPress={() => setSelectedUnit('kg')}
           style={
             selectedUnit === 'kg' ? styles.unitBtnGreen : styles.unitBtnGray
           }>
           <Text
             style={
               selectedUnit === 'kg' ? styles.unitTextGreen : styles.unitTextGray
             }>
             Per Kg
           </Text>
         </TouchableOpacity>
         <TouchableOpacity
           onPress={() => setSelectedUnit('carton')}
           style={
             selectedUnit === 'carton' ? styles.unitBtnGreen : styles.unitBtnGray
           }>
           <Text
             style={
               selectedUnit === 'carton'
                 ? styles.unitTextGreen
                 : styles.unitTextGray
             }>
             Per 10 kg Carton
           </Text>
         </TouchableOpacity>
       </View> */}

      {/* Loader or Product List */}
      {loading || tabLoading ? (
        <ActivityIndicator
          size="large"
          color="#76B117"
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        />
      ) : products[selectedTab].length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 16, color: '#888'}}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products[selectedTab]}
          renderItem={renderProduct}
          keyExtractor={item => item?.productId?.toString() || Math.random().toString()} // Fallback keyExtractor
          contentContainerStyle={{paddingBottom: 100, paddingTop: '3%'}}
        />
      )}

      {/* Basket Button */}
      <TouchableOpacity style={styles.basketBtn} onPress={goToBasket}>
        <Text style={styles.basketText}>View Basket</Text>
        <ShoppingCartIcon size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default SpecificVendorOrderNow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
  },
  vendorBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  vendorLogo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 30,
  },
  vendorName: {
    fontSize: 24,
    fontWeight: '700',
  },
  vendorLabel: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 10,
  },
  addProductBtn: {
    backgroundColor: '#76B117',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    width: '60%',
    alignItems: 'center',
  },
  addProductText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 17,
  },
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 20,
  },
  tab: {
    paddingVertical: 8,
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTab: {
    color: '#76B117',
    fontWeight: '700',
    borderBottomWidth: 2,
    borderColor: '#76B117',
  },
  unitSwitch: {
    flexDirection: 'row',
    marginVertical: 15,
    gap: 10,
  },
  unitBtnGray: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  unitBtnGreen: {
    backgroundColor: '#76B117',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  unitTextGray: {
    color: '#6B7280',
    fontWeight: '600',
  },
  unitTextGreen: {
    color: 'white',
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#76B117',
    fontWeight: '700',
  },
  productBrand: {
    fontSize: 12,
    color: '#6B7280',
  },
  productWeight: {
    fontSize: 12,
    color: '#6B7280',
  },
  productPricing: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontWeight: '700',
    fontSize: 14,
  },
  productDiscount: {
    fontSize: 10,
    color: '#76B117',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#76B117',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
  },
  counterBtn: {
    padding: 2,
  },
  counterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  basketBtn: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#76B117',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  basketText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});