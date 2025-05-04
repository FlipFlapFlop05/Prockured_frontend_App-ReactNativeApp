import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, TextInput } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const SpecificOrderScreen = () => {
  const orderData = {
    vendor: 'Frugreen',
    customerName: 'Mr. Karan Rao',
    customerPhone: '+91 9876543210',
    deliveryDate: '24 June 2024',
    orderDate: 'Fri 21 June',
    items: [
      { name: 'Potatoes', quantity: '50 Pounds' },
      { name: 'Carrots', quantity: '30 Pounds' },
      { name: 'Onions', quantity: '20 Pounds' },
      { name: 'Tomatoes', quantity: '15 Pounds' },
    ],
    totalItems: '04',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Details</Text> {/* Added a title */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{orderData.vendor}</Text>
          <Text style={styles.customerName}>{orderData.customerName}</Text>
          <Text style={styles.customerPhone}>{orderData.customerPhone}</Text>
        </View>

        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryDate}>{orderData.deliveryDate}</Text>
        </View>

        <TextInput
          style={styles.commentInput}
          placeholder="Comment"
          multiline={true}
        />

        <View style={styles.orderContainer}>
          <Text style={styles.orderDate}>{orderData.orderDate}</Text>
          <View style={styles.itemsContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemHeaderText}>Item</Text>
              <Text style={styles.itemHeaderText}>Quantity</Text>
            </View>
            {orderData.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>{item.quantity}</Text>
              </View>
            ))}
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.totalItemsText}>Ordered products {orderData.totalItems}</Text>
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsButtonText}>VIEW DETAILS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light gray background
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center', // Center header title
  },
  headerTitle: { // Style for the header title
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  vendorInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 16,
    marginBottom: 5,
  },
  customerPhone: {
    fontSize: 16,
    color: '#666',
  },
  deliveryInfo: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  deliveryDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    height: 80, // Set a fixed height for multiline input
    textAlignVertical: 'top',
  },
  orderContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  orderDate: {
    fontSize: 16,
    marginBottom: 10,
  },
  itemsContainer: {
    marginBottom: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 10,
  },
  itemHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 16,
  },
  itemQuantity: {
    fontSize: 16,
    color: '#666',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalItemsText: {
    fontSize: 16,
  },
  viewDetailsButton: {
    backgroundColor: 'lightgreen', // Example button color
    borderRadius: 5,
    padding: 8,
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default SpecificOrderScreen;
