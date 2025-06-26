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
  Alert, // Make sure Alert is imported for debugging
} from 'react-native';
import { ChevronLeftIcon, PencilIcon } from 'react-native-heroicons/outline';
import { BellIcon } from 'react-native-heroicons/solid';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

const SpecificOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params; // The 'order' object from the previous screen
  const [loading, setLoading] = useState(true); // Keep loading state for potential async operations if needed

  // Process order data - make sure this function truly returns data
  const processOrderData = () => {
    const baseData = {
      orderId: order.Order_ID || order.orderId || 'N/A',
      vendor: order.supplierGST || order.vendor || 'Unknown Vendor',
      status: order.status || 'N/A',
      orderValue: order.orderValue || '0.00',
      items: order.items || [],
      supplierGST: order.supplierGST || 'N/A',
      clientGST: order.clientGST || 'N/A',
      deliveryDate:
        order.deliveryDate ||
        (order.status === 'Delivered' ? 'Delivered' : 'To be confirmed'),
      orderDate: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      totalItems: order.items?.length || 0,
      // Ensure these are correctly passed in the 'order' object from the previous screen
      vendorName: order.vendorName || 'Unknown Vendor', // Assuming this is the supplier's business name
      supplierPhone: order.supplierPhone || 'N/A', // Assuming this is the supplier's phone number
    };
    return baseData; // This function must return the processed data
  };

  const orderData = processOrderData(); // Call it here to get the data

  useEffect(() => {
    // For debugging: show the full orderData received
    // Alert.alert("Order Data on SpecificOrderScreen", JSON.stringify(orderData, null, 2));
    setLoading(false); // Set loading to false once data is processed/received
  }, [orderData]); // Depend on orderData to re-run if it changes (though usually it won't after initial load)


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
        <View style={styles.vendorHeaderInfo}> {/* New View to hold both name and phone */}
          <Text style={styles.vendorName}>{orderData.vendorName}</Text> {/* Use orderData here */}
          {orderData.supplierPhone !== 'N/A' && ( // Only show if phone number is available
            <Text style={styles.supplierPhoneHeader}>{orderData.supplierPhone}</Text>
          )}
        </View>
      </View>

      {/* Customer Info (This section seems to display vendor info based on names) */}
      <View style={styles.vendorData}>
        <View style={styles.dataFlexDirection}>
          {/* Consider renaming customerName to clientName if this is for the client */}
          <Text style={styles.customerName}>{orderData.vendorName}</Text> {/* Using orderData */}
          <Text style={styles.customerPhone}>{orderData.supplierPhone}</Text> {/* Using orderData */}
        </View>
        <View style={styles.dataFlexDirection}>
          <Text style={styles.deliveryDateText}>Delivery Date</Text>
          <Text style={styles.deliveryDateEntry}>{orderData.deliveryDate}</Text> {/* Using orderData */}
        </View>
      </View>

      {/* Comment Box */}
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

      {/* Order Card */}
      <View style={styles.orderCard}>
        <Text style={styles.orderText}>Order</Text>
        <Text style={styles.orderDateEntry}>{orderData.orderDate}</Text>
        <View style={styles.firstHorizontalLine} />
        <View style={styles.entriesView}>
          <Text style={styles.itemText}>Item</Text>
          <Text style={styles.quantityText}>Quantity</Text>
        </View>
        {orderData.items.map((item, idx) => (
          <View key={idx} style={styles.allEntries}>
            <Text>{item.name}</Text>
            <Text>{item.quantity || 'N/A'}</Text>
          </View>
        ))}
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
        <TouchableOpacity onPress={() => navigation.navigate('Order Tracking', { order })}>
          <Text style={styles.viewDetails}>VIEW DETAILS</Text>
        </TouchableOpacity>
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
  vendorHeaderInfo: { // New style for the container of vendor name and phone
    marginLeft: screenWidth * 0.02,
  },
  vendorName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0F1828',
  },
  supplierPhoneHeader: { // New style for the supplier phone number in the header
    fontSize: 14,
    color: '#6B7280', // A slightly muted color for the phone number
    marginTop: 2, // Small margin to separate from the name
  },
  vendorData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: screenWidth * 0.04,
    marginTop: screenWidth * 0.06,
  },
  dataFlexDirection: {
    flexDirection: 'column',
  },
  customerName: {
    fontWeight: '800',
    fontSize: 18,
    color: '#76B117',
  },
  customerPhone: { // This seems to be for client's phone, but named customerPhone
    fontWeight: '500',
    fontSize: 15,
    color: '#000',
  },
  deliveryDateText: {
    fontWeight: '800',
    fontSize: 18,
    color: '#76B117',
  },
  deliveryDateEntry: {
    fontWeight: '500',
    fontSize: 15,
    color: '#000',
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
    width: '70%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  orderText: {
    fontWeight: '700',
    fontSize: 18,
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
  allEntries: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  horizontalLine: {
    borderBottomWidth: 0.5,
    borderColor: 'lightgray',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#6B7280',
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

export default SpecificOrderScreen;