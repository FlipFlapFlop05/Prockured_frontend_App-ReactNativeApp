import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { orders } from '../Constant/constant';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

const Orders = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('24-06-2024');
  const [selectedCategory, setSelectedCategory] = useState('Vegetables');
  const [selectedStatus, setSelectedStatus] = useState('Pending');

  const filteredOrders = orders.filter(order => {
    const searchMatch =
      order.vendor.toLowerCase().includes(searchText.toLowerCase()) ||
      order.orderValue.includes(searchText);
    const statusMatch =
      selectedStatus === 'All' || order.status === selectedStatus;
    return searchMatch && statusMatch;
  });

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderLeft}>
        <Image source={item.logo} style={styles.logo} />
        <View>
          <Text style={styles.vendor}>{item.vendor}</Text>
          <Text style={styles.status}>{item.status}</Text>
          <TouchableOpacity>
            <Text style={styles.summary}>View Summary</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.amount}>₹ {item.orderValue}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <ChevronLeftIcon color={'black'} size={24} />
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Vendor or Order ID..."
          placeholderTextColor={'#999'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filters}>
        <Text style={styles.filterText}>Sort by</Text>
        <Text style={styles.filterText}>{selectedDate}</Text>
        <Text style={styles.filterText}>{selectedCategory}</Text>
      </View>

      <View style={styles.tabBar}>
        {['Pending', 'Confirmed', 'Past'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabItem,
              selectedStatus === tab && styles.activeTabItem,
            ]}
            onPress={() => setSelectedStatus(tab)}>
            <Text
              style={[
                styles.tabText,
                selectedStatus === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tableHeader}>
        <View>
          <Text style={styles.tableHeaderText}>Vendor Name</Text>
        </View>
        <View>
          <Text style={styles.tableHeaderText}>Order Value</Text>
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchBox: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: 'black',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterText: {
    fontSize: 14,
    color: '#444',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  activeTabItem: {
    backgroundColor: '#e6f4ea',
    borderRadius: 20,
  },
  tabText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  tableHeaderText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  vendor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 14,
    color: 'orange',
  },
  summary: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});

export default Orders;
