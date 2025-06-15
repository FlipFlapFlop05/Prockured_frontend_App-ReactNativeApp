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
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Linking from 'react-native/Libraries/Linking/Linking';

export default function CategoriesBasket() {
  const navigation = useNavigation();
  const route = useRoute();
  const {cart, data} = route.params;
  const [clientGST, setClientGST] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    const getGST = async () => {
      try {
        const storedGST = await AsyncStorage.getItem('clientGST');
        if (storedGST) setClientGST(storedGST);
      } catch (err) {
        console.log('Error retrieving clientGST:', err);
      }
    };
    getGST();
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(
          `https://api-v7quhc5aza-uc.a.run.app/getSupplier/${clientGST}`,
        );
        const supplierArray = Object.values(res.data);
        setSuppliers(supplierArray);
      } catch (error) {
        console.log('Error fetching suppliers:', error);
      }
    };

    if (clientGST) fetchSuppliers();
  }, [clientGST]);

  const openWhatsApp = (phoneNumber, message) => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`;
    Linking.openURL(url).catch(err =>
      console.error('Error opening WhatsApp:', err),
    );
  };

  const cartItems = Object.keys(cart)
    .map(productId => {
      const product = data.find(
        item => item.id.toString() === productId.toString(),
      );

      if (product) {
        return {
          productId,
          prodName: product.Name,
          quantity: cart[productId],
          price: 200,
          category: product.CategoryName || 'Unknown',
          image: product.image || 'https://your-default-image-url.com',
        };
      }
      return null;
    })
    .filter(item => item !== null);

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

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const handleApproval = async () => {
    openWhatsApp(
      '8306148803',
      `${cartItems
        .map(item => `${item.prodName} - ${item.quantity} kg`)
        .join('\n')}\nTotal: ₹${calculateTotal()}`,
    );
    navigation.navigate('Approval Pending');
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
              {suppliers.map((supplier, index) => (
                <TouchableOpacity
                  key={index}
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
              ))}
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

      <FlatList
        data={finalCartItems}
        keyExtractor={(item, index) =>
          item.type === 'category' ? `header-${index}` : item.productId
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
        <TouchableOpacity onPress={() => navigation.navigate('Catalogue')}>
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
