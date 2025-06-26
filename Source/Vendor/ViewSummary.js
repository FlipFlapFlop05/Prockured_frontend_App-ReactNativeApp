import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ChevronLeftIcon, PencilIcon } from 'react-native-heroicons/outline';
import { BellIcon } from 'react-native-heroicons/solid';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

const ViewSummary = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { supplierGST, clientGST, orderId } = route.params;

  const [clientProfile, setClientProfile] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClientDetails = async () => {
    if (!clientGST) return {};
    try {
      const response = await axios.get(
        `https://api-v7quhc5aza-uc.a.run.app/getClient/${clientGST}`
      );
      if (response.data) {
        setClientProfile(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Client details fetch error:', error);
      Alert.alert('Error', 'Could not fetch client data.');
    }
    return {};
  };

  const fetchOrderTracking = async () => {
    if (!clientGST || !orderId) return {};
    try {
      const response = await axios.post(
        'https://api-v7quhc5aza-uc.a.run.app/orderTracking',
        { clientGST, orderId }
      );
      if (response?.data) {
        setTrackingData(response.data);
        return response.data;
      } else {
        Alert.alert('No Data', 'No tracking data found.');
      }
    } catch (error) {
      console.error('Order tracking error:', error);
      Alert.alert('Error', 'Could not fetch order tracking.');
    }
    return {};
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchClientDetails(), fetchOrderTracking()]);
      setLoading(false);
    };
    fetchData();
  }, [clientGST, orderId]);

  // ✅ Extract correct supplier key dynamically
  const orderDetails = trackingData?.orderDetails || {};
  const supplierKey = trackingData?.supplierGST ||
    Object.keys(orderDetails).find(
      key =>
        !['Order_ID', 'clientGST', 'Approval_Status', 'supplierGST'].includes(key)
    );

  const supplierSpecificOrderDetails = orderDetails?.[supplierKey] || {};

  const orderData = {
    orderId: trackingData?.orderId || orderId || 'N/A',
    clientGST: supplierSpecificOrderDetails?.clientGST || clientGST || 'N/A',
    supplierGST: supplierSpecificOrderDetails?.supplierGST || supplierKey || 'N/A',
    status: supplierSpecificOrderDetails?.status || 'N/A',
    orderValue: supplierSpecificOrderDetails?.totalAmount || '0.00',
    items: supplierSpecificOrderDetails?.items || [],
    deliveryDate:
      supplierSpecificOrderDetails?.DeliveryDate ||
      (trackingData?.foundIn === 'Completed_Orders' ? 'Delivered' : 'To be confirmed'),
    totalItems: supplierSpecificOrderDetails?.items?.length || 0,
    clientName:
      supplierSpecificOrderDetails?.clientName ||
      clientProfile?.name ||
      clientProfile?.businessName ||
      clientProfile?.Name ||
      'Unknown Client',
    clientPhone:
      supplierSpecificOrderDetails?.clientPhone ||
      clientProfile?.phone ||
      clientProfile?.Phone ||
      'N/A',
    orderDate: supplierSpecificOrderDetails?.OrderDate
      ? new Date(supplierSpecificOrderDetails.OrderDate).toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      : new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
    vendorNameForHeader:
      clientProfile?.name ||
      clientProfile?.businessName ||
      clientProfile?.Name ||
      'Order Summary',
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#76B117" />
        <Text style={styles.loaderText}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={22} color={'black'} strokeWidth={3} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.vendorName}>{orderData.vendorNameForHeader}</Text>
          <Text style={styles.headerSubtitle}>Order Summary</Text>
        </View>
      </View>

      {/* Client Info */}
      <View style={styles.clientInfoSection}>
        <Text style={styles.clientInfoLabel}>Client Name:</Text>
        <Text style={styles.clientInfoValue}>{orderData.clientName}</Text>
        <Text style={styles.clientInfoLabel}>Client GST:</Text>
        <Text style={styles.clientInfoValue}>{orderData.clientGST}</Text>
        {orderData.clientPhone !== 'N/A' && (
          <>
            <Text style={styles.clientInfoLabel}>Client Phone:</Text>
            <Text style={styles.clientInfoValue}>{orderData.clientPhone}</Text>
          </>
        )}
      </View>

      {/* Comment Section */}
      <View style={styles.commentSection}>
        <Text style={styles.commentLabel}>Comment *</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.commentBoxWrapper}>
            <TextInput
              style={styles.commentBox}
              placeholder="Enter your comment"
              placeholderTextColor={'gray'}
              multiline
            />
          </View>
          <View style={styles.iconRow}>
            <TouchableOpacity>
              <PencilIcon size={25} color={'#6B7280'} strokeWidth={2} />
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <BellIcon size={25} color={'#6B7280'} strokeWidth={2} />
              <Text>Notify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Order Details Card */}
      <View style={styles.orderCard}>
        <Text style={styles.orderText}>Order ID: {orderData.orderId}</Text>
        <Text style={styles.orderDateEntry}>{orderData.orderDate}</Text>
        <View style={styles.firstHorizontalLine} />
        <View style={styles.entriesView}>
          <Text style={styles.itemText}>Item</Text>
          <Text style={styles.quantityText}>Quantity</Text>
        </View>
        {orderData.items.length > 0 ? (
          orderData.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name || 'N/A'}</Text>
              <Text style={styles.itemQuantity}>{item.quantity || 'N/A'}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noItemsText}>No items found for this order.</Text>
        )}
        <View style={styles.horizontalLine} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ordered products</Text>
          <Text style={styles.summaryValue}>{orderData.totalItems}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Value</Text>
          <Text style={styles.summaryValue}>₹ {orderData.orderValue}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Supplier GST</Text>
          <Text style={styles.summaryValue}>{orderData.supplierGST}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Date</Text>
          <Text style={styles.summaryValue}>{orderData.deliveryDate}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order Status</Text>
          <Text style={styles.summaryValue}>{orderData.status}</Text>
        </View>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loaderText: {
    marginTop: 20,
    color: '#76B117',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: screenWidth * 0.08,
    paddingLeft: screenWidth * 0.04,
  },
  headerTitleContainer: {
    marginLeft: screenWidth * 0.02,
  },
  vendorName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0F1828',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  clientInfoSection: {
    paddingHorizontal: screenWidth * 0.04,
    marginTop: screenWidth * 0.06,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 15,
  },
  clientInfoLabel: {
    fontWeight: '800',
    fontSize: 16,
    color: '#76B117',
    marginTop: 8,
  },
  clientInfoValue: {
    fontWeight: '500',
    fontSize: 15,
    color: '#000',
    marginBottom: 4,
  },
  commentSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  commentLabel: {
    color: '#76B117',
    fontWeight: '500',
    marginBottom: 6,
  },
  commentBoxWrapper: {
    borderWidth: 1.5,
    borderColor: 'lightgray',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    width: screenWidth * 0.7,
  },
  commentBox: {
    fontSize: 15,
    padding: 0,
    color: '#000',
  },
  iconRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
    alignItems: 'flex-start',
    alignContent: 'space-between',
    marginLeft: 10,
  },
  orderCard: {
    borderWidth: 3,
    borderColor: '#76B117',
    borderRadius: 16,
    padding: 20,
    marginTop: 30,
    marginLeft: screenWidth * 0.03,
    width: screenWidth * 0.9,
    alignSelf: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 30,
  },
  orderText: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 5,
  },
  orderDateEntry: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
  },
  firstHorizontalLine: {
    borderBottomWidth: 1,
    borderColor: 'lightgray',
    marginVertical: 10,
  },
  entriesView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemText: {
    fontWeight: '600',
    color: '#000',
  },
  quantityText: {
    fontWeight: '600',
    color: '#000',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 15,
    color: '#000',
  },
  itemQuantity: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  noItemsText: {
    textAlign: 'center',
    color: '#757575',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  horizontalLine: {
    borderBottomWidth: 0.5,
    borderColor: 'lightgray',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#000',
  },
  viewDetails: {
    color: '#76B117',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    textDecorationLine: 'underline',
  },
});

export default ViewSummary;