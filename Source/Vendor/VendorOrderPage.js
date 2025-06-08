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

const BASE_URL = 'https://api-v7quhc5aza-uc.a.run.app';
const SUPPLIER_GST = 'Haha'; // TODO ➜ replace with real GST or read from secure storage

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

  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [supplierGST, setSupplierGST] = useState('');

  const [clientCache, setClientCache] = useState({});
  const fetchSupplierGST = async () => {
    const supplierGst = await AsyncStorage.getItem('supplierGST');
    if (supplierGst) {
      setSupplierGST(supplierGst);
    }
  }
  useEffect(() => {
    fetchSupplierGST();
  })

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

      // 👈 replace the whole if-block that handles data.data
      if (typeof data?.data === 'object' && data?.data !== null) {
        // turn { "2": {…}, "4": {…} } → [ { orderId:"2", … }, { orderId:"4", … } ]
        return Object.entries(data.data).map(([key, obj]) => ({
          ...obj,
          orderId: obj.Order_ID ?? obj.orderId ?? key,   // guarantee an orderId
          clientGST: obj.clientGST ?? obj.clientGst ?? obj.gst ?? '', // normalise here too if you like
        }));
      }

      console.warn('Unexpected payload shape for', path, data);
      return [];
    } catch (error) {
      console.error('Error in genericFetch:', error.message || error);
      return [];
    }
  };

  const normaliseOrders = (arr = []) => arr.map((o, idx) => ({
        ...o,
        // keep whatever the backend sent but guarantee orderId exists
        orderId:
            o.orderId ??
            o.id ??
            o.Order_ID ??
            o.order_ID ??
            `temp-${idx}`,        // fallback so .toString() always works
      }));

  const fetchClientProfile = useCallback(async (clientGST) => {
        if (!clientGST) return {};
        if (clientCache[clientGST]) return clientCache[clientGST];

        try {
          const {data} = await axios.get(`${BASE_URL}${endpoints.clientProfile}/${clientGST}`);
          setClientCache((prev) => ({...prev, [clientGST]: data}));
          return data;
        } catch (error) {
          console.warn('Could not fetch client profile for', clientGST, error?.message);
          return {};
        }
      },
      [clientCache],
  );

  const enrichOrders = useCallback(async (orders) => {
    if (!Array.isArray(orders)) return [];

    return Promise.all(
        orders.map(async (order) => {
          if (order.clientGST && !order.clientName) {
            const profile = await fetchClientProfile(order.clientGST);

            return {
              ...order,
              clientName:     profile?.name || profile?.businessName || order.clientGST,
              businessName:   order.businessName ?? profile?.businessName ?? profile?.name,
              clientAvatar:   profile?.avatarUrl,
            };
          }
          return order;
        }),
    );
  }, [fetchClientProfile]);


  const fetchOrdersGroup = useCallback(async () => {
    setLoading(true);
    try {
      const [rawPending, rawConfirmed, rawPast] = await Promise.all([
        genericFetch(endpoints.pending, {supplierGST: SUPPLIER_GST}),
        genericFetch(endpoints.confirmed, {supplierGst: SUPPLIER_GST}),
        genericFetch(endpoints.past, {supplierGST: SUPPLIER_GST}),
      ]);

      const [pending, confirmed, past] = await Promise.all([
        enrichOrders(rawPending),
        enrichOrders(rawConfirmed),
        enrichOrders(rawPast),
      ]);

      setPendingOrders(pending);
      setConfirmedOrders(confirmed);
      setPastOrders(past);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [enrichOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrdersGroup();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrdersGroup();
  }, [fetchOrdersGroup]);


  const acceptOrder = async (order) => {
    try {
      await genericFetch(endpoints.accept, {
        supplierGST: SUPPLIER_GST,
        orderId: order.orderId || order.id,
        clientGST: order.clientGST,
      });
      showToast(O`rder from ${order.businessName || order.clientGST} is confirmed`);
      await fetchOrdersGroup();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  const dispatchOrder = async (order) => {
    try {
      await genericFetch(endpoints.dispatch, {
        supplierGST: SUPPLIER_GST,
        orderId: order.orderId || order.id || order.OrderID || order.OrderId,
        clientGST: order.clientGST,
      });
      showToast(`Order from ${order.businessName || order.clientGST} has been dispatched`);
      await fetchOrdersGroup();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
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

  const renderOrder = ({item: order}) => (
      <View style={styles.card} key={order.orderId || order.id}>
        <View style={styles.orderItem}>
          {/* CLIENT INFO */}
          <View style={styles.vendorInfo}>
            <Image
                source={order.clientAvatar ? {uri: order.clientAvatar} : require('../Images/VendorProfileImage.png')}
                style={{width: 50, height: 50, borderRadius: 25}}
            />
            <View>
              <Text style={styles.vendorName} numberOfLines={1}>
                {order.businessName
                    || order.clientName
                    || order.name
                    || order.clientGST
                    || order.Order_ID}
              </Text>


              {activeTab === 'Pending Order' && (
                  <TouchableOpacity style={styles.chatBtn}>
                    <Text style={{color: 'white'}}>View Chat</Text>
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

        {/* Comment box only for pending */}
        {activeTab === 'Pending Order' && (
            <View style={styles.commentBox}>
              <Text style={{marginRight: 4}}>📝</Text>
              <TextInput placeholder="Add a comment" style={{flex: 1, paddingVertical: 4}} />
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{paddingHorizontal: 13}}>
            <ChevronLeftIcon size={28} color="#333" />
          </TouchableOpacity>
        ),
      });
    }, [navigation]);

  return (
      <View style={styles.container}>

        {/* Search */}
        <TextInput style={styles.search} placeholder="Search Vendor or Order ID..." />

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
            <ActivityIndicator size="large" style={{marginTop: 32}} />
        ) : (
            <FlatList
                data={getCurrentOrders()}
                keyExtractor={(item, index) =>
                    (item.orderId ?? item.id ?? item.Order_ID ?? index).toString()
                }
                renderItem={renderOrder}
                contentContainerStyle={{paddingBottom: 100}}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={() => (
                    <Text style={{textAlign: 'center', marginTop: 40, color: '#757575'}}>
                      No orders in this section
                    </Text>
                )}
            />
        )}

        {/* ACTION MODAL */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{position: 'absolute', top: 10, right: 10}}>
                <Text style={{fontSize: 18}}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalText}>
                Do you want to{' '}
                <Text style={{color: '#76B117'}}>
                  {activeTab === 'Pending Order' ? 'accept' : 'dispatch'}
                </Text>{' '}
                the order from{' '}
                <Text style={{color: '#76B117'}}>{selectedOrder?.clientName || selectedOrder?.orderId}</Text>?
              </Text>
              <View style={{flexDirection: 'row', gap: 60}}>
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