import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Animated,
  ActivityIndicator, // Added ActivityIndicator for loading state
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {MagnifyingGlassIcon} from 'react-native-heroicons/outline';

const {width} = Dimensions.get('window'); // Removed 'height' as it's not used here

export default function VendorCatalogue() {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({});
  const categoryScrollViewRef = useRef(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true); // Added loading state

  // This useEffect now handles fetching both client GST (for the API call) and then the data
  useEffect(() => {
    const initDataFetch = async () => {
      setLoading(true); // Start loading
      try {
        // Correctly fetch supplierGST to use as the phone number for the API
        const supplierGst = await AsyncStorage.getItem('supplierGST');
        // If you still need the client's actual phone number for other purposes, fetch it too
        // const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');

        if (supplierGst) {
          setPhoneNumber(supplierGst); // Set the GST as phoneNumber for the API endpoint
          try {
            const response = await axios.get(
              `https://api-v7quhc5aza-uc.a.run.app/getCatalogue/${supplierGst}`, // Use supplierGst here
            );
            const dataArray = Object.values(response.data);
            setData(dataArray);
          } catch (apiError) {
            console.log('Error fetching catalogue data:', apiError);
            Alert.alert("Error", "Failed to load catalogue. Please check your network or try again.");
          }
        } else {
          console.warn('Supplier GST not found in AsyncStorage. Cannot fetch catalogue.');
          Alert.alert("Login Required", "Please ensure you are logged in as a supplier.");
        }
      } catch (storageError) {
        console.log('Error Fetching Supplier GST from AsyncStorage: ', storageError);
        Alert.alert("Error", "Could not retrieve your details. Please try logging in again.");
      } finally {
        setLoading(false); // End loading
      }
    };

    initDataFetch();
  }, []); // Run only once on component mount

  const groupedData = data.reduce((acc, item) => {
    const category = item.CategoryName;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const categories = ['All', ...Object.keys(groupedData)];

  const filteredData =
    selectedCategory === 'All'
      ? groupedData
      : {[selectedCategory]: groupedData[selectedCategory]};

  const handleAddToCart = productId => {
    setCart(prevCart => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = productId => {
    if (cart[productId] > 1) {
      setCart(prevCart => ({
        ...prevCart,
        [productId]: prevCart[productId] - 1,
      }));
    } else {
      const newCart = {...cart};
      delete newCart[productId];
      setCart(newCart);
    }
  };

  const calculateTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const updateCartFromBasket = updatedCart => {
    setCart(updatedCart);
  };

  const handleCategoryPress = category => {
    setSelectedCategory(category);
    if (categoryScrollViewRef.current) {
      categoryScrollViewRef.current.scrollTo({x: 0, y: 0, animated: true});
    }
  };

  const toggleSearch = () => {
    // If search is visible, animate it out first, then hide
    if (isSearchVisible) {
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsSearchVisible(false);
        setSearchTerm(''); // Clear search term when hiding
      });
    } else {
      // If search is hidden, show it first, then animate it in
      setIsSearchVisible(true);
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.9],
  });

  // No need for searchOpacity if you're using width interpolation for visibility
  // const searchOpacity = searchAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: [0, 1],
  // });

  const filteredItems = Object.keys(filteredData).reduce((acc, category) => {
    // Ensure filteredData[category] exists before filtering
    if (filteredData[category]) {
      acc[category] = filteredData[category].filter(item =>
        item.prodName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    } else {
      acc[category] = []; // If category doesn't exist in filteredData, return empty array
    }
    return acc;
  }, {});

  // Render a loading indicator while data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#76B117" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#333' }}>Loading your catalogue...</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Your Catalogue!</Text>
          <TouchableOpacity onPress={toggleSearch}>
            <MagnifyingGlassIcon size={25} color={'black'} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {isSearchVisible && (
          <Animated.View style={[styles.searchContainer, {width: searchWidth}]}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="gray"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </Animated.View>
        )}

        {data.length !== 0 ? (
          <View style={styles.mainContent}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              ref={categoryScrollViewRef}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category &&
                      styles.selectedCategoryButton,
                  ]}
                  onPress={() => handleCategoryPress(category)}>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category &&
                        styles.selectedCategoryText,
                    ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {Object.keys(filteredItems).length === 0 && searchTerm ? (
                <Text style={styles.noProductsText}>No products match your search.</Text>
            ) : Object.keys(filteredItems).length === 0 && !searchTerm ? (
                <Text style={styles.noProductsText}>No products available in this category.</Text>
            ) : (
              Object.keys(filteredItems).map((category, index) => (
                // Only render FlatList if there are items in the category after filtering
                filteredItems[category].length > 0 && (
                  <FlatList
                    key={index}
                    data={filteredItems[category]}
                    keyExtractor={item => item.productId}
                    renderItem={({item}) => (
                      <View style={styles.productCard}>
                        <Image
                          source={{
                            uri:
                              item.image || // Use item.image if available, otherwise fallback
                              'https://www.themealdb.com/images/category/beef.png',
                          }}
                          style={styles.productImageCard}
                        />
                        <View style={styles.productDetailsCard}>
                          <Text style={styles.productNameCard}>
                            {item.prodName}
                          </Text>
                          <Text style={styles.productCategoryCard}>
                            {item.CategoryName}
                          </Text>
                          <Text style={styles.productPriceCard}>
                            ₹ {item.myPrice}
                          </Text>
                        </View>
                        {/* Quantity Controls (Re-added, commented out in your original code) */}
                        <View style={styles.quantityControlsCard}>
                          <TouchableOpacity
                            style={styles.quantityButtonCard}
                            onPress={() => handleRemoveFromCart(item.productId)}>
                            <Text style={styles.quantityButtonTextCard}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantityTextCard}>
                            {cart[item.productId] || 0}
                          </Text>
                          <TouchableOpacity
                            style={styles.quantityButtonCard}
                            onPress={() => handleAddToCart(item.productId)}>
                            <Text style={styles.quantityButtonTextCard}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                )
              ))
            )}
          </View>
        ) : (
          // This is the empty state block
          <View style={styles.emptyState}>
            <Image
              source={{
                uri: 'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fdiary.png?alt=media&token=28574722-8076-44a0-a093-53e6132b9945',
              }}
              style={styles.emptyStateImage}
            />
            {/* The + Add Product button when catalogue is empty */}
            <TouchableOpacity
              style={styles.addProductButtonEmptyState} 
              onPress={() => navigation.navigate('Vendor Add Product')}>
              <Text style={styles.addProductText}>+ Add Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Product Button - Only visible if catalogue is NOT empty */}
      {data.length !== 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('Vendor Add Product')}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {/* View Basket Button - Conditionally rendered based on total items */}
      {calculateTotalItems() > 0 && (
        <TouchableOpacity
          style={styles.viewBasketButton}
          onPress={() =>
            navigation.navigate('View Basket', {
              cart: cart,
              catalogueData: data, // Pass the entire catalogue data
              suppliers: [], // Vendor's own catalogue, so no other suppliers here. Or fetch it if needed.
              clearCart: () => setCart({}), // Pass a function to clear the cart in this component
            })
          }>
          <Text style={styles.viewBasketText}>
            View Basket ({calculateTotalItems()})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    width: '100%', // Use 100% for flex containers
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  searchContainer: {
    alignSelf: 'center', // Keep it centered when animating width
    paddingVertical: 10, // Add some vertical padding
    // No need for explicit width here, `searchWidth` from animation handles it
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#000',
    borderColor: '#ccc', // Lighter border
    borderWidth: 1,
  },
  mainContent: {
    marginTop: 20,
  },
  categoryScroll: {
    marginBottom: 10,
    paddingVertical: 5,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
    borderWidth: 1, // Added border for clarity
    borderColor: '#d0d0d0', // Lighter border
  },
  selectedCategoryButton: {
    backgroundColor: '#76B117',
    borderColor: '#76B117', // Match border color
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
    elevation: 2, // Subtle shadow for Android
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImageCard: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  productDetailsCard: {
    flex: 1,
  },
  productNameCard: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productCategoryCard: {
    fontSize: 14,
    color: 'gray',
  },
  productPriceCard: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: '600', // Slightly bolder price
    color: '#76B117', // Green price
  },
  quantityControlsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#76B117',
    borderRadius: 8,
    paddingHorizontal: 5, // Reduced padding
    paddingVertical: 2, // Reduced padding
  },
  quantityButtonCard: {
    padding: 7, // Increased touch target
  },
  quantityButtonTextCard: {
    color: 'white',
    fontSize: 20, // Slightly larger for tap
    fontWeight: 'bold',
  },
  quantityTextCard: {
    color: 'white',
    fontSize: 18, // Slightly larger
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    // Removed justifyContent: 'center' and marginTop: 100
    // The image's margin will push it down
    paddingTop: 50, // Added padding from top to visually center content
  },
  emptyStateImage: {
    width: 220,
    height: 220,
    borderRadius: 40,
    // No specific margin-top needed here, adjust parent padding
  },
  // New style for the "Add Product" button in the empty state
  addProductButtonEmptyState: {
    backgroundColor: '#76B117',
    paddingVertical: 12, // Slightly more padding
    paddingHorizontal: 25, // More horizontal padding
    borderRadius: 25, // More rounded corners
    marginTop: 20, // This positions it directly below the image
    alignSelf: 'center', // Ensures it's centered
    width: '80%', // Make it a bit narrower than 85%
  },
  addProductText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
  },
  viewBasketButton: {
    backgroundColor: '#76B117',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 10, // Adjusted to be 10px from the bottom
    left: 20,
    right: 20,
    // Removed width/margin overrides, left/right/bottom will stretch it correctly
    flexDirection: 'row', // Align text and count
    justifyContent: 'center', // Center content
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  viewBasketText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  floatingButton: {
    backgroundColor: '#76B117',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    bottom: 80, // Positioned above the "View Basket" button (10 bottom + 15 padding + ~55 button height = 80)
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
  },
});