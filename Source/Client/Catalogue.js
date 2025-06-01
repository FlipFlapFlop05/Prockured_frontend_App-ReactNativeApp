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
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from 'react-native-heroicons/outline';
import {categories} from '../Constant/constant';

const {width} = Dimensions.get('window');

export default function Catalogue() {
  const navigation = useNavigation();
  const [phoneNumer, setPhoneNumber] = useState(null);
  const [data, setData] = useState([]);
  const [cart, setCart] = useState({});
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchAnim = useRef(new Animated.Value(0)).current;
  const [selectedMainCategory, setSelectedMainCategory] = useState(
    categories[0]?.name || '',
  );
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierTab, setSelectedSupplierTab] =
    useState('My Catalogue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('clientGST');
        console.log(storedPhoneNumber);

        if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);

        if (storedPhoneNumber) {
          const [catalogueResponse, suppliersResponse] = await Promise.all([
            axios.get(
              `https://api-v7quhc5aza-uc.a.run.app/getCatalogue/${storedPhoneNumber}`,
            ),
            axios.get(
              `https://api-v7quhc5aza-uc.a.run.app/getSupplier/${storedPhoneNumber}`,
            ),
          ]);

          const supplierArray = Object.values(suppliersResponse?.data);
          setSuppliers(supplierArray);

          const dataArray = Object.values(catalogueResponse?.data);
          setData(dataArray);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on selected category and supplier tab
  const filteredData = data.filter(item => {
    // First filter by the selected category (case insensitive)
    const categoryMatch =
      item.CategoryName?.toLowerCase() === selectedMainCategory?.toLowerCase();

    // Then filter by supplier if not "My Catalogue" (case insensitive)
    if (selectedSupplierTab === 'My Catalogue') {
      return categoryMatch;
    } else {
      return (
        categoryMatch &&
        item.SupplierName?.toLowerCase() === selectedSupplierTab?.toLowerCase()
      );
    }
  });

  console.log('Selected category:', selectedMainCategory);
  console.log('Selected supplier tab:', selectedSupplierTab);
  console.log('Filtered data:', filteredData);
  console.log('data:', data);
  console.log('suppliers:', suppliers);

  // Filter items based on search term
  const searchedItems = filteredData.filter(item =>
    item.prodName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  const calculateTotalItems = () =>
    Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const updateCartFromBasket = updatedCart => setCart(updatedCart);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(searchAnim, {
      toValue: isSearchVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.9],
  });

  const handleCategoryChange = category => {
    setSelectedMainCategory(category);
    setSelectedSupplierTab('My Catalogue'); // Reset to My Catalogue when category changes
    setIsDropdownVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#76B117" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginTop: '3%'}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{marginLeft: '5%', position: 'relative', bottom: '10%'}}>
          <ChevronLeftIcon size={21} color="#333" strokeWidth={2} />
        </TouchableOpacity>
        <View style={{marginLeft: '2%'}}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 20,
              fontFamily: 'Montserrat',
            }}>
            {data?.length == 0 ? 'Catalogue' : selectedMainCategory}
          </Text>

          {data?.length > 0 ? (
            <TouchableOpacity
              onPress={() => setIsDropdownVisible(!isDropdownVisible)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: '2%',
                }}>
                <Text style={{color: '#76B117'}}>Change Category</Text>
                <ChevronDownIcon
                  size={18}
                  color="#76B117"
                  style={{marginLeft: 4}}
                />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownItem}
              onPress={() => handleCategoryChange(cat.name)}>
              <Text style={{color: '#333'}}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {data.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fdiary.png?alt=media&token=28574722-8076-44a0-a093-53e6132b9945',
            }}
            style={styles.emptyStateImage}
          />
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => navigation.navigate('Add Product Manually')}>
            <Text style={styles.addProductText}>+ Add Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          {isSearchVisible && (
            <Animated.View
              style={[styles.searchContainer, {width: searchWidth}]}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor="gray"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </Animated.View>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{paddingHorizontal: 16, marginBottom: 10}}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedSupplierTab === 'My Catalogue' &&
                  styles.filterButtonActive,
              ]}
              onPress={() => setSelectedSupplierTab('My Catalogue')}>
              <Text
                style={[
                  styles.filterButtonText,
                  selectedSupplierTab === 'My Catalogue' &&
                    styles.filterButtonTextActive,
                ]}>
                My Catalogue
              </Text>
            </TouchableOpacity>
            {suppliers.map(supplier => (
              <TouchableOpacity
                key={supplier.supplierId}
                style={[
                  styles.filterButton,
                  selectedSupplierTab === supplier.businessName &&
                    styles.filterButtonActive,
                ]}
                onPress={() => setSelectedSupplierTab(supplier.businessName)}>
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedSupplierTab === supplier.businessName &&
                      styles.filterButtonTextActive,
                  ]}>
                  {supplier.businessName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {searchedItems.length > 0 ? (
            <FlatList
              data={searchedItems}
              keyExtractor={item => item.productId}
              renderItem={({item}) => (
                <View style={styles.productCard}>
                  <Image
                    source={{
                      uri: 'https://www.themealdb.com/images/category/beef.png',
                    }}
                    style={styles.productImageCard}
                  />
                  <View style={styles.productDetailsCard}>
                    <Text style={styles.productNameCard}>{item.prodName}</Text>
                    <Text style={styles.productCategoryCard}>
                      {item.CategoryName}
                    </Text>
                    <Text style={styles.productPriceCard}>
                      ₹ {item.myPrice}
                    </Text>
                  </View>
                  <View style={styles.quantityControlsCard}>
                    <TouchableOpacity
                      onPress={() => handleRemoveFromCart(item.productId)}>
                      <Text style={styles.quantityButtonTextCard}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityTextCard}>
                      {cart[item.productId] || 0}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleAddToCart(item.productId)}>
                      <Text style={styles.quantityButtonTextCard}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noProductsText}>
              {searchTerm
                ? 'No matching products found'
                : 'No products available in this category'}
            </Text>
          )}
        </ScrollView>
      )}

      {calculateTotalItems() > 0 && (
        <TouchableOpacity
          style={styles.viewBasketButton}
          onPress={() =>
            navigation.navigate('View Basket', {
              cart,
              data,
              updateCart: updateCartFromBasket,
            })
          }>
          <Text style={styles.viewBasketText}>View Basket</Text>
          <ShoppingCartIcon size={20} color="#fff" style={{marginLeft: 10}} />
          <Text style={styles.basketCount}> {calculateTotalItems()}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {flex: 1, backgroundColor: '#f9f9f9'},
  container: {padding: 15},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginRight: 10,
    borderColor: '#76B117',
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: '#76B117',
    color: '#FFF',
    fontFamily: 'Open Sans',
  },
  filterButtonText: {color: '#333', fontWeight: '400', fontFamily: 'Open Sans'},
  filterButtonTextActive: {color: '#fff'},
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  productImageCard: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
  productDetailsCard: {flex: 1},
  productNameCard: {fontSize: 16, fontWeight: '700', color: '#76B117'},
  productCategoryCard: {fontSize: 13, color: 'gray'},
  productPriceCard: {
    fontSize: 16,
    color: '#76B117',
    fontWeight: '600',
    marginTop: 4,
  },
  quantityControlsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#76B117',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#76B117',
  },
  quantityButtonTextCard: {color: '#fff', fontSize: 18, fontWeight: '400'},
  quantityTextCard: {marginHorizontal: 8, fontWeight: '600', color: '#fff'},
  viewBasketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#76B117',
    padding: 14,
    borderRadius: 10,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  viewBasketText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 400,
    fontFamily: 'Montserrat',
  },
  basketCount: {color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 6},
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyStateImage: {
    width: 220,
    height: 220,
    borderRadius: 40,
  },
  addProductButton: {
    backgroundColor: '#76B117',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  addProductText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 700,
    width: '100%',
    height: 'fit-content',
    textAlign: 'center',
  },
});
