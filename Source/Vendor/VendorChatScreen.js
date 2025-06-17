// VendorChatScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator, // Import for loading indicator
  Alert, // Import Alert for better error messages
} from 'react-native';
import {BellIcon} from 'react-native-heroicons/solid';
import {
  ChatBubbleLeftEllipsisIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from 'react-native-heroicons/outline';
import {worksData} from '../Constant/constant';
import {useNavigation} from '@react-navigation/native'; // Import useNavigation for navigation
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import axios from 'axios'; // Import axios

const {width} = Dimensions.get('window');

// --- Customer Chat Item Component ---
const CustomerChatItem = ({customer, onPress}) => {
  return (
    <TouchableOpacity style={styles.customerCard} onPress={() => onPress(customer)}>
      <View style={styles.customerAvatar}>
        {/* You might want to use a real avatar image here based on customer data */}
        <Text style={styles.customerAvatarText}>
          {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
        </Text>
      </View>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{customer.businessName || customer.name || 'Unknown Customer'}</Text>
        <Text style={styles.lastOrderInfo}>
          Last Order: {customer.lastOrderTotal} on {customer.lastOrderDate}
        </Text>
        {/* You can add more last message or order details here */}
      </View>
      <View style={styles.chatIconContainer}>
        <ChatBubbleLeftEllipsisIcon size={24} color={'#76B117'} />
      </View>
    </TouchableOpacity>
  );
};
// --- End Customer Chat Item Component ---

export default function VendorChatScreen() {
  const navigation = useNavigation();
  const [isWorkDataVisible, setWorkDataVisible] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

  const renderWorkItemModal = ({item}) => (
    <View style={styles.workCard}>
      <Image source={item.image} style={{width: width * 0.4, height: width * 0.3}} />
      <Text style={styles.workTitle}>{item.title}</Text>
      <Text style={styles.workDescription}>{item.description}</Text>
    </View>
  );

  // Fetch supplier GST from AsyncStorage
  useEffect(() => {
    const getSupplierGst = async () => {
      try {
        const storedGst = await AsyncStorage.getItem('supplierGST');
        if (storedGst) {
          setGstNumber(storedGst);
        } else {
          console.warn('supplierGST not found in AsyncStorage');
          setLoading(false); // No GST, so stop loading
        }
      } catch (error) {
        console.error('Error fetching supplierGST from AsyncStorage:', error);
        setLoading(false); // Error, so stop loading
      }
    };
    getSupplierGst();
  }, []);

  // Fetch customer list based on GST number and process chat history
  useEffect(() => {
    const fetchData = async () => {
      if (!gstNumber) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.post(
          'https://api-v7quhc5aza-uc.a.run.app/getCustomersList',
          {supplierGST: gstNumber},
        );

        if (response.status === 200 && response.data && response.data.clients) {
          const clientsData = response.data.clients;

          const transformedClients = Object.keys(clientsData).map(clientGstKey => {
            const client = clientsData[clientGstKey];
            let chatHistory = []; // Initialize chat history for this client

            // --- Process Open_Orders into chat history (as 'order' type messages) ---
            const openOrders = client.Open_Orders || {};
            Object.keys(openOrders).forEach(orderId => {
              const orderSpecificData = openOrders[orderId];
              const supplierGSTForOrder = orderSpecificData.supplierGST;

              if (supplierGSTForOrder && orderSpecificData[supplierGSTForOrder]) {
                const supplierOrderDetails = orderSpecificData[supplierGSTForOrder];

                // Ensure all necessary fields for order modal are available
                const orderMessage = {
                  id: orderId, // Use orderId as message ID
                  sender: 'customer', // Orders are typically from the customer
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
                  // Use createdAt or a relevant timestamp for the order message
                  timestamp: new Date(orderSpecificData.createdAt || orderSpecificData.OrderDate || Date.now()),
                };
                chatHistory.push(orderMessage);
              }
            });

            // --- Process Supplier.chat into chat history (as 'text' type messages) ---
            const supplierChat = client.Supplier?.chat || {}; // Use optional chaining for safety
            Object.keys(supplierChat).forEach(messageId => {
              const messageData = supplierChat[messageId];
              if (messageData.message && messageData.sender && messageData.timestamp) {
                const textMessage = {
                  id: messageId,
                  sender: messageData.sender,
                  type: 'text',
                  text: messageData.message,
                  timestamp: new Date(messageData.timestamp), // Convert timestamp to Date object
                };
                chatHistory.push(textMessage);
              }
            });

            // --- Sort the combined chat history by timestamp ---
            chatHistory.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            // Determine last order details for display on the customer card
            const lastOrderIdFromOpenOrders = Object.keys(client.Open_Orders || {})[0];
            let lastOrderTotal = 'N/A';
            let lastOrderDate = 'N/A';
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


            return {
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
              lastOrderId: lastOrderIdFromOpenOrders,
              openOrders: client.Open_Orders, // Keep for potential future use or debugging
              supplierData: client.Supplier, // Keep for potential future use or debugging
              updatedAt: client.Updated_At,
              lastOrderTotal: lastOrderTotal,
              lastOrderDate: lastOrderDate,
              chatHistory: chatHistory, // Attach the processed chat history here
            };
          });

          setCustomerList(transformedClients);
        } else {
          Alert.alert('Error', 'No clients found for this supplier or unexpected response structure.');
          console.log('API Response:', JSON.stringify(response.data, null, 2));
          setCustomerList([]);
        }
      } catch (error) {
        console.error('Error fetching customers list:', error);
        Alert.alert('Error', `Failed to fetch customers: ${error.message}`);
        setCustomerList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gstNumber]);

  // Filter customers based on search term
  const filteredCustomers = customerList.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
      (customer.businessName && customer.businessName.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.includes(searchLower)) // Search by phone number
    );
  });

  const handleCustomerChatPress = (customer) => {
    // Navigate to a dedicated chat screen for this customer, passing the full chat history
    navigation.navigate('CustomerChatDetail', {
      customerId: customer.id,
      customerName: customer.businessName || customer.name,
      initialMessages: customer.chatHistory, // <--- This is the key change!
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
          onChangeText={setSearchTerm} // Update search term
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
            renderItem={({item}) => <CustomerChatItem customer={item} onPress={handleCustomerChatPress} />}
            contentContainerStyle={styles.customerListContent}
          />
        ) : (
          <View style={styles.emptyChatContainer}>
            <Image
              source={require('../Images/VendorHomePage.png')} // Make sure this path is correct
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
    backgroundColor: 'white',
  },
  headerIconView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    paddingTop: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#76B117',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  workCard: {
    flexDirection: 'column',
    height: width * 0.45,
    alignItems: 'center',
  },
  workTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 7,
  },
  workDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  chatScreenTextInputView: {
    backgroundColor: 'gainsboro',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  chatScreenTextInputViewIcon: {
    marginLeft: 20,
  },
  chatScreenTextInput: {
    marginLeft: 10,
    flex: 1,
    color: 'black',
    paddingVertical: 10,
  },
  mainContainer: {
    flex: 1,
  },
  allChatText: {
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Montserrat',
    lineHeight: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    letterSpacing: 1,
    color: '#333',
  },
  emptyChatContainer: {
    width: '90%',
    height: '80%',
    borderWidth: 1,
    borderColor: '#76B117',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    paddingVertical: 20,
  },
  imageContainer: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  emptyChatTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChatText: {
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: 0.5,
    fontFamily: 'Montserrat',
    color: '#757575',
    marginTop: 10,
  },
  emptyChatSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#76B117',
  },
  // --- New Styles for Customer Chat Cards ---
  customerListContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  customerCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  lastOrderInfo: {
    fontSize: 13,
    color: 'gray',
    marginTop: 3,
  },
  chatIconContainer: {
    marginLeft: 10,
    padding: 5,
  },
});