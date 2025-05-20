import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'react-native-heroicons/outline';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const {width, height} = Dimensions.get('window');

export default function MultipleOutletDashboard() {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Outlets',
      headerStyle: {
        backgroundColor: '#f8f9fe',
        elevation: 0,
        shadowColor: 'transparent',
        shadowOffset: {height: 0},
        shadowRadius: 0,
        borderBottomWidth: 0,
        fontFamily: 'Montserrat',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={23} strokeWidth={2} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('phoneNumber');
        if (storedId) {
          setClientId(storedId);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };

    fetchClientId();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (clientId) {
        try {
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getOutlets/${clientId}`,
          );
          setData(Object.values(response.data));
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchData();
  }, [clientId]);

  const renderOutletItem = ({item}) => (
    <View style={styles.outletItem}>
      <View>
        <Text style={styles.outletName}>{item.OutletName}</Text>
        <Text style={styles.outletAddress}>{item.BillingAddress}</Text>
        <Text style={styles.outletAddress}>{item.Address}</Text>
        <Text style={styles.outletAddress}>
          {item.city} {item.state} {item.country}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          console.log('Selected Outlet:', item); // Debug log

          setSelectedOutlet(item);
          setModalVisible(true);
        }}>
        <ChevronRightIcon size={20} color={'#76B117'} strokeWidth={5} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Choose an Option</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('Add Outlet', {outlet: selectedOutlet});
              }}>
              <Text style={styles.buttonText}>Edit Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('Outlet Dashboard', {
                  outlet: selectedOutlet,
                });
              }}>
              <Text style={styles.buttonText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="always">
          {/* <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={25} color={'black'} strokeWidth={3} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Outlets</Text>
          </View> */}

          <TouchableOpacity
            style={styles.addOutletButton}
            onPress={() => navigation.navigate('Add Outlet')}>
            <Text style={styles.addOutletText}>+ Add New Outlet</Text>
          </TouchableOpacity>

          <Text style={styles.otherOutletsTitle}>Other Outlets</Text>

          <FlatList
            data={data}
            renderItem={renderOutletItem}
            keyExtractor={item => item.outletId}
            numColumns={1}
            contentContainerStyle={styles.flatListContent}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fe',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fe',
  },
  header: {
    flexDirection: 'row',
    padding: 10,
    height: 80,
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 10,
    color: '#0F1828',
    fontSize: 22,
    fontWeight: '700',
  },
  addOutletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // height: height * 0.06,
    backgroundColor: 'white',
    paddingTop: 15,
    paddingBottom: 15,
    height: 60,
  },
  addOutletText: {
    paddingLeft: width * 0.05,
    color: '#76B117',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat',
  },
  otherOutletsTitle: {
    paddingLeft: 25,
    padding: 20,
    color: 'black',
    fontSize: 18,
    fontWeight: '700',
  },
  outletItem: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outletName: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: '700',
  },
  outletAddress: {
    color: '#2C3E50',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 5,
  },
  flatListContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#76B117',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeText: {
    marginTop: 15,
    color: 'red',
    fontSize: 16,
  },
});
