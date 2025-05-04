import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import {ChevronLeftIcon} from "react-native-heroicons/outline";
import {useNavigation, useRoute} from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const CustomerDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { customer } = route.params;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={22} color={"black"} strokeWidth={3}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{customer.name}</Text>
      </View>
      <View style = {{flexDirection: "row", justifyContent: "space-between", padding: 20}}>
        <View style = {{flexDirection: "column"}}>
          <Text style={{color: "#76B117", fontStyle: "normal", fontWeight: "bold", fontSize: 18}}>
            {customer.customerName}
          </Text>
          <Text style = {{fontStyle: "normal", fontWeight: 700, fontSize: 14}}>
            {customer.customerNumber}
          </Text>
        </View>
        <View style = {{flexDirection: "column"}}>
          <Text style={{color: "#76B117", fontStyle: "normal", fontWeight: "bold", fontSize: 18}}>
            {customer.customerLocation}
          </Text>
          <Text style = {{fontStyle: "normal", fontWeight: 700, fontSize: 14}}>
            {customer.orderDate}
          </Text>
        </View>
      </View>

      <View style = {{padding: 20}}>
        <Text style = {{color: "#76B117", fontStyle: "normal", fontWeight: "bold", fontSize: 22}}>
          Due Amount*
        </Text>
        <Text style = {{color: "#76B117", fontStyle: "normal", fontWeight: "bold", fontSize: 28}}>
          {customer.orderTotal}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Past Order {"\n"} Date</Text>
          <Text style={styles.tableHeaderText}>Most {"\n"} Ordered</Text>
          <Text style={styles.tableHeaderText}>Number of {"\n"} Items</Text>
          <Text style={styles.tableHeaderText}>Total {"\n"} Value</Text>
        </View>

        {customer.pastOrders.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.PastOrderDate}</Text>
            <Text style={styles.tableCell}>{item.MostOrdered}</Text>
            <Text style={styles.tableCell}>{item.NumberOfItems}</Text>
            <Text style={styles.tableCell}>₹{item.TotalValue}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        {/* You can add pagination or other controls here */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light background
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: "row",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20
  },
  searchBar: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    paddingLeft: 15, // Add padding for search icon (if needed)
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#eee',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: "bold"
  },
  content: {
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 10,
    marginLeft: 10
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    color: "#76B117"
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 8,
    borderBottomWidth: 1, // Add border to rows
    borderBottomColor: '#eee', // Light border color
  },
  tableCell: {
    fontSize: 16,
  },
  bottomBar: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    // Add pagination or other controls here
  },
});

export default CustomerDetails;
