import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Linking } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";



export default function Basket() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cart, data } = route.params;

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
        justifyContent: 'center'
        // color: 'white',
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

  const openWhatsApp = (phoneNumber, message) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url)
      .then((supported) => {
        if (!supported) {
          alert('Make sure WhatsApp is installed on your device');
        }
      })
      .catch((err) => console.error('Error opening WhatsApp:', err));
  };
  
  const handleRemoveItem = (productId) => {
    // ... your removal logic ...
  };
  const cartItems = Object.keys(cart).map((productId) => {
    const product = data.find((item) => item.productId === productId);
    if (product) {
      return {
        productId: productId,
        prodName: product.prodName,
        quantity: cart[productId],
        price: product.myPrice,
        category: product.CategoryName,
        image: product.image, // Assuming you have an image URL in your data
      };
    }
    return null;
  }).filter(item => item !== null);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleApproval = async() => {
    openWhatsApp('8306148803', `${cartItems.map(item => `${item.prodName} - ${item.quantity} kg`).join('\n')}\nTotal: ₹${calculateTotal()}`);
    navigation.navigate("Approval Pending");
  }

  return (
    <View style={styles.container}>
        
        <View style = {{backgroundColor: "white", padding: 20, borderRadius: 10, marginBottom: 20}}>
            <Text style={styles.orderTotal}>Order Total ₹ {calculateTotal()}</Text>
        </View>
        <TouchableOpacity style={styles.editOrderContainer} onPress={() => navigation.goBack()}>
            <Text style={styles.editOrder}>Edit Order</Text>
        </TouchableOpacity>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: "https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fvegetables.png?alt=media&token=53260745-7f43-45aa-8bd4-585fb38ed1f7"}} style={styles.itemImage} />
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
        <View style = {{flexDirection: "column"}}>
            <Text style={styles.deliveryLabel}>Delivery by:</Text>
            <Text style={styles.deliveryDate}>25 July 2024</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Catalogue")}>
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
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    fontSize: 18,
    fontWeight: "bold",
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: "bold",
    alignContent: "center",
    alignSelf: "center"
  },
  editOrderContainer: {
    alignItems: 'flex-end', // Align to the right
    marginBottom: 20,
    marginRight: 20, 
  },
  editOrder: {
    color: "blue",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignSelf: "center"
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
    fontWeight: "bold",
  },
  itemQuantity: {
    fontSize: 16,
    color: "gray",
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "bold",
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
    backgroundColor: "white",
    color: "black",
  },
  deliveryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  deliveryLabel: {
    fontSize: 16,
  },
  deliveryDate: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelOrder: {
    color: "red",
  },
  sendButton: {
    backgroundColor: "#76B117",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});