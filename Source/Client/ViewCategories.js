import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Image } from "react-native";
import { ChevronLeftIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Vegetable_Categories, Fruit_Categories } from "../Constant/constant";
import {PlusIcon} from "react-native-heroicons/solid";

const ViewCategories = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name } = route.params;

  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [displayedItems, setDisplayedItems] = useState([]);

  // Determine the categories based on the route name
  const categories = name === "Fruits" ? Fruit_Categories : Vegetable_Categories;
  const displayedTitle = name === "Fruits" ? "Fruits" : "Vegetable";

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedSubcategory(categories[0]?.title);
    }
  }, [categories]);

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    fetchData(subcategory);
  };

  // Fetch data and convert object to array
  const fetchData = async (subcategory) => {
    if (!subcategory) return;
    try {
      const response = await fetch(`https://api-v7quhc5aza-uc.a.run.app/getItems/${displayedTitle}/${subcategory}`);
      const data = await response.json();

      if (data && typeof data === "object") {
        const transformedData = Object.keys(data).map((key) => ({
          id: key, // Use the item name as ID
          ...data[key],
        }));
        setDisplayedItems(transformedData);
      } else {
        console.warn("Unexpected API response:", data);
        setDisplayedItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setDisplayedItems([]);
    }
  };

  useEffect(() => {
    if (selectedSubcategory) {
      fetchData(selectedSubcategory);
    }
  }, [selectedSubcategory]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="black" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>{displayedTitle}</Text>
        <MagnifyingGlassIcon size={22} color="black" />
      </View>

      {/* Subcategories and List Wrapper */}
      <View style={styles.contentWrapper}>
        {/* Horizontal Scroll for Subcategories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subcategoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.subcategoryButton,
                selectedSubcategory === category.title && styles.selectedSubcategory,
              ]}
              onPress={() => handleSubcategorySelect(category.title)}
            >
              <Text style={styles.subcategoryText}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List of Items */}
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemRow}>
                {/* Image */}
                <Image
                  source={require("../Images/ProckuredImage.jpg")}
                  style={styles.itemImage}
                />

                {/* Text Section */}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.Name}</Text>
                  <Text style={styles.itemDesc}>
                    {item.Desc.length > 14 ? item.Desc.substring(0, 14) + "..." : item.Desc}
                  </Text>
                </View>

                {/* Plus Button */}
                <TouchableOpacity
                  style={styles.plusButton}
                  onPress={() => navigation.navigate("Add Product", {category: displayedTitle, subcategory: selectedSubcategory, productName: item.Name, productDesc: item.Desc, productImage: "../../assets/icon.png"})}
                >
                  <PlusIcon size={22} color={"white"} strokeWidth={10} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.placeholderText}>No items available</Text>
          )}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 22
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contentWrapper: {
    flex: 1,  // ✅ Ensures proper layout distribution
  },
  subcategoryContainer: {
    height: 100,  // ✅ Fixed height
    marginBottom: 10, // ✅ Creates separation between subcategories and list
  },
  subcategoryButton: {
    width: 100,  // ✅ Fixed width
    height: 60, // ✅ Fixed height
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
    color: "white"
  },
  subcategoryText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  flatListContainer: {
    flexGrow: 1, // ✅ Ensures `FlatList` starts after subcategories and occupies remaining space
  },
  itemCard: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: "#f9f9f9",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // ✅ Ensures space between elements
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
  },
  itemDetails: {
    flex: 1, // ✅ Takes available space
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
  },
});


export default ViewCategories;
