import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {orders} from '../Constant/constant';

const { width: screenWidth } = Dimensions.get('window');

const Orders = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('24-06-2024'); // Default date
  const [selectedCategory, setSelectedCategory] = useState('Vegetables'); // Default category
  const [selectedStatus, setSelectedStatus] = useState('Pending'); // Default status



  const filteredOrders = orders.filter(order => {
    const searchMatch = order.vendor.toLowerCase().includes(searchText.toLowerCase()) || order.orderValue.includes(searchText);
    const statusMatch = selectedStatus === 'All' || order.status === selectedStatus;
    return searchMatch && statusMatch;
  });

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderRow}>
      <View style={styles.vendorContainer}>
        <Text style={styles.orderVendor}>{item.vendor}</Text>
        <Text style={styles.orderStatus}>{item.status}</Text>
        <TouchableOpacity style={styles.viewSummaryButton}>
          <Text style={styles.viewSummaryButtonText}>View Summary</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.orderValue}>₹{item.orderValue}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
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
            placeholderTextColor={'black'}
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

        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) => index.toString()} // Replace with a unique ID if available
          contentContainerStyle={styles.flatListContent}
        />
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
  header: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    paddingTop: 20
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
    backgroundColor: 'lightgray',
    borderRadius: 5,
  },
  activeStatusButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  flatListContent: {
    padding: 10,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 10,
  },
  vendorContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  orderStatus: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  orderValue: {
    fontSize: 16,
    alignSelf: 'center',
  },
  viewSummaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 8,
    marginTop: 10,
  },
  viewSummaryButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default Orders;
