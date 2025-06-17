import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDownIcon, ChevronLeftIcon } from 'react-native-heroicons/outline';
import GenericVectorIcon from '../components/GenericVectorIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Customers = () => {
  const [gstNumber, setGstNumber] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Customers',
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
      },
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 20,
        fontFamily: 'Montserrat',
        justifyContent: 'center',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 15 }}>
          <ChevronLeftIcon size={22} color="#333" strokeWidth={2} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const getSupplierGst = async () => {
      try {
        const storedGst = await AsyncStorage.getItem('supplierGST');
        if (storedGst) {
          setGstNumber(storedGst);
        } else {
          console.warn('supplierGST not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching supplierGST from AsyncStorage:', error);
      }
    };
    getSupplierGst();
  }, []);
  function formatDate(dateStr) {
    if (!dateStr || dateStr === 'N/A') {
        return 'N/A';
    }
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day); 
    const options = {day: '2-digit', month: 'long', year: 'numeric'};
    return date.toLocaleDateString('en-GB', options);
  }

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
          { supplierGST: gstNumber }
        );

        if (response.status === 200 && response.data && response.data.clients) {
          const clientsData = response.data.clients;

          const transformedClients = Object.keys(clientsData).map(clientGstKey => {
            const client = clientsData[clientGstKey];
            // Use the actual Order_ID from Open_Orders, if Last_Order_ID doesn't match
            const lastOrderIdFromOpenOrders = Object.keys(client.Open_Orders || {})[0]; 
            const openOrders = client.Open_Orders || {};

            let lastOrderDetails = {
              totalAmount: 'N/A',
              orderDate: 'N/A',
              items: [],
              deliveryDate: 'N/A',
            };

            // Check if there's an open order and get its details
            if (lastOrderIdFromOpenOrders && openOrders[lastOrderIdFromOpenOrders]) {
              const orderSpecificData = openOrders[lastOrderIdFromOpenOrders];
              const supplierGSTForLastOrder = orderSpecificData.supplierGST;

              if (supplierGSTForLastOrder && orderSpecificData[supplierGSTForLastOrder]) {
                const supplierOrderDetails = orderSpecificData[supplierGSTForLastOrder];

                lastOrderDetails = {
                  totalAmount: supplierOrderDetails.totalAmount !== undefined
                    ? `₹ ${Number(supplierOrderDetails.totalAmount).toFixed(2)}`
                    : 'N/A',
                  orderDate: supplierOrderDetails.OrderDate || 'N/A',
                  items: Array.isArray(supplierOrderDetails.items)
                    ? supplierOrderDetails.items
                    : [],
                  deliveryDate: supplierOrderDetails.DeliveryDate || 'N/A',
                };
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
              lastOrderId: lastOrderIdFromOpenOrders, // Use the correct order ID
              openOrders: client.Open_Orders,
              supplierData: client.Supplier,
              updatedAt: client.Updated_At,
              lastOrderTotal: lastOrderDetails.totalAmount,
              lastOrderDate: lastOrderDetails.orderDate,
              lastOrderItems: lastOrderDetails.items,
              lastOrderDeliveryDate: lastOrderDetails.deliveryDate,
            };
          });

          setCustomerList(transformedClients);
        } else {
          Alert.alert('Error', 'No clients found for this supplier or unexpected response structure.');
          console.log("API Response:", JSON.stringify(response.data, null, 2));
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

  const renderCustomerItem = ({ item }) => (
    <View style={styles.itemCardContainer}>
      <View style={styles.itemCard}>
        <View style={styles.nameAndTag}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.businessNameText}>{item.businessName}</Text>
          <View style={styles.tagsContainer}>
            {/* Any non-status related customer tags can go here if you have them */}
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.orderTotalText}>{item.lastOrderTotal}</Text>
          {item.lastOrderDeliveryDate !== 'N/A' && (
            <Text style={styles.orderDateText}>{formatDate(item.lastOrderDeliveryDate)}</Text>
          )}

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Customer Details', { customer: item })
            }
            style={styles.viewSummaryTouchableOpacity}>
            <Text style={styles.viewSummaryText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterBox}>
          <Text style={styles.filterText}>Sort by</Text>
          <ChevronDownIcon size={14} color="#76B117" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: '2%',
          backgroundColor: '#F2F2F2',
          paddingVertical: '2%',
          borderRadius: 10,
          marginBottom: '4%',
          width: '92%',
          marginHorizontal: 'auto',
        }}>
        <View>
          <Text
            style={{
              color: '#2C3E50',
              fontSize: 16,
              fontWeight: '700',
              fontFamily: 'Open Sans',
            }}>
            Name
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: '#2C3E50',
              fontSize: 16,
              fontWeight: '700',
              fontFamily: 'Open Sans',
            }}>
            Order Details
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color="#76B117" />
          <Text style={styles.loadingText}>Fetching customers...</Text>
        </View>
      ) : customerList.length === 0 ? (
        <View style={styles.centeredView}>
          <Text style={styles.emptyText}>No customers found for this supplier.</Text>
        </View>
      ) : (
        <FlatList
          data={customerList}
          keyExtractor={item => item.id}
          renderItem={renderCustomerItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerView: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  headersText: {
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Montserrat',
  },
  itemCardContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: '5%',
  },
  nameAndTag: {
    flexDirection: 'column',
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#76B117',
    fontFamily: 'Montserrat',
  },
  businessNameText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Montserrat',
    marginTop: 2,
  },
  detailsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  orderTotalText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    paddingVertical: '2%',
    paddingBottom: '3%',
  },
  orderDateText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    paddingVertical: '3%',
    paddingBottom: '4%',
  },
  viewSummaryTouchableOpacity: {
    backgroundColor: '#76B117',
    height: 25,
    width: 100,
    borderRadius: 20,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    paddingVertical: '2%',
    marginTop: '4%',
  },
  viewSummaryText: {
    color: '#F8F9FE',
    fontSize: 12,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    fontWeight: '400',
    fontFamily: 'Open Sans',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  tag: {
    color: '#323232',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginBottom: 5,
    marginRight: 5,
    alignSelf: 'flex-start',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: '6%',
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECF0F1',
    paddingHorizontal: '4%',
    paddingVertical: '2%',
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Open Sans',
    color: '#2C3E50',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default Customers;