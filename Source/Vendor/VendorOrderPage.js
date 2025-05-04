import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {VendorOrders} from '../Constant/constant';
import {CheckCircleIcon, XCircleIcon, PencilIcon} from 'react-native-heroicons/outline';
import {widthToDP} from 'react-native-responsive-screens';

const { width: screenWidth } = Dimensions.get('window');

const VendorOrderPage = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState('24-06-2024'); // Default date
  const [selectedCategory, setSelectedCategory] = useState('Vegetables'); // Default category
  const [selectedStatus, setSelectedStatus] = useState('Pending'); // Default status
  const [modalVisible, setModalVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [status, setStatus] = useState('Pending');

  const filteredOrders = VendorOrders.filter(order => {
    const searchMatch = order.supplier.toLowerCase().includes(searchText.toLowerCase()) || order.orderValue.includes(searchText);
    const statusMatch = selectedStatus === 'All' || order.status === selectedStatus;
    return searchMatch && statusMatch;
  });

  const handleConfirm = () => {
    setShowPopup(true);
  };

  const handleAccept = () => {
    setShowPopup(false);
    setShowSuccessMessage(true);
    setStatus("Confirmed");
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleCancel = () => {
    setShowPopup();
  }

  const handleDispatch = () => {
    setStatus("Completed");
  }

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderRow}>
      <Image source={require('../Images/VendorProfileImage.png')} style={styles.profileImage} />

      <View style={styles.vendorContainer}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text> Do you want to <Text style={{color: '#76B117', fontStyle: 'normal', fontWeight: '600'}}> confirm </Text> the order from </Text>
              <Text style={{color: '#76B117', fontStyle: 'normal', fontWeight: 'bold'}}>{item.supplier}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>



        {item.status === 'Pending' && (
          <View style={{flex: 1}}>
            <Text style={styles.orderVendor}>{item.supplier}</Text>
            <TouchableOpacity style={styles.viewChatButton}>
              <Text style={styles.viewChatButtonText}>View Chat</Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', borderWidth: 1, borderColor: 'lightgray', width: '130%', marginTop: 10, borderRadius: 20}}>
              <PencilIcon size={28} color={'#76B117'} strokeWidth={2} />
              <TextInput
                placeholder={'Search'}
                placeholderTextColor={'black'}
                style={{marginLeft: 5, height: 40, marginTop: -5}}
                keyboardType={'numeric'}
              />
            </View>
          </View>

        )}

        {item.status === 'Confirmed' && (
          <View style={styles.vendorContainer}>
            <View style={{flexDirection: 'column'}}>
              <Text style={styles.orderVendor}>{item.supplier}</Text>
              <Text style={styles.orderStatus}>Confirmed</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleDispatch}>
                <Text style={styles.actionButtonText}>Dispatch</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Summary</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {item.status === 'Past' && (
          <View style={styles.vendorContainer}>
            <View style={{flexDirection: 'column'}}>
              <Text style={styles.orderVendor}>{item.supplier}</Text>
              <Text style={styles.orderStatus}>Completed</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Download Invoice</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View Summary</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Modal visible={showPopup} transparent={true} animationType={"fade"}>
          <View>
            <Text>
              Confirm Order
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity onPress={handleAccept}>
                <CheckCircleIcon size={30} color="green" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancel}>
                <XCircleIcon size={30} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {showSuccessMessage && <Text style={styles.successMessage}>Order Confirmed!</Text>}
      </View>

      <View style={styles.iconContainer}>
        {item.status === 'Pending' && (
          <>
            <TouchableOpacity onPress={handleConfirm}>
              <CheckCircleIcon size={36} color={'#76B117'} />
            </TouchableOpacity>
            <TouchableOpacity>
              <XCircleIcon size={36} color={'red'} />
            </TouchableOpacity>
          </>
        )}
      </View>
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
  orderVendor: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontFamily: 'Montserrat'
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
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 10,
  },
  vendorContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  viewChatButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
    height: 30,
    width: screenWidth * 0.2
  },
  viewChatButtonText: {
    color: 'white',
    fontSize: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
  iconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center', width: '80%' },
  categoryText: { fontSize: 16, fontWeight: 'bold', color: 'black', textAlign: 'center', marginBottom: 10 },
  modalCloseButton: { marginTop: 10, backgroundColor: '#76B117', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  modalCloseButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default VendorOrderPage;
