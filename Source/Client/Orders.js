import React, {useLayoutEffect, useState} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import {orders} from '../Constant/constant';
import {useNavigation} from '@react-navigation/native';

const Order = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('24-06-2024');
  const [selectedCategory, setSelectedCategory] = useState('Vegetables');
  const [selectedStatus, setSelectedStatus] = useState('Pending');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'sort' | 'date' | 'category'

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
        // color: 'white',
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

  const filteredOrders = orders.filter(order => {
    const searchMatch =
      order.vendor.toLowerCase().includes(searchText.toLowerCase()) ||
      order.orderValue.includes(searchText);
    const statusMatch =
      selectedStatus === 'All' || order.status === selectedStatus;
    return searchMatch && statusMatch;
  });

  const renderOrderItem = ({item}) => (
    <View style={styles.orderItem}>
      <View style={styles.orderLeft}>
        <Image source={item.logo} style={styles.logo} />
        <View>
          <Text style={styles.vendor}>{item.vendor}</Text>
          <Text style={styles.status}>{item.status}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Specific Order Screen')}>
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
    if (modalType === 'sort') {
      // You can handle actual sorting here
    } else if (modalType === 'date') {
      setSelectedDate(option);
    } else if (modalType === 'category') {
      setSelectedCategory(option);
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      {/* <View style={styles.header}>
                <Text style={styles.headerTitle}>Orders</Text>
            </View> */}

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

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View
          style={{
            backgroundColor: '#E9E9E9',
            width: 110,
            alignItems: 'center',
            height: 40,
            justifyContent: 'center',
            borderRadius: 20,
          }}>
          <Text style={styles.tableHeaderText}>Vendor Name</Text>
        </View>
        <View
          style={{
            backgroundColor: '#E9E9E9',
            width: 110,
            alignItems: 'center',
            height: 40,
            justifyContent: 'center',
            borderRadius: 20,
          }}>
          <Text style={styles.tableHeaderText}>Order Value</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{paddingBottom: 80}}
      />

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginHorizontal: 20,
    // marginVertical: 10,
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
    paddingHorizontal: 0, // Avoid double spacing since wrapper has padding
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
    color: '#76B117',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabItem: {
    color: '#6B7280',
    fontWeight: '700',
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
});

export default Order;
