import {useNavigation} from '@react-navigation/native';
import React, {useLayoutEffect, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  PencilIcon,
  XCircleIcon,
} from 'react-native-heroicons/outline';
import axios from 'axios';
import GenericVectorIcon from '../components/GenericVectorIcon';

const tabs = ['Pending Order', 'Confirmed Order', 'Past Order'];

export default function VendorOrderPage() {
  const [activeTab, setActiveTab] = useState('Pending Order');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [gstNumber, setGSTNumber] = useState(null);
  const [toast, setToast] = useState('');
  const navigation = useNavigation();

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };
  useEffect(() => {
    const fetchGSTNumber = async () => {
      try {
        const storedGSTNumber = await AsyncStorage.getItem('supplierGST');
        if (storedGSTNumber) {
          setGSTNumber(storedGSTNumber);
        }
      } catch (error) {
        console.log('Error Fetching Supplier GST: ', error);
      }
    };
    fetchGSTNumber();
  }, []);
  const fetchOrders = async () => {
    try {
      let response;
      if (activeTab === 'Pending Order') {
        response = await axios.post('https://api-v7quhc5aza-uc.a.run.app/getPendingOrders', {"supplierGST": gstNumber});
        setPendingOrders(response.data);
      } else if (activeTab === 'Confirmed Order') {
        response = await axios.post('https://api-v7quhc5aza-uc.a.run.app/getSupplierConfirmedOrders', {"supplierGST": gstNumber});
        setConfirmedOrders(response.data);
      } else if (activeTab === 'Past Order') {
        response = await axios.post('https://api-v7quhc5aza-uc.a.run.app/getCompletedOrders', {"supplierGST": gstNumber});
        setPastOrders(response.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Failed to fetch orders.');
    }
  };

  useLayoutEffect(() => {
    if(gstNumber){
      fetchOrders();
    }
  }, [activeTab]);

  const handleAcceptPress = order => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const confirmAccept = async () => {
    if (!selectedOrder) return;
    try {
      if (activeTab === 'Pending Order') {
        await axios.post('https://api-v7quhc5aza-uc.a.run.app/acceptOrder', {
          orderId: selectedOrder.id,
          supplierGST: gstNumber,
        });
        showToast(`Confirmed\nOrder from ${selectedOrder.name} is confirmed`);
      } else if (activeTab === 'Confirmed Order') {
        await axios.post('https://api-v7quhc5aza-uc.a.run.app/orderDelivered', {
          orderId: selectedOrder.id,
          supplierGST: gstNumber,
        });
        showToast(`Order from ${selectedOrder.name} has been dispatched`);
      }
      setModalVisible(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Accept error:', err);
      showToast('Action failed');
    }
  };

  const confirmRejection = () => {
    if (activeTab === 'Pending Order') {
      const updated = pendingOrders.filter(o => o.id !== selectedOrder?.id);
      setPendingOrders(updated);
      showToast(`You rejected the order from ${selectedOrder?.name}`);
    }
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const renderOrder = order => (
    <View style={styles.card}>
      <View style={styles.orderItem}>
        <View style={styles.vendorInfo}>
          <Image
            source={require('../Images/VendorProfileImage.png')}
            style={{width: 50, height: 50, borderRadius: 25}}
          />
          <View>
            <Text style={styles.vendorName}>{order.name}</Text>
            {activeTab === 'Pending Order' && (
              <TouchableOpacity style={styles.chatBtn}>
                <Text style={{color: 'white'}}>View Chat</Text>
              </TouchableOpacity>
            )}
            {activeTab === 'Confirmed Order' && (
              <Text style={styles.confirmedText}>Confirmed</Text>
            )}
            {activeTab === 'Past Order' && (
              <Text style={styles.confirmedText}>Completed</Text>
            )}
          </View>
        </View>

        {activeTab === 'Pending Order' && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleAcceptPress(order)}>
              <CheckCircleIcon size={36} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmRejection}>
              <XCircleIcon size={36} color="red" />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Confirmed Order' && (
          <View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAcceptPress(order)}>
              <Text style={styles.actionText}>Dispatch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Past Order' && (
          <View>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Download Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {activeTab === 'Pending Order' && (
        <View style={styles.commentBox}>
          <PencilIcon size={24} color="#76B117" strokeWidth={3} />
          <TextInput
            placeholder="Add a comment"
            style={{flex: 1, paddingVertical: 4}}
          />
        </View>
      )}
    </View>
  );

  const getCurrentOrders = () => {
    if (activeTab === 'Pending Order') return pendingOrders;
    if (activeTab === 'Confirmed Order') return confirmedOrders;
    return pastOrders;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ChevronLeftIcon size={20} strokeWidth={2} />
        <Text style={styles.heading}>Order</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search Vendor or Order ID..."
      />

      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tab, activeTab === tab && styles.activeTab]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getCurrentOrders()}
        keyExtractor={item => item.id}
        renderItem={({item}) => renderOrder(item)}
        contentContainerStyle={{paddingBottom: 100}}
      />

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{position: 'absolute', top: 10, right: 10}}>
              <GenericVectorIcon
                name={'cross'}
                type={'Entypo'}
                color="#757575"
                size={30}
              />
            </TouchableOpacity>
            <Text style={styles.modalText}>
              Do you want to{' '}
              <Text style={{color: '#76B117'}}>
                {activeTab === 'Pending Order' ? 'accept' : 'dispatch'}
              </Text>{' '}
              the order from{' '}
              <Text style={{color: '#76B117'}}>{selectedOrder?.name}?</Text>
            </Text>
            <View style={{flexDirection: 'row', gap: 60}}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmAccept}>
                <CheckCircleIcon size={36} color="green" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}>
                <XCircleIcon size={36} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {toast !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 16},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: '1%',
  },
  heading: {fontSize: 22, fontWeight: 'bold', marginLeft: '3%'},
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  tabs: {flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16},
  tab: {
    fontSize: 16,
    padding: 8,
    color: '#76B117',
    fontWeight: '500',
    width: '80%',
    textAlign: 'center',
  },
  activeTab: {
    color: 'green',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderColor: '#76B117',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    width: '100%',
  },
  vendorInfo: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginLeft: -20,
  },
  vendorName: {fontSize: 16, fontWeight: '500'},
  chatBtn: {
    backgroundColor: '#76B117',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    height: 26,
    width: 100,
    marginTop: '12%',
  },
  confirmedText: {color: '#FBBC05', fontWeight: '500', fontSize: 14},
  actions: {flexDirection: 'row'},
  actionButton: {
    borderColor: '#76B117',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {color: 'green', fontWeight: '600'},
  commentBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C8C8C8',
    paddingVertical: '3%',
    borderRadius: 10,
    paddingHorizontal: '4%',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: '5%',
  },
  modalButton: {padding: 10, borderRadius: 20},
  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#00ED51',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
