import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import {ChevronLeftIcon} from "react-native-heroicons/outline";
import {useNavigation} from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get('window');

const Report = () => {
  const navigation = useNavigation();
  const reportsData = [
    { name: 'Apples', location: 'Jaipur', qty: '10 Kg', amount: '₹1200', date: '18 June 2024', category: 'Fruits', branchlocation: 'Crunch Jaipur' },
    { name: 'Orange', location: 'Jaipur', qty: '10 kg', amount: '₹1500', date: '18 June 2024', category: 'Fruits', branchlocation: 'Crunch Jaipur'  },
    { name: 'Jamun', location: 'Jaipur', qty: '15 Kg', amount: '₹6675', date: '18 June 2024', category: 'Fruits', branchlocation: 'Crunch Jaipur'  },
    { name: 'Mango', location: 'Jaipur', qty: '08 Kg', amount: '₹5200', date: '18 June 2024', category: 'Fruits', branchlocation: 'Crunch Jaipur'  },
  ];

  return (
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Name</Text>
          <Text style={styles.tableHeaderText}>Location</Text>
          <Text style={styles.tableHeaderText}>Qty</Text>
          <Text style={styles.tableHeaderText}>Amount</Text>
        </View>

        {reportsData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.name}</Text>
            <Text style={styles.tableCell}>{item.location}</Text>
            <Text style={styles.tableCell}>{item.qty}</Text>
            <Text style={styles.tableCell}>{item.amount}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        {/* You can add pagination or other controls here */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light background
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
    flex: 1, // Takes available space to center the text
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
    paddingLeft: 15, // Add padding for search icon (if needed),
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
  content: {
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1, // Add border to rows
    borderBottomColor: '#eee', // Light border color
  },
  tableCell: {
    fontSize: 16,
  },
  bottomBar: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    // Add pagination or other controls here
  },
});

export default Report;
