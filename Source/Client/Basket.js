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
  Alert, // Make sure Alert is imported
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/solid';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Basket() {
  const navigation = useNavigation();
  const route = useRoute();
  // Destructure clearCart from route.params
  const {cart, data, clearCart} = route.params;
  const [Data, setData] = useState([]);
  const [phoneNumber, setPhoneNumber] = React.useState(null);
  const [gstNumber, setGSTNumber] = React.useState(null);

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('clientGST');
        const storedGST = await AsyncStorage.getItem('clientPhoneNumber');
        if (storedPhoneNumber && storedGST) { // Use && for both to be true
          setPhoneNumber(storedPhoneNumber);
          setGSTNumber(storedGST);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };

    const fetchData = async () => {
      if (phoneNumber) {
        try {
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getClient/${phoneNumber}`,
          );
          setData(response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };

    // Call fetchPhoneNumber immediately
    fetchPhoneNumber();
    // Only call fetchData if phoneNumber is available after fetchPhoneNumber
    if (phoneNumber) {
      fetchData();
    }
  }, [phoneNumber]); // Depend on phoneNumber so fetchData runs when it's set

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

  const openWhatsApp = (number, message) => { // Renamed phoneNumber to number to avoid confusion with state
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
    Alert.alert("Placing Order", "Initiating order placement...");

    const clientGSTValue = phoneNumber; // Assuming phoneNumber holds client GST
    const clientPhoneNumber = gstNumber; // Assuming gstNumber holds client Phone

    const orderId = Math.floor(Math.random() * 1000000).toString();

    const groupedBySupplier = cartItems.reduce((acc, item) => {
      const supplierGST = item.gstNumber;
      if (!acc[supplierGST]) {
        const orderDateToday = new Date();
        const deliveryDateCalculated = new Date(orderDateToday);
        deliveryDateCalculated.setDate(orderDateToday.getDate() + 2);

        acc[supplierGST] = {
          items: [],
          supplierName: item.supplierName,
          supplierPhone: item.supplierPhone,
          clientName: Data.businessName,
          clientPhone: clientPhoneNumber,
          totalAmount: 0,
          OrderDate: orderDateToday.toISOString().split('T')[0],
          DeliveryDate: deliveryDateCalculated.toISOString().split('T')[0],
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

    const payload = {
      Open_Orders: {
        [orderId]: groupedBySupplier,
      },
      clientGST: clientGSTValue,
      supplierGST: Object.keys(groupedBySupplier).join(','),
      Order_ID: orderId,
    };

    console.log("Payload:", JSON.stringify(payload, null, 2));

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
        payload
      );
      console.log("Response from API:", response.data);
      Alert.alert('Success', 'Order placed successfully!');
      // Clear the cart after successful order placement
      if (clearCart) {
        clearCart();
      }
      navigation.navigate('Approval Pending', { orderID: orderId });
    } catch (error) {
      console.error("Error placing order:", error);
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
              clearCart(); // Call the function passed from Catalogue to clear the cart
            }
            navigation.goBack(); // Go back to the previous screen (Catalogue)
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
        <TouchableOpacity onPress={handleCancelOrder}> {/* Call new handler */}
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
    alignItems: 'flex-end', // Align to the right
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