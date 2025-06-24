import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator, // Added for loading state
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/solid';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {database, firebase} from '../Firebase/firebase'; // Ensure this path is correct

export default function NewBasket() {
  const navigation = useNavigation();
  const route = useRoute();

  // Destructure the parameters correctly
  // 'cartItems' is what's being passed from SpecificVendorOrderNow
  // 'clientGST' and 'vendorGST' are also passed
  // 'clearCart' needs to be handled if it's actually passed as a function
  const {cartItems: initialCartItems, clientGST, vendorGST, vendorName} =
    route.params || {};

  const [clientGSTState, setClientGSTState] = useState(null); // Renamed for clarity: holds client's GST
  const [clientPhoneNumberState, setClientPhoneNumberState] = useState(null); // Renamed for clarity: holds client's phone
  const [clientBusinessData, setClientBusinessData] = useState({}); // Stores data fetched from /getClient API
  const [loadingClientData, setLoadingClientData] = useState(true); // New loading state for client data

  // State to hold the current items in the basket (if you want to allow modification here)
  const [currentCartItems, setCurrentCartItems] = useState(initialCartItems);

  // You might want to remove this if you only expect data to come from navigation
  // and handle quantity changes within this component if needed.
  // For now, it's safer to use initialCartItems directly if quantities are finalized
  // before navigating to Basket.
  // If quantities *can* be changed on this screen, you'd need functions to update currentCartItems.

  useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        const storedClientGST = await AsyncStorage.getItem('clientGST');
        const storedClientPhoneNumber = await AsyncStorage.getItem(
          'clientPhoneNumber',
        );
        if (storedClientGST && storedClientPhoneNumber) {
          setClientGSTState(storedClientGST);
          setClientPhoneNumberState(storedClientPhoneNumber);
          console.log('Fetched Client GST from AsyncStorage:', storedClientGST);
          console.log(
            'Fetched Client Phone from AsyncStorage:',
            storedClientPhoneNumber,
          );
        } else {
          console.warn('Client GST or Phone Number not found in AsyncStorage.');
        }
      } catch (error) {
        console.error('Error Fetching Client Info from AsyncStorage: ', error);
      }
    };
    fetchClientInfo();
  }, []); // Run once on mount

  useEffect(() => {
    const fetchClientBusinessData = async () => {
      if (clientGSTState) {
        try {
          setLoadingClientData(true);
          console.log(
            'Fetching client business data from API for GST:',
            clientGSTState,
          );
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getClient/${clientGSTState}`,
          );
          setClientBusinessData(response.data); // Set the fetched client business data
          console.log('Client business data fetched:', response.data);
        } catch (error) {
          console.error('Error fetching client data from API:', error);
          Alert.alert('Error', 'Failed to load your business data.');
        } finally {
          setLoadingClientData(false);
        }
      }
    };
    if (clientGSTState) {
      fetchClientBusinessData();
    }
  }, [clientGSTState]); // Depend on clientGSTState

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Order Summary',
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
          onPress={() => navigation.goBack()} // Changed to goBack for a more natural flow
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const openWhatsApp = (number, message) => {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
        }
      })
      .catch(err => console.error('Error opening WhatsApp:', err));
  };

  const calculateTotal = () => {
    return currentCartItems.reduce(
      (total, item) => total + item.myPrice * item.quantity,
      0,
    );
  };

  const placeOrder = async () => {
    console.log('--- Starting placeOrder function ---');
    console.log('Current Client Business Data state:', clientBusinessData); // Check Data here
    console.log('clientBusinessData.BusinessName:', clientBusinessData.BusinessName); // Specific check

    const clientGSTValue = clientGSTState;
    const clientPhoneNumberValue = clientPhoneNumberState;
    const clientBusinessName = clientBusinessData.BusinessName; // Get from state

    if (!clientGSTValue || !clientPhoneNumberValue) {
      Alert.alert(
        'Error',
        'Your GST or Phone Number could not be found. Please log in again.',
      );
      console.error('Place Order Error: Client GST or Phone number missing.');
      return;
    }
    if (!clientBusinessName) {
      Alert.alert(
        'Error',
        'Your business name could not be loaded. Please ensure your profile is complete or try again.',
      );
      console.error('Place Order Error: Client business name is undefined.');
      return;
    }
    if (currentCartItems.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Your basket is empty. Add items before placing an order.',
      );
      return;
    }

    Alert.alert('Placing Order', 'Initiating order placement...');

    const orderId = Math.floor(Math.random() * 1000000).toString();

    // Grouping by supplier is still relevant if cartItems might contain products from different suppliers
    // (though in this flow, they generally come from one specific vendor)
    const groupedBySupplier = currentCartItems.reduce((acc, item) => {
      const supplierGST = item.gstNumber;
      if (!supplierGST) {
        console.warn(`Product ${item.prodName} is missing supplier GST. Skipping.`);
        return acc;
      }

      if (!acc[supplierGST]) {
        const orderDateToday = new Date();
        const deliveryDateCalculated = new Date(orderDateToday);
        deliveryDateCalculated.setDate(orderDateToday.getDate() + 2);

        acc[supplierGST] = {
          items: [],
          supplierName: item.SupplierName, // Use SupplierName from the passed cartItem
          supplierPhone: null, // You'll need to fetch supplier phone if not in cartItem
          clientName: clientBusinessName,
          clientGST: clientGSTValue,
          clientPhone: clientPhoneNumberValue,
          totalAmount: 0,
          OrderDate: orderDateToday.toISOString().split('T')[0],
          DeliveryDate: deliveryDateCalculated.toISOString().split('T')[0],
          orderId: orderId,
          status: 'Pending Approval',
        };
      }

      acc[supplierGST].items.push({
        itemId: item.productId,
        name: item.prodName,
        quantity: item.quantity,
        price: item.myPrice, // Use myPrice from the passed cartItem
      });

      acc[supplierGST].totalAmount += item.quantity * item.myPrice;
      return acc;
    }, {});

    const apiPayload = {
      Open_Orders: {
        [orderId]: groupedBySupplier,
      },
      clientGST: clientGSTValue,
      supplierGST: Object.keys(groupedBySupplier).join(','),
      Order_ID: orderId,
    };

    console.log('API Payload:', JSON.stringify(apiPayload, null, 2));

    try {
      Alert.alert(
        'Placing Order',
        'Please wait while we place your order...',
        [{text: 'OK', onPress: () => console.log('User acknowledged placing order')}],
      );

      const response = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/placeOrder',
        apiPayload,
      );
      console.log('Response from API:', response.data);

      console.log('Initiating Firebase chat message for orders...');
      for (const supplierGST in groupedBySupplier) {
        const supplierOrder = groupedBySupplier[supplierGST];
        const chatOrderId = [clientGSTValue, supplierGST].sort().join('_');
        const chatMessagesRef = database.ref(`chats/${chatOrderId}/messages`);
        const chatMetadataRef = database.ref(`chats/${chatOrderId}`);

        const chatMessageContent = {
          orderId: orderId,
          supplierGST: supplierGST,
          clientGST: clientGSTValue,
          clientName: supplierOrder.clientName,
          clientPhone: supplierOrder.clientPhone,
          supplierName: supplierOrder.supplierName,
          supplierPhone: supplierOrder.supplierPhone, // Will be null if not fetched
          totalAmount: supplierOrder.totalAmount,
          date: supplierOrder.OrderDate,
          deliveryDate: supplierOrder.DeliveryDate,
          items: supplierOrder.items.map(item => ({
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          notes: 'New order placed. Please review and confirm.',
        };

        const newChatMessage = {
          sender: clientGSTValue,
          type: 'order',
          message: `New Order (ID: ${orderId}) from ${supplierOrder.clientName}. Total: ₹${supplierOrder.totalAmount.toFixed(
            2,
          )}`,
          order: chatMessageContent,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
        };

        try {
          await chatMessagesRef.push(newChatMessage);

          await chatMetadataRef.update({
            participants: {
              [clientGSTValue]: true,
              [supplierGST]: true,
            },
            lastMessageText: newChatMessage.message,
            lastMessageTimestamp: firebase.database.ServerValue.TIMESTAMP,
            lastMessageSender: clientGSTValue,
            // Only set createdAt if it doesn't exist, to preserve original creation time
            ...(!(await chatMetadataRef.child('createdAt').once('value')).exists() && {
              createdAt: firebase.database.ServerValue.TIMESTAMP,
            }),
          });
          console.log(`Order message sent to chat with supplier ${supplierGST}`);
        } catch (firebaseError) {
          console.error(
            `Error sending order message to Firebase for ${supplierGST}:`,
            firebaseError,
          );
          Alert.alert(
            'Chat Error',
            `Failed to send order notification to ${supplierOrder.supplierName}. ${firebaseError.message}`,
          );
        }
      }

      Alert.alert('Success', 'Order placed successfully and chat initiated!');
      setCurrentCartItems([]); 
      Alert.alert("Order Placed", "Your order has been placed successfully. It is now pending approval.");
      navigation.navigate('Approval Pending', {orderID: orderId});
    } catch (error) {
      console.error('Error placing order (main catch block):', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        Alert.alert(
          'Error',
          `Failed to place order: ${error.response.data?.message || 'Server error'}`,
        );
      } else if (error.request) {
        console.error('Error request:', error.request);
        Alert.alert('Error', 'Failed to place order: No response from server.');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Error', `Failed to place order: ${error.message}`);
      }
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order and clear your basket?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setCurrentCartItems([]); // Clear the local cart
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (loadingClientData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#76B117" />
        <Text>Loading your business details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 10,
          marginBottom: 20,
        }}>
        <Text style={styles.orderTotal}>Order Total ₹ {calculateTotal()}</Text>
      </View>
      <TouchableOpacity
        style={styles.editOrderContainer}
        onPress={() => navigation.goBack()}>
        <Text style={styles.editOrder}>Edit Order</Text>
      </TouchableOpacity>
      {currentCartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your basket is empty.</Text>
          <Text style={styles.emptyCartSubText}>Add items to place an order.</Text>
        </View>
      ) : (
        <FlatList
          data={currentCartItems}
          keyExtractor={item => item.productId.toString()}
          renderItem={({item}) => (
            <View style={styles.cartItem}>
              <Image
                source={{
                  uri:
                    item.image || // Use the image from cartItem if available
                    'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fvegetables.png?alt=media&token=53260745-7f43-45aa-8bd4-585fb38ed1f7',
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.prodName}</Text>
                <Text style={styles.itemQuantity}>{item.quantity} {item.prodUnit || 'units'}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹ {(item.myPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.commentContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Leave a Comment"
          keyboardType="default"
          placeholderTextColor={'black'}
        />
      </View>

      <View style={styles.deliveryContainer}>
        <View style={{flexDirection: 'column'}}>
          <Text style={styles.deliveryLabel}>Delivery by:</Text>
          {/* Dynamically calculate delivery date based on current date + 2 days */}
          <Text style={styles.deliveryDate}>
            {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(
              'en-IN',
              {day: 'numeric', month: 'long', year: 'numeric'},
            )}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCancelOrder}>
          <Text style={styles.cancelOrder}>Cancel order</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.sendButton} onPress={placeOrder}>
        <Text style={styles.sendButtonText}>Send for approval</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    alignContent: 'center',
    alignSelf: 'center',
  },
  editOrderContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginRight: 20,
  },
  editOrder: {
    color: 'blue',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888',
  },
  emptyCartSubText: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignSelf: 'center',
    width: '100%', // Ensure it takes full width
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemQuantity: {
    fontSize: 16,
    color: 'gray',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  commentInput: {
    borderRadius: 10,
    height: 40,
    padding: 10,
    backgroundColor: 'white',
    color: 'black',
  },
  deliveryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  deliveryLabel: {
    fontSize: 16,
  },
  deliveryDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelOrder: {
    color: 'red',
  },
  sendButton: {
    backgroundColor: '#76B117',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});