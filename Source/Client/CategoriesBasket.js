import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Linking from 'react-native/Libraries/Linking/Linking';
import {database, firebase} from '../Firebase/firebase'; // Ensure this path is correct

export default function CategoriesBasket() {
  const navigation = useNavigation();
  const route = useRoute();
  // Destructure cart and data from route.params
  // `updateCart` is also passed, but will be used for state update if needed
  const {cart, data, updateCart} = route.params; // 'data' here refers to the product list from ViewCategories

  const [clientGST, setClientGST] = useState(null);
  const [clientPhoneNumber, setClientPhoneNumber] = useState(null);
  const [clientBusinessName, setClientBusinessName] = useState(null); // This will hold the fetched business name
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState(''); // State for the comment input

  // --- Debugging Initial Props ---
  useEffect(() => {
    console.log('--- CategoriesBasket Initial Load ---');
    console.log('Route Params - Cart:', cart);
    console.log('Route Params - Data (Products from ViewCategories):', data);
    if (!data || data.length === 0) {
      console.warn(
        'WARNING: Product data (route.params.data) is empty or undefined. Cart items might not display.',
      );
    }
    if (!cart || Object.keys(cart).length === 0) {
      console.warn('WARNING: Cart (route.params.cart) is empty. No items to display.');
    }
  }, [cart, data]);

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
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const getClientData = async () => {
      try {
        const storedGST = await AsyncStorage.getItem('clientGST');
        if (storedGST) setClientGST(storedGST);

        const storedPhone = await AsyncStorage.getItem('clientPhoneNumber');
        if (storedPhone) setClientPhoneNumber(storedPhone);

        // Fetch client business name from API using storedGST
        if (storedGST) {
          try {
            console.log(`Fetching client business data from API for GST: ${storedGST}`);
            const response = await axios.get(
              `https://api-v7quhc5aza-uc.a.run.app/getClient/${storedGST}`,
            );
            // Assuming the API response directly contains the business name, e.g., response.data.BusinessName
            if (response.data && response.data.BusinessName) {
              setClientBusinessName(response.data.BusinessName);
              console.log('Client business name fetched:', response.data.BusinessName);
            } else {
              console.warn('Client business name not found in API response.');
            }
          } catch (apiError) {
            console.error('Error fetching client data from API:', apiError);
            Alert.alert('Error', 'Failed to load your business data.');
          }
        }
      } catch (err) {
        console.error('Error retrieving client data from AsyncStorage:', err);
      }
    };
    getClientData();
  }, []); // Run once on mount to get client info

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        if (!clientGST) {
          console.log('Client GST not available yet, skipping supplier fetch.');
          return;
        }
        console.log(`Fetching suppliers for clientGST: ${clientGST}`);
        const res = await axios.get(
          `https://api-v7quhc5aza-uc.a.run.app/getSupplier/${clientGST}`,
        );
        const supplierArray = Object.values(res.data);
        setSuppliers(supplierArray);
        console.log('Fetched suppliers:', supplierArray);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        Alert.alert('Error', 'Failed to fetch suppliers. Please try again.');
      }
    };

    if (clientGST) fetchSuppliers();
  }, [clientGST]); // Depend on clientGST

  const openWhatsApp = (phoneNumber, message) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`;
    Linking.openURL(url).catch(err =>
      console.error('Error opening WhatsApp:', err),
    );
  };

  // --- Cart Items Processing ---
  const cartItems = Object.keys(cart || {}) // Ensure cart is not null/undefined
    .map(productIdFromCart => {
      // Find the product in the 'data' array using 'id'
      const product = (data || []).find(
        item => String(item.id) === String(productIdFromCart),
      );

      if (product) {
        // Map fields from 'ViewCategories' data structure to 'Basket' expected structure
        return {
          productId: product.id, // Use 'id' from ViewCategories as productId
          prodName: product.Name, // Use 'Name' from ViewCategories as prodName
          quantity: cart[productIdFromCart],
          price: parseFloat(product.Price) || 0, // Use 'Price' from ViewCategories, with fallback
          category: product.CategoryName || 'Unknown', // Use 'CategoryName' from ViewCategories
          image:
            product.image ||
            'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fvegetables.png?alt=media&token=53260745-7f43-45aa-8bd4-585fb38ed1f7',
          supplierPhone: product.SupplierPhone, // Assuming these exist in ViewCategories's data
          supplierName: product.SupplierName, // Assuming these exist in ViewCategories's data
          gstNumber: product.gstNumber, // Assuming these exist in ViewCategories's data
        };
      }
      console.warn(
        `Product with ID ${productIdFromCart} not found in data received via route.params.data from ViewCategories.`,
      );
      return null;
    })
    .filter(item => item !== null); // Filter out any entries where product was not found

  // Sort and group for display
  cartItems.sort((a, b) => a.category.localeCompare(b.category));

  const groupedItems = {};
  cartItems.forEach(item => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  const finalCartItems = [];
  Object.entries(groupedItems).forEach(([category, items]) => {
    finalCartItems.push({type: 'category', categoryName: category});
    finalCartItems.push(...items);
  });

  // Log the processed cart items before rendering
  useEffect(() => {
    console.log('Processed Cart Items (finalCartItems):', finalCartItems);
    if (finalCartItems.length === 0) {
      console.warn('Final cart items array is empty after processing. Nothing will be displayed.');
    }
  }, [finalCartItems]);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const handleApproval = async () => {
    if (!selectedSupplier) {
      Alert.alert(
        'No Supplier Selected',
        'Please select a supplier before sending for approval.',
        [{text: 'OK', onPress: () => setShowModal(true)}], // Option to open modal directly
      );
      return;
    }
    placeOrder();
  };

  // This function will be called to clear the cart in ViewCategories
  const clearCartInViewCategories = () => {
    if (updateCart) {
      updateCart({}); // Call the updateCart function passed from ViewCategories with an empty cart
      console.log('Cart cleared in ViewCategories via callback.');
    }
  };

  const placeOrder = async () => {
    console.log('--- Starting placeOrder function ---');

    const clientGSTValue = clientGST;
    const clientPhoneNumberValue = clientPhoneNumber;
    const currentClientBusinessName = clientBusinessName; // Use the state variable

    if (!clientGSTValue || !clientPhoneNumberValue || !currentClientBusinessName) {
      Alert.alert(
        'Error',
        'Your profile information (GST, Phone Number, or Business Name) is incomplete. Please ensure you are logged in and your profile is complete.',
      );
      console.error(
        'Place Order Error: Client GST, Phone number, or Business Name missing.',
      );
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Your basket is empty. Add items before placing an order.',
      );
      return;
    }

    Alert.alert('Placing Order', 'Initiating order placement...');

    const orderId = Math.floor(Math.random() * 1000000).toString();

    const groupedBySupplier = {};
    if (selectedSupplier) {
      const supplierGST = selectedSupplier.gstNumber;
      if (!supplierGST) {
        Alert.alert('Error', 'Selected supplier details are incomplete (missing GST).');
        console.error('Place Order Error: Selected supplier is missing GST.');
        return;
      }

      const orderDateToday = new Date();
      const deliveryDateCalculated = new Date(orderDateToday);
      deliveryDateCalculated.setDate(orderDateToday.getDate() + 2);

      groupedBySupplier[supplierGST] = {
        items: [],
        supplierName: selectedSupplier.businessName,
        supplierPhone: selectedSupplier.phone,
        clientName: currentClientBusinessName,
        clientGST: clientGSTValue,
        clientPhone: clientPhoneNumberValue,
        totalAmount: 0,
        OrderDate: orderDateToday.toISOString().split('T')[0],
        DeliveryDate: deliveryDateCalculated.toISOString().split('T')[0],
        orderId: orderId,
        status: 'Pending Approval',
      };

      cartItems.forEach(item => {
        groupedBySupplier[supplierGST].items.push({
          itemId: item.productId,
          name: item.prodName,
          quantity: item.quantity,
          price: item.price,
        });
        groupedBySupplier[supplierGST].totalAmount += item.quantity * item.price;
      });
    } else {
      Alert.alert('Error', 'Please select a supplier before placing the order.');
      return;
    }

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
      Alert.alert('Placing Order', 'Please wait while we place your order...');

      const response = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/placeOrder',
        apiPayload,
      );
      console.log('Response from API:', response.data);

      console.log('Initiating Firebase Realtime Database chat message for orders...');
      for (const supplierGST in groupedBySupplier) {
        const supplierOrder = groupedBySupplier[supplierGST];
        const chatDocId = [clientGSTValue, supplierGST].sort().join('_');

        const chatMessagesRef = database.ref(`chats/${chatDocId}/messages`);
        const chatMetadataRef = database.ref(`chats/${chatDocId}`);

        const chatMessageContent = {
          orderId: orderId,
          supplierGST: supplierGST,
          clientGST: clientGSTValue,
          clientName: supplierOrder.clientName,
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
          notes: comment || 'New order placed. Please review and confirm.',
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

          const metadataSnapshot = await chatMetadataRef.once('value');
          if (!metadataSnapshot.exists()) {
            await chatMetadataRef.set({
              participants: {
                [clientGSTValue]: true,
                [supplierGST]: true,
              },
              lastMessageText: newChatMessage.message,
              lastMessageTimestamp: firebase.database.ServerValue.TIMESTAMP,
              lastMessageSender: clientGSTValue,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
            });
          } else {
            await chatMetadataRef.update({
              lastMessageText: newChatMessage.message,
              lastMessageTimestamp: firebase.database.ServerValue.TIMESTAMP,
              lastMessageSender: clientGSTValue,
            });
          }

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
      clearCartInViewCategories(); // Clear the cart in ViewCategories
      navigation.navigate('Approval Pending', {orderID: orderId});
    } catch (error) {
      console.error('Error placing order (main catch block):', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        Alert.alert(
          'Error',
          `Failed to place order: ${error.response?.data?.message || 'Server error'}`,
        );
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
            clearCartInViewCategories(); // Clear the cart in ViewCategories
            navigation.goBack();
          },
        },
      ],
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

      {/* Select Supplier Button */}
      <TouchableOpacity
        style={{
          padding: 15,
          backgroundColor: '#d1fae5',
          borderRadius: 10,
          marginBottom: 10,
        }}
        onPress={() => setShowModal(true)}>
        <Text style={{color: '#065f46', fontWeight: 'bold'}}>
          {selectedSupplier
            ? `Selected: ${selectedSupplier.businessName}`
            : 'Select Supplier'}
        </Text>
      </TouchableOpacity>

      {/* Supplier Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            padding: 20,
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              maxHeight: '70%',
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
              }}>
              Select a Supplier
            </Text>
            <ScrollView>
              {suppliers.length > 0 ? (
                suppliers.map((supplier, index) => (
                  <TouchableOpacity
                    key={supplier.gstNumber || index} // Use GST as key if available, else index
                    style={{
                      paddingVertical: 10,
                      borderBottomColor: '#eee',
                      borderBottomWidth: 1,
                    }}
                    onPress={() => {
                      setSelectedSupplier(supplier);
                      setShowModal(false);
                    }}>
                    <Text style={{fontWeight: '600'}}>
                      {supplier.businessName}
                    </Text>
                    <Text style={{color: '#555'}}>{supplier.phone}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{padding: 10, color: 'gray'}}>
                  No suppliers found for your GST.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={{marginTop: 15, alignSelf: 'flex-end'}}
              onPress={() => setShowModal(false)}>
              <Text style={{color: 'red'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.editOrderContainer}
        onPress={() => navigation.goBack()}>
        <Text style={styles.editOrder}>Edit Order</Text>
      </TouchableOpacity>

      {/* Display FlatList only if finalCartItems has data */}
      {finalCartItems.length > 0 ? (
        <FlatList
          data={finalCartItems}
          keyExtractor={(item, index) =>
            item.type === 'category'
              ? `header-${index}`
              : item.productId.toString()
          }
          renderItem={({item}) => {
            if (item.type === 'category') {
              return (
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryText}>{item.categoryName}</Text>
                </View>
              );
            }

            return (
              <View style={styles.cartItem}>
                <Image source={{uri: item.image}} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.prodName}</Text>
                  <Text style={styles.itemQuantity}>{item.quantity} kg</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ₹ {item.price * item.quantity}
                </Text>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyCartMessage}>
          <Text style={styles.emptyCartText}>Your basket is empty!</Text>
          <Text style={styles.emptyCartSubText}>Go back and add some items.</Text>
        </View>
      )}

      <View style={styles.commentContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Leave a Comment"
          keyboardType="default"
          placeholderTextColor={'black'}
          value={comment}
          onChangeText={setComment}
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

      <TouchableOpacity style={styles.sendButton} onPress={handleApproval}>
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
  categoryHeader: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 5,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  emptyCartSubText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
});