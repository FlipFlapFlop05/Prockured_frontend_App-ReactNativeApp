import React, {useEffect, useState, useCallback, useLayoutEffect} from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { ChevronLeftIcon, CheckCircleIcon, XCircleIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database, firebase } from '../Firebase/firebase';


const BASE_URL = 'https://api-v7quhc5aza-uc.a.run.app';

const endpoints = {
  pending: '/getPendingOrders',
  confirmed: '/getSupplierConfirmedOrders',
  past: '/getCompletedOrders',
  accept: '/acceptOrder',
  dispatch: '/orderDelivered',
  clientProfile: '/getClient',
};


const tabs = ['Pending Order', 'Confirmed Order', 'Past Order'];

export default function VendorOrderPage() {
   const [activeTab, setActiveTab] = useState(tabs[0]);
  const navigation = useNavigation();

  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [featureNotAvailableModalVisible, setFeatureNotAvailableModalVisible] = useState(false);

  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [supplierGST, setSupplierGST] = useState('');
  const [isGSTLoaded, setIsGSTLoaded] = useState(false);

  const [clientCache, setClientCache] = useState({});

  const database = firebase.database();

  useEffect(() => {
    const loadSupplierGST = async () => {
      try {
        const gst = await AsyncStorage.getItem('supplierGST');
        if (gst) {
          setSupplierGST(gst);
        }
      } catch (error) {
        console.error('Failed to load supplier GST from AsyncStorage', error);
      } finally {
        setIsGSTLoaded(true);
      }
    };
    loadSupplierGST();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const genericFetch = async (path, payload) => {
    try {
      const { data } = await axios.post(BASE_URL + path, payload);

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.orders)) return data.orders;
      if (Array.isArray(data?.list)) return data.list;

      if (typeof data?.data === 'object' && data?.data !== null) {
        return Object.entries(data.data).map(([key, obj]) => ({
          ...obj,
          orderId: obj.Order_ID ?? obj.orderId ?? key,
          clientGST: obj.clientGST ?? obj.clientGst ?? obj.gst ?? '',
        }));
      }

      console.warn('Unexpected payload shape for', path, data);
      return [];
    } catch (error) {
      console.error('Error in genericFetch:', error.message || error);
      throw error;
    }
  };

  const normaliseOrders = (arr = []) =>
    arr.map((o, idx) => {
      const rawTimestamp = o.timestamp ?? o.createdAt ?? o.orderDate ?? o.OrderDate;
      let timestamp = rawTimestamp ? new Date(rawTimestamp) : new Date();
      if (isNaN(timestamp.getTime())) timestamp = new Date();

      return {
        ...o,
        orderId: o.orderId ?? o.id ?? o.Order_ID ?? o.order_ID ?? `temp-${idx}`,
        timestamp: timestamp,
      };
  });


  const fetchClientProfile = useCallback(
    async (clientGST, clientPhone) => {
      const cacheKey = clientGST || clientPhone;
      if (!cacheKey) return {};

      if (clientCache[cacheKey]) return clientCache[cacheKey];

      let profile = {};

      try {
        if (clientGST) {
          const { data } = await axios.get(`${BASE_URL}${endpoints.clientProfile}/${clientGST}`);
          profile = data;
        } else if (clientPhone) {
          const { data } = await axios.get(`${BASE_URL}${endpoints.clientProfile}/${clientPhone}`);
          profile = data;
        }

        setClientCache((prev) => ({ ...prev, [cacheKey]: profile }));
        return profile;
      } catch (error) {
        console.warn(`Could not fetch client profile for ${cacheKey}`, error?.message);
        return {};
      }
    },
    [clientCache]
  );


  const enrichOrders = useCallback(
    async (orders) => {
      if (!Array.isArray(orders)) return [];

      return Promise.all(
        orders.map(async (order) => {
          const alreadyHasName = order.clientName || order.businessName;
          if (alreadyHasName) return order;

          const profile = await fetchClientProfile(order.clientGST, order.clientPhone);

          return {
            ...order,
            clientName: profile?.name || profile?.Name || order.clientGST,
            businessName: profile?.businessName || profile?.name || order.clientGST,
            clientAvatar: profile?.avatarUrl,
          };
        })
      );
    },
    [fetchClientProfile]
  );


   const fetchOrdersGroup = useCallback(async () => {
    if (!supplierGST) {
      console.log('Supplier GST not available, skipping order fetch.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [rawPending, rawConfirmed, rawPast] = await Promise.all([
        genericFetch(endpoints.pending, { supplierGST }),
        genericFetch(endpoints.confirmed, { supplierGst: supplierGST }),
        genericFetch(endpoints.past, { supplierGST }),
      ]);

      const [pending, confirmed, past] = await Promise.all([
        enrichOrders(normaliseOrders(rawPending)),
        enrichOrders(normaliseOrders(rawConfirmed)),
        enrichOrders(normaliseOrders(rawPast)),
      ]);

      setPendingOrders(pending);
      setConfirmedOrders(confirmed);
      setPastOrders(past);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  }, [enrichOrders, supplierGST]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrdersGroup();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isGSTLoaded && supplierGST) {
      fetchOrdersGroup();
    } else if (isGSTLoaded && !supplierGST) {
      console.warn('No supplier GST found in AsyncStorage. Orders will not be fetched.');
    }
  }, [isGSTLoaded, supplierGST, fetchOrdersGroup]);


  const acceptOrder = async (order) => {
    try {
      await genericFetch(endpoints.accept, {
        supplierGST: supplierGST,
        orderId: order.orderId,
        clientGST: order.clientGST,
      });

      const orderDate = order.timestamp ? new Date(order.timestamp).toLocaleDateString('en-GB') : 'N/A';
      const deliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');

      const summaryMessageText = `Your order (ID: ${order.orderId}) has been accepted!\nOrder Date: ${orderDate}\nEstimated Delivery: ${deliveryDate}`;

      const chatIDForFirebase = [supplierGST, order.clientGST].sort().join('_');
      const chatMessagesRef = database.ref(`chats/${chatIDForFirebase}/messages`);
      const chatMetadataRef = database.ref(`chats/${chatIDForFirebase}`);

      const newMessagePayload = {
        sender: supplierGST,
        message: summaryMessageText,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        type: 'text',
      };

      try {
        await chatMessagesRef.push(newMessagePayload);
        await chatMetadataRef.update({
          lastMessageText: summaryMessageText,
          lastMessageTimestamp: firebase.database.ServerValue.TIMESTAMP,
          lastMessageSender: supplierGST,
        });
        console.log('Order summary message sent to Firebase successfully.');
      } catch (firebaseError) {
        console.error('Firebase Send Message Error:', firebaseError);
        Alert.alert('Firebase Chat Error', `Failed to send order summary via Firebase: ${firebaseError.message}`);
      }

      showToast(`Order from ${order.businessName || order.clientGST} is confirmed`);
      await fetchOrdersGroup();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to accept order.');
    }
  };

  const dispatchOrder = async (order) => {
    try {
      await genericFetch(endpoints.dispatch, {
        supplierGST: supplierGST,
        orderId: order.orderId,
        clientGST: order.clientGST,
      });

      const orderDate = order.timestamp ? new Date(order.timestamp).toLocaleDateString('en-GB') : 'N/A';
      const deliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');

      const summaryMessageText = `Your order (ID: ${order.orderId}) has been Dispatched!\nOrder Date: ${orderDate}\nEstimated Delivery: ${deliveryDate}`;

      const chatIDForFirebase = [supplierGST, order.clientGST].sort().join('_');
      const chatMessagesRef = database.ref(`chats/${chatIDForFirebase}/messages`);
      const chatMetadataRef = database.ref(`chats/${chatIDForFirebase}`);

      const newMessagePayload = {
        sender: supplierGST,
        message: summaryMessageText,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        type: 'text',
      };

      try {
        await chatMessagesRef.push(newMessagePayload);
        await chatMetadataRef.update({
          lastMessageText: summaryMessageText,
          lastMessageTimestamp: firebase.database.ServerValue.TIMESTAMP,
          lastMessageSender: supplierGST,
        });
        console.log('Order summary message sent to Firebase successfully.');
      } catch (firebaseError) {
        console.error('Firebase Send Message Error:', firebaseError);
        Alert.alert('Firebase Chat Error', `Failed to send order summary via Firebase: ${firebaseError.message}`);
      }

      showToast(`Order from ${order.businessName || order.clientGST} has been dispatched`);
      await fetchOrdersGroup();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to dispatch order.');
    }
  };

  const handleAcceptPress = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const confirmAccept = () => {
    if (!selectedOrder) return;

    if (activeTab === 'Pending Order') {
      acceptOrder(selectedOrder);
    } else if (activeTab === 'Confirmed Order') {
      dispatchOrder(selectedOrder);
    }

    setModalVisible(false);
    setSelectedOrder(null);
  };

  const confirmRejection = () => {
    showToast(`You rejected the order from ${selectedOrder?.businessName || selectedOrder?.clientGST}`);
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const getCurrentOrders = () => {
    if (activeTab === 'Pending Order') return pendingOrders;
    if (activeTab === 'Confirmed Order') return confirmedOrders;
    return pastOrders;
  };

  // Function to handle "Download Invoice" click
  const handleDownloadInvoice = () => {
    setFeatureNotAvailableModalVisible(true);
  };

  // Function to handle "View Summary" click
  const handleViewSummary = (order) => {
    navigation.navigate('View Summary', {
      supplierGST: supplierGST,
      clientGST: order.clientGST,
      orderId: order.orderId,
    });
  };

  const renderOrder = ({ item: order }) => (
    <View style={styles.card} key={order.orderId}>
      <View style={styles.orderItem}>
        {/* CLIENT INFO */}
        <View style={styles.vendorInfo}>
          <Image
            source={order.clientAvatar ? { uri: order.clientAvatar } : require('../Images/VendorProfileImage.png')}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
          <View>
            <Text style={styles.vendorName} numberOfLines={1}>
              {order.clientName || order.businessName || order.BusinessName || order.name || order.clientGST || order.orderId}
            </Text>
            {activeTab === 'Pending Order' && (
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() =>
                  navigation.navigate('CustomerChatDetail', {
                    customerGST: order.clientGST,
                    vendorGST: supplierGST,
                    customerName: order.clientName || order.businessName || order.clientGST,
                    currentUserGST: supplierGST,
                  })
                }
              >
                <Text style={{ color: 'white' }}>View Chat</Text>
              </TouchableOpacity>
            )}

            {activeTab === 'Confirmed Order' && <Text style={styles.confirmedText}>Confirmed</Text>}
            {activeTab === 'Past Order' && <Text style={styles.confirmedText}>Completed</Text>}
          </View>
        </View>

        {/* ACTIONS */}
        {activeTab === 'Pending Order' && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleAcceptPress(order)}>
              <CheckCircleIcon size={30} color="#76B117" strokeWidth={3} />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmRejection}>
              <XCircleIcon size={30} color="red" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Confirmed Order' && (
          <View>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleAcceptPress(order)}>
              <Text style={styles.actionText}>Dispatch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleViewSummary(order)}>
              <Text style={styles.actionText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Past Order' && (
          <View>
            <TouchableOpacity style={styles.actionButton} onPress={handleDownloadInvoice}>
              <Text style={styles.actionText}>Download Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleViewSummary(order)}>
              <Text style={styles.actionText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Comment box only for pending */}
      {activeTab === 'Pending Order' && (
        <View style={styles.commentBox}>
          <Text style={{ marginRight: 4 }}>📝</Text>
          <TextInput placeholder="Add a comment" style={{ flex: 1, paddingVertical: 4 }} />
        </View>
      )}
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Orders',
      headerStyle: {
        backgroundColor: '#f8f8f8',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
        justifyContent: 'center',
      },
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 13 }}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Search */}
      <TextInput style={styles.search} placeholder="Search Vendor or Order ID..." placeholderTextColor={'black'} />

      {/* TABS */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tab, activeTab === tab && styles.activeTab]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={getCurrentOrders()}
          keyExtractor={(item) => item.orderId.toString()}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#757575' }}>No orders in this section</Text>
          )}
        />
      )}

      {/* ACTION MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ position: 'absolute', top: 10, right: 10 }}>
              <Text style={{ fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalText}>
              Do you want to{' '}
              <Text style={{ color: '#76B117' }}>{activeTab === 'Pending Order' ? 'accept' : 'dispatch'}</Text> the order from{' '}
              <Text style={{ color: '#76B117' }}>{selectedOrder?.clientName || selectedOrder?.orderId}</Text>?
            </Text>
            <View style={{ flexDirection: 'row', gap: 60 }}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmAccept}>
                <CheckCircleIcon size={30} color="#76B117" strokeWidth={3} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <XCircleIcon size={30} color="red" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FEATURE NOT AVAILABLE MODAL */}
      <Modal visible={featureNotAvailableModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TouchableOpacity onPress={() => setFeatureNotAvailableModalVisible(false)} style={{ position: 'absolute', top: 10, right: 10 }}>
              <Text style={{ fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalText}>
              <Text style={{ color: '#76B117', fontWeight: 'bold' }}>Feature Not Available</Text>
            </Text>
            <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 10 }}>
              This feature is under development and will be available soon.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 20, backgroundColor: '#76B117', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }]}
              onPress={() => setFeatureNotAvailableModalVisible(false)}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TOAST */}
      {toast !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  tab: {
    fontSize: 16,
    padding: 8,
    color: '#76B117',
    fontWeight: '500',
    textAlign: 'center'
  },
  activeTab: {
    color: 'green',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderColor: '#76B117'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%'
  },
  vendorInfo: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '500',
    maxWidth: 140
  },
  chatBtn: {
    backgroundColor: '#76B117',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    height: 26,
    width: 100,
    marginTop: 4
  },
  confirmedText: {
    color: '#FBBC05',
    fontWeight: '500',
    fontSize: 14
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    borderColor: '#76B117',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10
  },
  actionText: {
    color: 'green',
    fontWeight: '600'
  },
  commentBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C8C8C8',
    paddingVertical: '3%',
    borderRadius: 10,
    paddingHorizontal: '4%',
    alignItems: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%'
  },
  modalText: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: '5%'
  },
  modalButton: {
    padding: 10,
    borderRadius: 20
  },
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
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  toastText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
});