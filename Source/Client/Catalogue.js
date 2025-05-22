import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import Config from 'react-native-config';

const {width, height} = Dimensions.get('window');

export default function Catalogue() {
  const navigation = useNavigation();
  const [phoneNumer, setPhoneNumber] = useState(null);
  const [data, setData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({});
  const categoryScrollViewRef = useRef(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchAnim = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Your Catalogue',
      headerStyle: {
        backgroundColor: '#f8f8f8',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        // justifyContent: 'center',
        // alignItems: 'center',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
        // justifyContent: 'center',
        // color: 'white',
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
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };

    const fetchData = async () => {
      if (phoneNumer) {
        try {
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getCatalogue/${phoneNumer}`,
          );
          const dataArray = Object.values(response.data);
          console.log(dataArray);

          setData(dataArray);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchPhoneNumber();
    fetchData();
  }, [phoneNumer]);

  const groupedData = data.reduce((acc, item) => {
    const category = item.SupplierName;
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

  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const filteredItems = Object.keys(filteredData).reduce((acc, category) => {
    acc[category] = filteredData[category].filter(item =>
      item.prodName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return acc;
  }, {});

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container}>
        {isSearchVisible && ( // Conditionally render the search bar
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

            {Object.keys(filteredItems).map((category, index) => (
              <FlatList
                key={index}
                data={filteredItems[category]}
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
            ))}

            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => navigation.navigate('Add Product Manually')}>
              <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
        )}
      </ScrollView>
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
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: 10,
    width: width * 0.9,
    position: 'relative', // Ensure header is positioned relatively
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 22,
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
  },
  selectedCategoryButton: {
    backgroundColor: '#76B117',
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
  },
  productCategoryCard: {
    fontSize: 14,
    color: 'gray',
  },
  productPriceCard: {
    fontSize: 16,
    marginTop: 5,
  },
  quantityControlsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#76B117',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  quantityButtonCard: {
    padding: 5,
  },
  quantityButtonTextCard: {
    color: 'white',
    fontSize: 18,
  },
  quantityTextCard: {
    color: 'white',
    fontSize: 16,
    marginHorizontal: 8,
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
  viewBasketButton: {
    backgroundColor: '#76B117',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    marginBottom: 10,
  },
  viewBasketText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchInput: {
    padding: 10,
    color: 'black',
    width: '90%',
  },
  floatingButton: {
    backgroundColor: '#76B117',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    bottom: 80,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
});
