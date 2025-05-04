import React from 'react';
import {View, Text, StyleSheet, Dimensions, Image, ScrollView, TouchableOpacity} from 'react-native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import {useNavigation} from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const OrderTracking = () => {
  const navigation = useNavigation();
  const orderItems = [
    { name: 'Potatoes', quantity: '50 Pounds' },
    { name: 'Carrots', quantity: '30 Pounds' },
    { name: 'Onions', quantity: '20 Pounds' },
    { name: 'Tomatoes', quantity: '15 Pounds' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color={'black'} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Image
          source={{ uri: "https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fdiary.png?alt=media&token=28574722-8076-44a0-a093-53e6132b9945" }} // Replace with your image path
          style={styles.trackingImage}
          resizeMode="contain"
        />

        <View style={styles.itemsContainer}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemHeaderText}>Item</Text>
            <Text style={styles.itemHeaderText}>Quantity</Text>
          </View>
          {orderItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>{item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdText}>Order ID - #1548745</Text>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot}></View>
            <Text style={styles.timelineText}>Order Placed</Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot}></View>
            <Text style={styles.timelineText}>Order Accepted</Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.timelineEmptyDot}></View>
            <Text style={styles.timelineText}>Out for delivery</Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.timelineEmptyDot}></View>
            <Text style={styles.timelineText}>Order delivered</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Off-white background
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    flexDirection: 'row'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    alignItems: 'center', // Center content horizontally
  },
  trackingImage: {
    width: screenWidth * 0.8, // Adjust width as needed
    height: screenWidth * 0.6, // Maintain aspect ratio (example)
    marginBottom: 20,
  },
  itemsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%', // Full width
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  itemHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#666',
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
  orderIdContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeline: {
    width: '100%',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'green',
    marginRight: 10,
  },
  timelineEmptyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'gray',
    marginRight: 10,
  },
  timelineText: {
    fontSize: 16,
  },
});

export default OrderTracking;
