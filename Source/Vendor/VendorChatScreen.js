import React,
      {
          useState,
          useEffect,
          useRef
      } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
  Dimensions,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  BellIcon,
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftEllipsisIcon
} from 'react-native-heroicons/outline';
import { database } from '../Firebase/firebase';
import { worksData } from '../Constant/constant';

const { width } = Dimensions.get('window');

const categories = [];

// --- Customer Chat Item Component (MODIFIED) ---
const CustomerChatItem = ({ customer, onPress }) => {
  // Determine the last message/order for display
  const lastDisplayInfo = customer.lastChatMessage
    ? `${customer.lastMessageSender === customer.currentVendorGST ? 'You: ' : ''}${customer.lastChatMessage}` // Add "You: " if it's the current vendor's last message
    : `Last Order: ${customer.lastOrderTotal} on ${customer.lastOrderDate}`;

  return (
    <TouchableOpacity style={styles.customerCard} onPress={() => onPress(customer)}>
      <View style={styles.customerAvatar}>
        <Text style={styles.customerAvatarText}>
          {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
        </Text>
      </View>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{customer.businessName || 'Unknown Customer'}</Text>
        <Text style={styles.lastOrderInfo} numberOfLines={1}>
          {lastDisplayInfo}
        </Text>
      </View>
      <View style={styles.chatIconContainer}>
        <ChatBubbleLeftEllipsisIcon size={24} color={'#76B117'} />
        {customer.unreadCount > 0 && ( // <--- NEW: Unread badge
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{customer.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
// --- End Customer Chat Item Component ---

export default function VendorChatScreen() {
  const navigation = useNavigation();
  const [isWorkDataVisible, setWorkDataVisible] = useState(false);
  const [gstNumber, setGstNumber] = useState(''); // Vendor's GST
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch supplier GST from AsyncStorage
  useEffect(() => {
    const getSupplierGst = async () => {
      try {
        const storedGst = await AsyncStorage.getItem('supplierGST');
        if (storedGst) {
          setGstNumber(storedGst);
        } else {
          console.warn('supplierGST not found in AsyncStorage');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching supplierGST from AsyncStorage:', error);
        setLoading(false);
      }
    };
    getSupplierGst();
  }, []);

  // Fetch customer list and establish Firebase listeners for chats
  useEffect(() => {
  let unsubscribeFirebaseListeners = () => {}; // Initialize a no-op function for cleanup

  const fetchDataAndListenToChats = async () => {
    if (!gstNumber) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/getCustomersList',
        { supplierGST: gstNumber },
      );

      if (response.status === 200 && response.data && response.data.clients) {
        const clientsData = response.data.clients;
        const initialTransformedClients = [];
        const firebaseListenersCleanups = []; // To store cleanup functions for Firebase listeners

        for (const clientGstKey in clientsData) {
          const client = clientsData[clientGstKey];
          let chatHistory = [];
          let lastOrderTotal = 'N/A';
          let lastOrderDate = 'N/A';
          let lastChatMessage = '';

          // Process Open_Orders into chat history (as 'order' type messages)
          const openOrders = client.Open_Orders || {};
          Object.keys(openOrders).forEach(orderId => {
            const orderSpecificData = openOrders[orderId];
            const supplierGSTForOrder = orderSpecificData.supplierGST;

            if (supplierGSTForOrder && orderSpecificData[supplierGSTForOrder]) {
              const supplierOrderDetails = orderSpecificData[supplierGSTForOrder];
              const orderMessage = {
                id: orderId,
                sender: client.gst, // Customer is the sender of the order request
                type: 'order',
                order: {
                  orderId: orderId,
                  date: supplierOrderDetails.OrderDate || 'N/A',
                  status: supplierOrderDetails.Status || 'Pending',
                  deliveryDate: supplierOrderDetails.DeliveryDate || 'N/A',
                  totalAmount: Number(supplierOrderDetails.totalAmount) || 0,
                  items: Array.isArray(supplierOrderDetails.items) ? supplierOrderDetails.items : [],
                  notes: supplierOrderDetails.notes || '',
                },
                timestamp: new Date(orderSpecificData.createdAt || supplierOrderDetails.OrderDate || Date.now()),
              };
              chatHistory.push(orderMessage);
            }
          });

          // Determine last order details for display on the customer card
          const lastOrderIdFromOpenOrders = Object.keys(client.Open_Orders || {})[0];
          if (lastOrderIdFromOpenOrders && openOrders[lastOrderIdFromOpenOrders]) {
            const orderSpecificData = openOrders[lastOrderIdFromOpenOrders];
            const supplierGSTForLastOrder = orderSpecificData.supplierGST;
            if (supplierGSTForLastOrder && orderSpecificData[supplierGSTForLastOrder]) {
              const supplierOrderDetails = orderSpecificData[supplierGSTForLastOrder];
              lastOrderTotal = supplierOrderDetails.totalAmount !== undefined
                ? `₹ ${Number(supplierOrderDetails.totalAmount).toFixed(2)}`
                : 'N/A';
              lastOrderDate = supplierOrderDetails.OrderDate || 'N/A';
            }
          }

          const customerGST = client.gst;
          const currentChatId = [gstNumber, customerGST].sort().join('_');

          initialTransformedClients.push({
            id: clientGstKey,
            gst: client.gst,
            name: client.Name,
            businessName: client.BusinessName,
            phone: client.phone,
            email: client.email,
            country: client.country,
            state: client.state,
            pincode: client.pincode,
            shippingAddress: client.shippingAddress,
            billingAddress: client.billingAddress,
            lastOrderTotal: lastOrderTotal,
            lastOrderDate: lastOrderDate,
            chatHistory: chatHistory, // Initial orders, Firebase messages will be merged in the detail screen
            lastChatMessage: lastChatMessage,
            unreadCount: 0, // Initialize unread count
            lastMessageSender: '', // To store the sender of the last message
            currentVendorGST: gstNumber, // Pass vendor's GST to CustomerChatItem for "You:" logic
          });
        }

        setCustomerList(initialTransformedClients);
        setLoading(false);

        // Now, set up real-time Firebase listeners for chat metadata and unread counts
        initialTransformedClients.forEach(customer => {
          const currentChatId = [gstNumber, customer.gst].sort().join('_');
          const chatMetadataRef = database.ref(`chats/${currentChatId}`);

          const onChatMetadataValue = chatMetadataRef.on('value', (snapshot) => {
            const chatData = snapshot.val();
            setCustomerList(prevList =>
              prevList.map(c => {
                if (c.id === customer.id) {
                  const newUnreadCount = chatData?.participants?.[gstNumber]?.unreadCount || 0;
                  return {
                    ...c,
                    lastChatMessage: chatData?.lastMessageText || '',
                    lastMessageSender: chatData?.lastMessageSender || '',
                    unreadCount: newUnreadCount,
                  };
                }
                return c;
              })
            );
          });
          firebaseListenersCleanups.push(() => chatMetadataRef.off('value', onChatMetadataValue));
        });

        // This function will be returned by the useEffect, which will then be called on cleanup
        unsubscribeFirebaseListeners = () => {
          firebaseListenersCleanups.forEach(cleanup => cleanup());
        };

      } else {
        Alert.alert('Error', 'No clients found for this supplier or unexpected response structure.');
        console.log('API Response:', JSON.stringify(response.data, null, 2));
        setCustomerList([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching customers list or Firebase data:', error);
      Alert.alert('Error', `Failed to fetch customers: ${error.message}`);
      setCustomerList([]);
      setLoading(false);
    }
  };

  // Call the async function here
  fetchDataAndListenToChats();

  // Return the cleanup function directly from useEffect
  return () => {
    unsubscribeFirebaseListeners(); // Call the stored cleanup function
  };
}, [gstNumber]); // Depend on gstNumber


  const renderWorkItemModal = ({ item }) => (
    <View style={styles.workCard}>
      <Image source={item.image} style={{ width: width * 0.4, height: width * 0.3 }} />
      <Text style={styles.workTitle}>{item.title}</Text>
      <Text style={styles.workDescription}>{item.description}</Text>
    </View>
  );

  // Filter customers based on search term
  const filteredCustomers = customerList
    .filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
        (customer.businessName && customer.businessName.toLowerCase().includes(searchLower)) ||
        (customer.phone && customer.phone.includes(searchLower))
      );
    })
    .sort((a, b) => {
      // Sort by unread messages first, then by last message timestamp (descending)
      // Note: We don't have lastMessageTimestamp here, only lastChatMessage.
      // For proper sorting, Firebase chat metadata should include lastMessageTimestamp.
      // For now, sorting by unread count is primary.
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      // If both have unread or neither, sort by something else, e.g., businessName
      return (a.businessName || a.name || '').localeCompare(b.businessName || b.name || '');
    });


  const handleCustomerChatPress = (customer) => {
    navigation.navigate('CustomerChatDetail', {
      customerGST: customer.gst,
      vendorGST: gstNumber, // Your GST as the vendor
      customerName: customer.businessName || customer.name,
      initialMessages: customer.chatHistory, // Initial orders, Firebase messages will be merged there
      currentUserGST: gstNumber, // The current user (vendor)'s GST
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerIconView}>
        <TouchableOpacity onPress={() => setWorkDataVisible(true)}>
          <BellIcon size={30} color={'#a9a9a9'} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Supplier Notification And Search')}>
          <QuestionMarkCircleIcon size={30} color={'#a9a9a9'} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isWorkDataVisible}
        onRequestClose={() => setWorkDataVisible(!isWorkDataVisible)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={worksData}
              renderItem={renderWorkItemModal}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.flatListContent}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setWorkDataVisible(!isWorkDataVisible)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.chatScreenTextInputView}>
        <MagnifyingGlassIcon size={20} color={'black'} strokeWidth={3} style={styles.chatScreenTextInputViewIcon} />
        <TextInput
          placeholder={'Search any Customer'}
          style={styles.chatScreenTextInput}
          placeholderTextColor={'black'}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.mainContainer}>
        <Text style={styles.allChatText}>All Chats</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#76B117" />
            <Text style={styles.loadingText}>Loading Customers...</Text>
          </View>
        ) : filteredCustomers.length > 0 ? (
          <FlatList
            data={filteredCustomers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <CustomerChatItem customer={item} onPress={handleCustomerChatPress} />}
            contentContainerStyle={styles.customerListContent}
          />
        ) : (
          <View style={styles.emptyChatContainer}>
            <Image
              source={require('../Images/VendorHomePage.png')}
              style={styles.imageContainer}
            />
            <View style={styles.emptyChatTextContainer}>
              <ChatBubbleLeftEllipsisIcon size={30} color={'#757575'} />
              <Text style={styles.emptyChatText}>Your Chat is Empty</Text>
              <Text style={styles.emptyChatSubText}>
                No active conversations yet.
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerIconView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    maxHeight: '70%',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#76B117',
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatScreenTextInputView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  chatScreenTextInputViewIcon: {
    marginRight: 10,
  },
  chatScreenTextInput: {
    flex: 1,
    height: 45,
    color: 'black',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  allChatText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  emptyChatTextContainer: {
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 10,
  },
  emptyChatSubText: {
    fontSize: 14,
    color: '#a9a9a9',
    marginTop: 5,
    textAlign: 'center',
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#76B117',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  customerAvatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lastOrderInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  chatIconContainer: {
    marginLeft: 10,
    position: 'relative', // For absolute positioning of the badge
  },
  customerListContent: {
    paddingBottom: 20,
  },
  workCard: {
    alignItems: 'center',
    marginBottom: 15,
  },
  workTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  workDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // NEW STYLES for unread badge
  unreadBadge: {
    position: 'absolute',
    top: -5,  // Adjust positioning as needed
    right: -5, // Adjust positioning as needed
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4, // Add padding for double-digit numbers
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});