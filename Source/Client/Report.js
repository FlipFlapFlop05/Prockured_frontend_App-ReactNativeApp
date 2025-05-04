import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TextInput, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get('window');

const Report = () => {
  const navigation = useNavigation();
  const reportsData = [
    // ... (your reportsData)
  ];

  const renderReportItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.name}</Text>
      <Text style={styles.tableCell}>{item.location}</Text>
      <Text style={styles.tableCell}>{item.qty}</Text>
      <Text style={styles.tableCell}>{item.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}> {/* Wrap with SafeAreaView */}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={20} color={"black"} strokeWidth={4} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Reports</Text>
          </View>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
          />
        </View>

        <View style={styles.filterBar}>
          <Text style={styles.filterText}>18 June 2024</Text>
          <Text style={styles.filterText}>Fruits</Text>
          <Text style={styles.filterText}>Crunch Jaipur</Text>
        </View>

        <FlatList
                   data={reportsData}
                   renderItem={renderReportItem}
                   keyExtractor={(item, index) => index.toString()} // Important: Add a key extractor
                   contentContainerStyle={styles.flatListContent} // Add padding to FlatList
        />

        <View style={styles.bottomBar}>
          {/* You can add pagination or other controls here */}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 30,
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  header: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
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
    color: "black"
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#eee',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: "bold"
  },
  flatListContent: {  // Style for FlatList
    padding: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    fontSize: 16,
    flex: 1, // Distribute cell width equally
    textAlign: 'center', // Center text within cells
  },
  bottomBar: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});

export default Report;
