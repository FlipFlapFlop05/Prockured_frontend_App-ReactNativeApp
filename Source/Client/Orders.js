import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const Orders = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('24-06-2024'); // Default date
  const [selectedCategory, setSelectedCategory] = useState('Vegetables'); // Default category
  const [selectedStatus, setSelectedStatus] = useState('Pending'); // Default status

  const orders = [
    { vendor: 'Frugreen', orderValue: '2420', status: 'Pending' },
    { vendor: 'Coastal', orderValue: '56620', status: 'Pending' },
    { vendor: 'Suparna\'s', orderValue: '4285', status: 'Pending' },
    { vendor: 'DM Agro', orderValue: '5677', status: 'Pending' },
    { vendor: 'Suparna\'s', orderValue: '4285', status: 'Confirmed' },
    { vendor: 'DM Agro', orderValue: '5677', status: 'Confirmed' },
    { vendor: 'Frugreen', orderValue: '2420', status: 'Past' },
    { vendor: 'Coastal', orderValue: '56620', status: 'Past' },
  ];

  const filteredOrders = orders.filter(order => {
    const searchMatch = order.vendor.toLowerCase().includes(searchText.toLowerCase()) || order.orderValue.includes(searchText);
    const statusMatch = selectedStatus === 'All' || order.status === selectedStatus; // Add 'All' option if needed
    return searchMatch && statusMatch; // Filter by both search and status
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Vendor or Order ID..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Sort by</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>{selectedDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>{selectedCategory}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusFilter}>
        <TouchableOpacity
          style={[styles.statusButton, selectedStatus === 'Pending' && styles.activeStatusButton]}
          onPress={() => setSelectedStatus('Pending')}
        >
          <Text style={[styles.statusButtonText, selectedStatus === 'Pending' && styles.activeStatusButtonText]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, selectedStatus === 'Confirmed' && styles.activeStatusButton]}
          onPress={() => setSelectedStatus('Confirmed')}
        >
          <Text style={[styles.statusButtonText, selectedStatus === 'Confirmed' && styles.activeStatusButtonText]}>Confirmed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, selectedStatus === 'Past' && styles.activeStatusButton]}
          onPress={() => setSelectedStatus('Past')}
        >
          <Text style={[styles.statusButtonText, selectedStatus === 'Past' && styles.activeStatusButtonText]}>Past</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderHeaderText}>Vendor Name</Text>
          <Text style={styles.orderHeaderText}>Order Value</Text>
        </View>

        {filteredOrders.map((order, index) => (
          <View key={index} style={styles.orderRow}>
            <View style={styles.vendorContainer}> {/* Wrap vendor and status */}
              <Text style={styles.orderVendor}>{order.vendor}</Text>
              <Text style={styles.orderStatus}>{order.status}</Text> {/* Status below vendor */}
              <TouchableOpacity style={styles.viewSummaryButton}>
                <Text style={styles.viewSummaryButtonText}>View Summary</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.orderValue}>₹{order.orderValue}</Text>
          </View>
        ))}
      </ScrollView>
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
    paddingTop: 30
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterButton: {
    padding: 8,
  },
  filterButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  statusFilter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statusButton: {
    padding: 8,
  },
  statusButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  activeStatusButton: {
    backgroundColor: 'lightgray', // Or any other visual indicator
    borderRadius: 5, // Optional: Add rounded corners
  },
  activeStatusButtonText: {
    color: 'black', // Or any color you prefer
    fontWeight: 'bold',
  },
  content: {
    padding: 10,
  },
  orderVendor: {
    fontSize: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 10,
  },
  orderHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4CAF50',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the top of the row
    paddingVertical: 15, // Increased padding
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vendorContainer: { // New container for vendor and status
    flexDirection: 'column', // Align items vertically
    justifyContent: 'flex-start', // Align to the top
  },
  orderStatus: { // Style for the order status
    fontSize: 14,
    color: 'gray',
    marginTop: 5, // Add some margin at the top
  },
  orderValue: {
    fontSize: 16,
    alignSelf: 'center', // Vertically center the order value
  },
  viewSummaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 8,
    marginTop: 10,  // Add margin to separate the button
  },
  viewSummaryButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default Orders;
