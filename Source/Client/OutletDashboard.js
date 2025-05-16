import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import {ChevronLeftIcon} from "react-native-heroicons/outline";
import {useNavigation} from '@react-navigation/native';

const { width } = Dimensions.get('window');

const orders = [
  {
    location: 'Crunch (Kalanagar)',
    items: [
      { name: 'Red Cabbage', price: '960', quantity: '8kg', image: require('../Images/VendorProfileImage.png') },
      { name: 'Brocolli', price: '1830', quantity: '15kg', image: require('../Images/VendorProfileImage.png') },
    ],
    total: '11,130',
  },
  {
    location: 'Crunch (Hiranagar)',
    items: [
      { name: 'Carrots', price: '1900', quantity: '25kg', image: require('../Images/VendorProfileImage.png') },
      { name: 'Onion', price: '1530', quantity: '30kg', image: require('../Images/VendorProfileImage.png') },
    ],
    total: '9,580',
  },
  {
    location: 'Crunch (Hiranagar)',
    items: [
      { name: 'Carrots', price: '1900', quantity: '25kg', image: require('../Images/VendorProfileImage.png') },
      { name: 'Onion', price: '1530', quantity: '30kg', image: require('../Images/VendorProfileImage.png') },
    ],
    total: '9,580',
  },
  {
    location: 'Crunch (Hiranagar)',
    items: [
      { name: 'Carrots', price: '1900', quantity: '25kg', image: require('../Images/VendorProfileImage.png') },
      { name: 'Onion', price: '1530', quantity: '30kg', image: require('../Images/VendorProfileImage.png') },
    ],
    total: '9,580',
  },
];

export default function OutletDashboard() {
  const navigation = useNavigation();
  return (
    <ScrollView style={styles.container}>
      <View style = {styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color={'black'} strokeWidth={2} />
        </TouchableOpacity>
        <Text style = {styles.dashboardText}>
          Dashboard
        </Text>
      </View>
      <Text style={styles.dateText}>25 July 2024 / Jaipur</Text>
      {orders.map((order, index) => (
        <View key={index} style={{marginBottom: 30}}>
          <View style={styles.headerRow}>
            <Text style={styles.locationText}>{order.location}</Text>
            <Text style={styles.editOrderText}>Edit Order</Text>
          </View>
          <View style = {styles.cardContainer}>
            <View>
              {order.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Image source={item.image} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹ {item.price}</Text>
                </View>
              ))}
              <View style={styles.itemsContainer} />
              <Text style={styles.orderTotal}>Order Total ₹ {order.total}</Text>
              <View style={styles.itemsContainer}/>
              <Text style={styles.itemCount}>+ 3 Items</Text>
              <View style={styles.itemsContainer}/>
              <TouchableOpacity>
                <Text style={styles.viewSummary}>View Summary</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#F1F5F9',
    marginBottom: 10
  },
  header: {
    flexDirection: "row",
    paddingTop: 20
  },
  dashboardText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    lineHeight: 24,
    color: "#0F1828",
    marginLeft: 10
  },
  dateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
    marginTop: 20,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#65A30D',
  },
  editOrderText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: "underline",
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 10,
    marginTop: 5
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#76B117',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  orderTotal: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#76B117',
    marginTop: 8,
  },
  itemCount: {
    textAlign: 'center',
    fontSize: 14,
    color: '#76B117',
    marginTop: 2,
    fontWeight: "bold"
  },
  viewSummary: {
    textAlign: 'center',
    color: '#76B117',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '800',
  },
});
