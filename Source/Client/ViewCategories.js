import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Image, SafeAreaView, Dimensions, TextInput, Animated } from "react-native";
import { ChevronLeftIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Vegetable_Categories, Fruit_Categories } from "../Constant/constant";
import { PlusIcon } from "react-native-heroicons/solid";
import React, { useState, useRef, useEffect } from 'react';

const { width } = Dimensions.get('window');

const ViewCategories = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name } = route.params;

  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [data, setData] = useState([]);
  const [cart, setCart] = useState({});
  const categories = name === "Fruits" ? Fruit_Categories : Vegetable_Categories;
  const displayedTitle = name === "Fruits" ? "Fruits" : "Vegetable";
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedSubcategory(categories[0]?.title);
      fetchData(categories[0]?.title);
    }
  }, [categories]);

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    fetchData(subcategory);
  };
  const fetchData = async (subcategory) => {
    if (!subcategory) return;
    try {
      const response = await fetch(`https://api-v7quhc5aza-uc.a.run.app/getItems/${displayedTitle}/${subcategory}`);
      const fetchedData = await response.json();

      if (fetchedData && typeof fetchedData === "object") {
        const transformedData = Object.keys(fetchedData).map((key) => ({
          id: key,
          ...fetchedData[key],
        }));
        setDisplayedItems(transformedData);
        setFilteredItems(transformedData);
        setData(transformedData); // ✅ Ensuring data is properly set
      } else {
        setDisplayedItems([]);
        setFilteredItems([]);
        setData([]); // ✅ Reset data to avoid empty references
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setDisplayedItems([]);
      setFilteredItems([]);
      setData([]);
    }
  };


  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredItems(displayedItems);
      setFilteredSubcategories(categories);
      return;
    }

    const filteredItem = displayedItems.filter((item) =>
      item.Name.toLowerCase().includes(query.toLowerCase())
    );

    const filteredSubcategory = categories.filter((category) =>
      category.title.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredItems(filteredItem);
    setFilteredSubcategories(filteredSubcategory);
  };
  const calculateTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };
  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(searchBarAnim, {
      toValue: isSearchVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    if (isSearchVisible === true) {
      setSearchQuery('');
      setFilteredItems(displayedItems);
      setFilteredSubcategories(categories);
    }
  };

  const handleAddToCart = (id) => {
    setCart((prevCart) => ({
      ...prevCart,
      [id]: (prevCart[id] || 0) + 1,
    }));
  };


  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => {
      if (prevCart[id] > 1) {
        return { ...prevCart, [id]: prevCart[id] - 1 };
      } else {
        const newCart = { ...prevCart };
        delete newCart[id];
        return newCart;
      }
    });
  };



  const updateCartFromBasket = (updatedCart) => {
    setCart(updatedCart);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="black" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>{displayedTitle}</Text>
          <TouchableOpacity onPress={toggleSearch}>
            <MagnifyingGlassIcon size={22} color="black" />
          </TouchableOpacity>
        </View>

        {isSearchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={"black"}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subcategoryContainer}>
          {(searchQuery ? filteredSubcategories : categories).map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.subcategoryButton,
                selectedSubcategory === category.title && styles.selectedSubcategory,
              ]}
              onPress={() => handleSubcategorySelect(category.title)}
            >
              <Text style={[
                styles.subcategoryText,
                selectedSubcategory === category.title && styles.selectedSubcategoryText,
              ]}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemRow}>
                <Image source={require("../Images/ProckuredImage.jpg")} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.Name}</Text>
                  <Text style={styles.itemDesc}>{item.Desc?.length > 14 ? item.Desc.substring(0, 14) + "..." : item.Desc}</Text>
                </View>
                <View style={styles.quantityControlsCard}>
                  <TouchableOpacity style={styles.quantityButtonCard} onPress={() => handleRemoveFromCart(item.id)}>
                    <Text style={styles.quantityButtonTextCard}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityTextCard}>{cart[item.id] || 0}</Text>
                  <TouchableOpacity style={styles.quantityButtonCard} onPress={() => handleAddToCart(item.id)}>
                    <Text style={styles.quantityButtonTextCard}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={() => <Text style={styles.placeholderText}>No items available</Text>}
          contentContainerStyle={styles.flatListContainer}
        />

      </View>
      {calculateTotalItems() > 0 && (
        <TouchableOpacity
          style={styles.viewBasketButton}
          onPress={() => navigation.navigate("Categories Basket", { cart, data, updateCart: updateCartFromBasket })}
        >
          <Text style={styles.viewBasketText}>View Basket ({calculateTotalItems()})</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
  //  flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    //marginTop: 10
    fontFamily: "Arial",
    fontStyle: "italic",
    color: "green"
  },
  contentWrapper: {
    //flex: 1,
  },
  subcategoryContainer: {
    height: 80,
    marginBottom: 10,
  },
  subcategoryButton: {
    width: "fitContent",
    height: width * 0.1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "white",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "green",
  },
  selectedSubcategory: {
    backgroundColor: "green",
  },
  subcategoryText: {
    color: "green",
    padding: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  selectedSubcategoryText:{
    color: "white"
  },
  flatListContainer: {
    //flexGrow: 1,
    marginTop: -20,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    height: width * 0.21,
    borderRadius: 8,
   // marginVertical: ,
   // marginBottom: -15,
    marginTop: 20,
    //flex: 1,
    backgroundColor: "#f9f9f9",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemDesc: {
    fontSize: 14,
    color: "#555",
  },
  plusButton: {
    width: 40,
    height: 40,
    backgroundColor: "green",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginRight: 5  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
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
  viewBasketButton: {
    backgroundColor: "#76B117",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "90%",
    alignSelf: "center",
    justifyContent: "center",
    marginLeft: 20,
    marginBottom: 20
  },
  viewBasketText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ViewCategories;
