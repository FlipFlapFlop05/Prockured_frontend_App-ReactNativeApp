import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';

const {width: screenWidth} = Dimensions.get('window');

const timelineStages = [
  'Order Placed',
  'Order Accepted',
  'Out for delivery',
  'Order delivered',
];

const getStageFromFoundIn = foundIn => {
  switch (foundIn) {
    case 'Pending':
      return 0;
    case 'Open_Orders':
      return 1;
    case 'Confirmed_Orders':
      return 2;
    default:
      return 0;
  }
};

const OrderTracking = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {order} = route.params;

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderStatus = async () => {
      try {
        const response = await axios.post(
          'https://api-v7quhc5aza-uc.a.run.app/orderTracking',
          {
            clientGST: order.clientGST,
            orderId: order.orderId,
          },
        );

        if (response?.data) {
          setOrderData(response.data);
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    orderStatus();
  }, []);

  const orderItems =
    orderData?.orderDetails?.[orderData?.orderDetails?.supplierGST]?.items ||
    [];
  const activeStageIndex = getStageFromFoundIn(orderData?.foundIn);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color={'black'} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="green" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Image
            source={{
              uri: 'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fdiary.png?alt=media&token=28574722-8076-44a0-a093-53e6132b9945',
            }}
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
            <Text style={[styles.orderIdText, {color: '#76B117'}]}>
              Order ID - #
              <Text style={{textDecorationLine: 'underline'}}>
                {order.orderId}
              </Text>
            </Text>
          </View>

          <View style={styles.timeline}>
            {timelineStages.map((label, index) => {
              const isCompleted = index < activeStageIndex;
              const isCurrent = index === activeStageIndex;
              const isUpcoming = index > activeStageIndex;

              return (
                <View key={index}>
                  <View style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted || isCurrent
                          ? styles.dotGreen
                          : styles.dotGrey,
                      ]}
                    />
                    <Text
                      style={[
                        styles.timelineText,
                        isCurrent
                          ? styles.textGreen
                          : isCompleted
                          ? styles.timelineText
                          : styles.textGrey,
                      ]}>
                      {label}
                    </Text>
                  </View>
                  {index < timelineStages.length - 1 && (
                    <View
                      style={[
                        styles.line,
                        isCompleted ? styles.lineGreen : styles.lineDotted,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    padding: 20,
    // alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingImage: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.6,
    marginBottom: 20,
    alignItems: 'center',
    marginHorizontal: 'auto',
  },
  itemsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
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
    display: 'flex',
    justifyContent: 'flex-start',
    // alignItems: 'flex-start',
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  timeline: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  dotGreen: {
    backgroundColor: '#76B117',
  },
  dotGrey: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#C4C4C4',
  },
  timelineText: {
    fontSize: 16,
  },
  textGreen: {
    color: '#76B117',
    fontWeight: 'bold',
  },
  textGrey: {
    color: '#C4C4C4',
  },
  line: {
    height: 30,
    marginLeft: '2%', // align under dot
    // marginVertical: '1%',
  },
  lineGreen: {
    width: 2,
    backgroundColor: '#76B117',
  },
  lineDotted: {
    width: 2,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#C4C4C4',
  },
});

export default OrderTracking;
