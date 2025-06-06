import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';

const Order = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('24-06-2024');
  const [selectedCategory, setSelectedCategory] = useState('Vegetables');
  const [selectedStatus, setSelectedStatus] = useState('Pending');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState({
    pending: false,
    confirmed: false,
    past: false,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Orders',
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: 13, marginLeft: 4}}>
          <ChevronLeftIcon size={25} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (selectedStatus === 'Pending') {
      fetchPendingOrders();
    } else if (selectedStatus === 'Confirmed') {
      fetchConfirmedOrders();
    } else if (selectedStatus === 'Past') {
      fetchPastOrders();
    }
  }, [selectedStatus]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(prev => ({...prev, pending: true}));
      const res = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/getClientOpenOrders',
        {
          clientGST: '04030506',
        },
      );

      const orders = Object.values(res.data.data).map(order => ({
        orderId: order.Order_ID,
        vendor: order.supplierGST, // You might want to map this to actual vendor names
        status: 'Pending',
        orderValue: order.supplierId
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2),
        // Add the additional fields here
        items: order.supplierId,
        supplierGST: order.supplierGST,
        clientGST: order.clientGST,
        Order_ID: order.Order_ID,
        // Add other required fields like logo if available
      }));
      setPendingOrders(orders);
    } catch (err) {
      console.error('Pending orders fetch failed', err);
    } finally {
      setLoading(prev => ({...prev, pending: false}));
    }
  };

  const fetchConfirmedOrders = async () => {
    try {
      setLoading(prev => ({...prev, confirmed: true}));
      const res = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/getPlacedOrders',
        {
          clientGST: '04030506',
        },
      );

      const orders = Object.keys(res.data).map(orderId => {
        const order = res.data[orderId];
        return {
          orderId: order.Order_ID,
          vendor: order.supplierGST,
          status: 'Confirmed',
          orderValue: order.supplierId
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2),
          items: order.supplierId,
          // Additional fields
          supplierGST: order.supplierGST,
          clientGST: order.clientGST,
          Order_ID: order.Order_ID,
        };
      });
      setConfirmedOrders(orders);
    } catch (err) {
      console.error('Confirmed orders fetch failed', err);
    } finally {
      setLoading(prev => ({...prev, confirmed: false}));
    }
  };

  const fetchPastOrders = async () => {
    try {
      setLoading(prev => ({...prev, past: true}));
      const res = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/getClientCompletedOrders',
        {
          clientGST: '04030506',
        },
      );

      const ordersData = res.data.data || {};
      const orders = Object.keys(ordersData).map(orderId => {
        const order = ordersData[orderId];
        return {
          orderId: order.Order_ID,
          vendor: order.supplierGST,
          status: 'Delivered',
          orderValue: order.supplierId
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2),
          items: order.supplierId,
          deliveryDate: order.deliveryDate || 'N/A',
          // Additional fields
          supplierGST: order.supplierGST,
          clientGST: order.clientGST,
          Order_ID: order.Order_ID,
        };
      });
      setPastOrders(orders);
    } catch (err) {
      console.error('Past orders fetch failed', err);
    } finally {
      setLoading(prev => ({...prev, past: false}));
    }
  };

  const getFilteredOrders = () => {
    let ordersToFilter = [];
    switch (selectedStatus) {
      case 'Pending':
        ordersToFilter = pendingOrders;
        break;
      case 'Confirmed':
        ordersToFilter = confirmedOrders;
        break;
      case 'Past':
        ordersToFilter = pastOrders;
        break;
      default:
        ordersToFilter = [];
    }

    return ordersToFilter.filter(order => {
      const searchMatch =
        order.vendor.toLowerCase().includes(searchText.toLowerCase()) ||
        order.orderId.includes(searchText);
      return searchMatch;
    });
  };

  const renderOrderItem = ({item}) => (
    <View style={styles.orderItem}>
      <View style={styles.orderLeft}>
        {/* You might want to replace this with actual vendor logos */}
        <Image
          source={{uri: 'https://via.placeholder.com/40'}}
          style={styles.logo}
        />
        <View>
          <Text style={styles.vendor}>{item.vendor}</Text>
          <Text
            style={[
              styles.status,
              item.status === 'Pending' && {color: 'orange'},
              item.status === 'Confirmed' && {color: 'blue'},
              item.status === 'Delivered' && {color: 'green'},
            ]}>
            {item.status}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Specific Order Screen', {
                order: item,
              })
            }>
            <Text style={styles.summary}>View Summary</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.amount}>₹ {item.orderValue}</Text>
    </View>
  );

  const openModal = type => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleSelect = option => {
    if (modalType === 'date') {
      setSelectedDate(option);
    } else if (modalType === 'category') {
      setSelectedCategory(option);
    }
    setModalVisible(false);
  };

  const renderContent = () => {
    if (
      (selectedStatus === 'Pending' && loading.pending) ||
      (selectedStatus === 'Confirmed' && loading.confirmed) ||
      (selectedStatus === 'Past' && loading.past)
    ) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#76B117" />
        </View>
      );
    }

    const filteredOrders = getFilteredOrders();

    if (filteredOrders.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No {selectedStatus.toLowerCase()} orders found
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.tableHeader}>
          <View style={styles.headerBox}>
            <Text style={styles.tableHeaderText}>Vendor Name</Text>
          </View>
          <View style={styles.headerBox}>
            <Text style={styles.tableHeaderText}>Order Value</Text>
          </View>
        </View>
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.orderId}
          contentContainerStyle={{paddingBottom: 80}}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <MagnifyingGlassIcon size={20} color="#000" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Vendor or Order ID..."
          placeholderTextColor="#000"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter Row */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={styles.filterBox}
          onPress={() => openModal('sort')}>
          <Text style={styles.filterText}>Sort by</Text>
          <ChevronDownIcon size={14} color="green" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBox}
          onPress={() => openModal('date')}>
          <Text style={styles.filterText}>{selectedDate}</Text>
          <ChevronDownIcon size={14} color="green" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterBox}
          onPress={() => openModal('category')}>
          <Text style={styles.filterText}>{selectedCategory}</Text>
          <ChevronDownIcon size={14} color="green" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
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

      {/* Content */}
      {renderContent()}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            {modalType === 'date' &&
              ['24-06-2024', '25-06-2024', '26-06-2024'].map(date => (
                <Pressable key={date} onPress={() => handleSelect(date)}>
                  <Text style={styles.modalOption}>{date}</Text>
                </Pressable>
              ))}
            {modalType === 'category' &&
              ['Vegetables', 'Fruits', 'Groceries'].map(cat => (
                <Pressable key={cat} onPress={() => handleSelect(cat)}>
                  <Text style={styles.modalOption}>{cat}</Text>
                </Pressable>
              ))}
            {modalType === 'sort' &&
              ['Latest First', 'Oldest First', 'Value High to Low'].map(
                sort => (
                  <Pressable key={sort} onPress={() => handleSelect(sort)}>
                    <Text style={styles.modalOption}>{sort}</Text>
                  </Pressable>
                ),
              )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
    paddingVertical: 7,
    paddingHorizontal: 0,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    color: 'black',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 20,
  },
  tabItem: {
    paddingVertical: 8,
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderColor: '#76B117',
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
  },
  headerBox: {
    backgroundColor: '#E9E9E9',
    width: 110,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    borderRadius: 20,
  },
  tableHeaderText: {
    fontSize: 16,
    color: '#76B117',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalOption: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default Order;
