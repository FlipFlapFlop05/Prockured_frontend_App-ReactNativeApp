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
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/solid';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database, firebase } from '../Firebase/firebase'; // Ensure this path is correct

export default function Basket() {
  const navigation = useNavigation();
  const route = useRoute();
  const {cart, data, clearCart} = route.params;
  const [Data, setData] = useState({}); // <--- Changed to empty object {}
  const [clientGSTState, setClientGSTState] = useState(null); // Renamed for clarity: holds client's GST
  const [clientPhoneNumberState, setClientPhoneNumberState] = useState(null); // Renamed for clarity: holds client's phone

  useEffect(() => {
    const fetchClientInfo = async () => {
      try {
        const storedClientGST = await AsyncStorage.getItem('clientGST');
        const storedClientPhoneNumber = await AsyncStorage.getItem('clientPhoneNumber');
        if (storedClientGST && storedClientPhoneNumber) {
          setClientGSTState(storedClientGST);
          setClientPhoneNumberState(storedClientPhoneNumber);
          console.log("Fetched Client GST from AsyncStorage:", storedClientGST);
          console.log("Fetched Client Phone from AsyncStorage:", storedClientPhoneNumber);
        } else {
            console.warn("Client GST or Phone Number not found in AsyncStorage.");
        }
      } catch (error) {
        console.error('Error Fetching Client Info from AsyncStorage: ', error);
      }
    };
    fetchClientInfo();
  }, []); // Run once on mount

  useEffect(() => {
    const fetchClientDataFromApi = async () => {
      // Use clientGSTState here, as it's the actual client GST
      if (clientGSTState) {
        try {
          console.log("Fetching client business data from API for GST:", clientGSTState);
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getClient/${clientGSTState}`,
          );
          setData(response.data); // This is where Data.businessName would come from
          console.log("Client business data fetched:", response.data);
        } catch (error) {
          console.error("Error fetching client data from API:", error);
          Alert.alert("Error", "Failed to load your business data.");
        }
      }
    };
    // Trigger this effect when clientGSTState changes
    if (clientGSTState) {
      fetchClientDataFromApi();
    }
  }, [clientGSTState]); // <--- Depend on clientGSTState


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
          onPress={() => navigation.navigate('Main', {screen: 'Catalogue'})}
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const openWhatsApp = (number, message) => {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(
      message,
    )}`;
    Linking.openURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
        }
      })
      .catch(err => console.error('Error opening WhatsApp:', err));
  };

  const cartItems = Object.keys(cart)
    .map(productIdStr => {
      const productId = parseInt(productIdStr);
      const product = data.find(item => item.productId === productId);
      if (product) {
        return {
          productId: productId,
          prodName: product.prodName,
          quantity: cart[productIdStr],
          price: parseFloat(product.myPrice),
          category: product.CategoryName,
          image:
            product.image ||
            'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fvegetables.png?alt=media&token=53260745-7f43-45aa-8bd4-585fb38ed1f7',
          supplierPhone: product.SupplierPhone,
          supplierName: product.SupplierName,
          gstNumber: product.gstNumber,
        };
      }
      return null;
    })
    .filter(item => item !== null);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const placeOrder = async () => {
    console.log("--- Starting placeOrder function ---");
    console.log("Current Data state:", Data); // Check Data here
    console.log("Data.businessName:", Data.BusinessName); // Specific check

    const clientGSTValue = clientGSTState;
    const clientPhoneNumberValue = clientPhoneNumberState;
    const clientBusinessName = Data.BusinessName; // Get from state

    if (!clientGSTValue || !clientPhoneNumberValue) {
        Alert.alert("Error", "Client GST or Phone Number not found. Please log in again.");
        console.error("Place Order Error: Client GST or Phone number missing.");
        return;
    }
    if (!clientBusinessName) { // <--- Added check for clientBusinessName
        Alert.alert("Error", "Your business name could not be loaded. Please ensure your profile is complete or try again.");
        console.error("Place Order Error: Client business name is undefined.");
        return;
    }
    if (cartItems.length === 0) {
        Alert.alert("Empty Cart", "Your basket is empty. Add items before placing an order.");
        return;
    }

    Alert.alert("Placing Order", "Initiating order placement...");

    const orderId = Math.floor(Math.random() * 1000000).toString();

    const groupedBySupplier = cartItems.reduce((acc, item) => {
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
          supplierName: item.supplierName,
          supplierPhone: item.supplierPhone,
          clientName: clientBusinessName, // <--- Use the validated clientBusinessName
          clientGST: clientGSTValue,
          clientPhone: clientPhoneNumberValue,
          totalAmount: 0,
          OrderDate: orderDateToday.toISOString().split('T')[0],
          DeliveryDate: deliveryDateCalculated.toISOString().split('T')[0],
          orderId: orderId,
          status: 'Pending Approval'
        };
      }

      acc[supplierGST].items.push({
        itemId: item.productId,
        name: item.prodName,
        quantity: item.quantity,
        price: item.price,
      });

      acc[supplierGST].totalAmount += item.quantity * item.price;
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

    console.log("API Payload:", JSON.stringify(apiPayload, null, 2));

    try {
      Alert.alert(
        'Placing Order',
        'Please wait while we place your order...',
        [
          { text: "OK", onPress: () => console.log("User acknowledged placing order") }
        ]
      );

      const response = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/placeOrder',
        apiPayload
      );
      console.log("Response from API:", response.data);

      console.log("Initiating Firebase chat message for orders...");
      for (const supplierGST in groupedBySupplier) {
        const supplierOrder = groupedBySupplier[supplierGST];
        const chatOrderId = [clientGSTValue, supplierGST].sort().join('_');
        const chatMessagesRef = database.ref(`chats/${chatOrderId}/messages`);
        const chatMetadataRef = database.ref(`chats/${chatOrderId}`);

        const chatMessageContent = {
            orderId: orderId,
            supplierGST: supplierGST,
            clientGST: clientGSTValue,
            clientName: supplierOrder.clientName, // This will now be correctly defined
            clientPhone: supplierOrder.clientPhone,
            supplierName: supplierOrder.supplierName,
            supplierPhone: supplierOrder.supplierPhone,
            totalAmount: supplierOrder.totalAmount,
            date: supplierOrder.OrderDate,
            deliveryDate: supplierOrder.DeliveryDate,
            items: supplierOrder.items.map(item => ({
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            notes: "New order placed. Please review and confirm."
        };

        const newChatMessage = {
          sender: clientGSTValue,
          type: 'order',
          message: `New Order (ID: ${orderId}) from ${supplierOrder.clientName}. Total: ₹${supplierOrder.totalAmount.toFixed(2)}`,
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
            ...(! (await chatMetadataRef.child('createdAt').once('value')).exists() && { createdAt: firebase.database.ServerValue.TIMESTAMP })
          });
          console.log(`Order message sent to chat with supplier ${supplierGST}`);
        } catch (firebaseError) {
          console.error(`Error sending order message to Firebase for ${supplierGST}:`, firebaseError);
          Alert.alert('Chat Error', `Failed to send order notification to ${supplierOrder.supplierName}. ${firebaseError.message}`);
        }
      }

      Alert.alert('Success', 'Order placed successfully and chat initiated!');
      if (clearCart) {
        clearCart();
      }
      navigation.navigate('Approval Pending', { orderID: orderId });

    } catch (error) {
      console.error("Error placing order (main catch block):", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        Alert.alert(
          'Error',
          `Failed to place order: ${error.response.data?.message || 'Server error'}`
        );
      } else if (error.request) {
        console.error("Error request:", error.request);
        Alert.alert('Error', 'Failed to place order: No response from server.');
      } else {
        console.error("Error message:", error.message);
        Alert.alert('Error', `Failed to place order: ${error.message}`);
      }
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order and clear your basket?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            if (clearCart) {
              clearCart();
            }
            navigation.goBack();
          }
        }
      ]
    );
  };

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
      <FlatList
        data={cartItems}
        keyExtractor={item => item.productId.toString()}
        renderItem={({item}) => (
          <View style={styles.cartItem}>
            <Image
              source={{
                uri: 'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fvegetables.png?alt=media&token=53260745-7f43-45aa-8bd4-585fb38ed1f7',
              }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.prodName}</Text>
              <Text style={styles.itemQuantity}>{item.quantity} kg</Text>
            </View>
            <Text style={styles.itemPrice}>₹ {item.price * item.quantity}</Text>
          </View>
        )}
      />

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
          <Text style={styles.deliveryDate}>25 July 2024</Text>
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
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignSelf: 'center',
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