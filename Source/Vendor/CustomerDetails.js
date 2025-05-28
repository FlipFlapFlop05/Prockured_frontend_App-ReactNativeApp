import React, {useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import {useNavigation, useRoute} from '@react-navigation/native';

const {width: screenWidth} = Dimensions.get('window');

const CustomerDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {customer} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: `${customer.name}`,
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#fff',
      },
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 20,
        fontFamily: 'Montserrat',
        justifyContent: 'center',
        color: '#76B117',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: 15}}>
          <ChevronLeftIcon size={22} color="#333" strokeWidth={2} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  function formatDate(dateStr) {
    const [day, month, year] = dateStr.split('-');

    const date = new Date(`${year}-${month}-${day}`);

    const options = {day: '2-digit', month: 'long', year: 'numeric'};

    return date.toLocaleDateString('en-GB', options);
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 20,
        }}>
        <View style={{flexDirection: 'column'}}>
          <Text
            style={{
              color: '#76B117',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: 16,
            }}>
            {customer.customerName}
          </Text>
          <Text
            style={{
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: 14,
              color: '#2C3E50',
            }}>
            {customer.customerNumber}
          </Text>
        </View>
        <View style={{flexDirection: 'column'}}>
          <Text
            style={{
              color: '#76B117',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: 16,
            }}>
            {customer.customerLocation}
          </Text>
          <Text
            style={{
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: 14,
              color: '#2C3E50',
            }}>
            {formatDate(customer.orderDate)}
          </Text>
        </View>
      </View>

      <View style={{padding: 20}}>
        <Text
          style={{
            color: '#76B117',
            fontStyle: 'normal',
            fontWeight: 700,
            fontSize: 17,
            fontFamily: 'Montserrat',
          }}>
          Due Amount*
        </Text>
        <View
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: '#76B117',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: 24,
              fontFamily: 'Montserrat',
            }}>
            Total
          </Text>
          <Text
            style={{
              color: '#76B117',
              fontStyle: 'normal',
              fontWeight: 'bold',
              fontSize: 28,
              marginLeft: '3%',
              fontFamily: 'Montserrat',
            }}>
            {customer.orderTotal}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Past Order {'\n'} Date</Text>
          <Text style={styles.tableHeaderText}>Most {'\n'} Ordered</Text>
          <Text style={styles.tableHeaderText}>Number of {'\n'} Items</Text>
          <Text style={styles.tableHeaderText}>Total {'\n'} Value</Text>
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
    backgroundColor: '#fff', // Light background
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
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
    fontWeight: 'bold',
  },
  content: {
    // padding: 10,
    paddingHorizontal: '6%',
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: '3%',
    // marginLeft: 10,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingVertical: '3%',
  },
  tableHeaderText: {
    fontWeight: 700,
    fontSize: 13,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#76B117',
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '4%',
    paddingVertical: '2%',
    borderBottomWidth: 1, // Add border to rows
    borderBottomColor: '#eee', // Light border color
    width: '97%',
    marginHorizontal: '1%',
    paddingHorizontal: '3%',
  },
  tableCell: {
    fontSize: 14,
    color: '#2C3E50',
    fontFamily: 'Montserrat',
  },
  bottomBar: {
    backgroundColor: 'white',
    // padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    // Add pagination or other controls here
  },
});

export default CustomerDetails;
