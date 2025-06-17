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
  if (!customer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Customer details not found.</Text>
      </View>
    );
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: `${customer.name || 'Customer Details'}`, 
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
  }, [navigation, customer.name]); 
  function formatDate(dateStr) {
    if (!dateStr || dateStr === 'N/A') {
        return 'N/A';
    }
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day); 
    const options = {day: '2-digit', month: 'long', year: 'numeric'};
    return date.toLocaleDateString('en-GB', options);
  }

  return (
    <View style={styles.container}>
      <View
        style={styles.customerDetailsContainer}>
        <View style={styles.customerDetailsView}>
          <Text style={styles.nameText}>
            {customer.name || 'N/A'} 
          </Text>
          <Text style={styles.phoneText}>
            {customer.phone || 'N/A'} 
          </Text>
        </View>
        <View style={styles.customerDetailsView}>
          <Text style={styles.stateText}>
            {customer.state || 'N/A'} 
          </Text>
          <Text style={styles.orderDateText}>
            {formatDate(customer.lastOrderDate)} 
          </Text>
        </View>
      </View>

      <View style={styles.dueAmountView}>
        <Text
          style={styles.dueAmountText}>
          Due Amount*
        </Text>
        <View style={styles.totalAmountView}>
          <Text
            style={styles.totalText}>
            Total
          </Text>
          <Text
            style={styles.amountText}>
            {customer.lastOrderTotal || '₹0.00'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Order Date</Text> 
          <Text style={styles.tableHeaderText}>Item Name</Text> 
          <Text style={styles.tableHeaderText}>Quantity</Text> 
          <Text style={styles.tableHeaderText}>Price</Text> 
        </View>

        {/* Iterate over lastOrderItems */}
        {customer.lastOrderItems && customer.lastOrderItems.length > 0 ? (
          customer.lastOrderItems.map((item, index) => (
            <View key={item.itemId || index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{formatDate(customer.lastOrderDate)}</Text>
              <Text style={styles.tableCell}>{item.name || 'N/A'}</Text>
              <Text style={styles.tableCell}>{item.quantity || 0}</Text>
              <Text style={styles.tableCell}>₹{item.price !== undefined ? Number(item.price).toFixed(2) : '0.00'}</Text>
            </View>
          ))
        ) : (
          <View style={styles.noItemsContainer}>
            <Text style={styles.noItemsText}>No items found for the last order.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingLeft: 15,
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
    paddingHorizontal: '6%',
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed to space-around for even distribution
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: '3%',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingVertical: '3%',
  },
  tableHeaderText: {
    fontWeight: '700', // Changed to string
    fontSize: 13,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#76B117',
    textAlign: 'center',
    fontFamily: 'Montserrat',
    flex: 1, // Added flex to distribute space
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed to space-around
    marginVertical: '4%',
    paddingVertical: '2%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '97%',
    marginHorizontal: '1%',
    paddingHorizontal: '3%',
  },
  tableCell: {
    fontSize: 14,
    color: '#2C3E50',
    fontFamily: 'Montserrat',
    textAlign: 'center', // Centered text for table cells
    flex: 1, // Added flex to distribute space
  },
  bottomBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
  },
  noItemsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noItemsText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  customerDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20
  },
  customerDetailsView: {
    flexDirection: 'column'
  },
  nameText: {
    color: '#76B117',
    fontStyle: 'normal',
    fontWeight: '600', 
    fontSize: 16
  },
  stateText: {
    color: '#76B117',
    fontStyle: 'normal',
    fontWeight: '600', 
    fontSize: 16
  },
  phoneText: {
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    color: '#2C3E50'
  },
  orderDateText: {
    fontStyle: 'normal',
    fontWeight: '400', 
    fontSize: 14,
    color: '#2C3E50'
  },
  dueAmountView: {
    padding: 20
  },
  dueAmountText: {
    color: '#76B117',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 17,
    fontFamily: 'Montserrat',
  },
  totalAmountView: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center'
  },
  totalText: {
    color: '#76B117',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 24,
    fontFamily: 'Montserrat'
  },
  amountText: {
    color: '#76B117',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: 28,
    marginLeft: '3%',
    fontFamily: 'Montserrat'
  }
});

export default CustomerDetails;