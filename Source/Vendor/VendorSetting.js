import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Modal} from 'react-native';
import {
  UserIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
  UserPlusIcon,
  BookOpenIcon,
  ArrowRightStartOnRectangleIcon,
} from 'react-native-heroicons/outline';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';




export default function VendorSetting() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModal, setSelectedModal] = useState(null);
  const [data, setData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState(null);

  const handleLogout = async () => {
    try{
      await AsyncStorage.clear();

      navigation.navigate('Authentication', { screen: 'LogIn' })
    } catch(e){
      console.error("Error during logout: ", e);
    }
  }

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (phoneNumber) {
        try {
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getSupplierDetails/${phoneNumber}`
          );
          setData(response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (phoneNumber) {fetchData();}
  }, [phoneNumber]);
  const menuItems = [
    { id: 1, icon: UserIcon, label: 'Edit Profile Details', screen: 'Vendor Profile'},
    { id: 2, icon: DocumentChartBarIcon, label: 'Minimum Order Value : ', value: '₹ 5,000', valueColor: 'green', modal: 'minimumOrderValue' },
    { id: 3, icon: UserCircleIcon, label: 'Customer', screen: 'Customers' },
    { id: 4, icon: BookOpenIcon, label: 'Teams & Roles', modal: 'viewReport'},
    { id: 5, icon: UserPlusIcon, label: 'Invite Customer', modal: 'inviteCustomer' },
    { id: 6, icon: BookOpenIcon, label: 'Manage your catalogs', screen: 'Catalogue' },
  ];

  const handlePress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.modal) {
      setSelectedModal(item.modal);
      setModalVisible(true);
    }
  };
  const renderModalContent = () => {
    switch (selectedModal) {
      case 'minimumOrderValue':
        return <Text style={styles.categoryText}>Feature Not Available</Text>;
      case 'viewReport':
        return <Text style={styles.categoryText}>Feature Not Available</Text>;
      case 'inviteCustomer':
        return <Text style={styles.categoryText}>Feature Not Available</Text>;
      default:
        return null;
    }
  };
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handlePress(item)}>
      <item.icon size={20} color={'#333'} style={styles.menuItemIcon} />
      <Text style={styles.menuItemText}>{item.label}</Text>
    </TouchableOpacity>
  );
  return(
    <View style = {{flex: 1, display: 'flex'}}>
      {/* Header */}
      <View style = {{padding: 22, flexDirection: 'row', alignContent: 'center', alignSelf: "center", marginBottom: 10}}>
        <Text style = {{fontSize: 20, fontWeight: 'bold', color: 'black'}}>
          Setting
        </Text>
      </View>

      <View style = {{alignContent: 'center', alignSelf: 'center', flexDirection: 'column', marginBottom: 20, justifyContent: 'center', alignItems: 'center'}}>
        <Image
          source={require('../Images/VendorProfileImage.png')}
          style = {{width: 120, height: 120, borderRadius: 50, marginBottom: 10}}
        />
        <Text style = {{fontWeight: '800', color: 'black', fontSize: 32, marginBottom: 10}}>
          {data.Name}
        </Text>
        <Text style = {{fontWeight: '500', color: 'black', alignContent: 'center', alignSelf: 'center', fontSize: 18}}>
          Vendor
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {renderModalContent()}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data = {menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMenuItem}
      />

      <TouchableOpacity style = {{borderColor: 'red', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: '15', borderRadius: 10, marginBottom: 10, borderWidth: 1}} onPress={handleLogout}>
        <ArrowRightStartOnRectangleIcon size={20} color={'red'} style = {{marginRight: 10}} />
        <Text style={{color: 'red', fontWeight: 'bold'}}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%'
  },
  modalCloseButton: {
    marginTop: 10,
    backgroundColor: '#76B117',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  menuItemIcon: {
    marginRight: 10
  },
  menuItemText: {
    fontSize: 16
  },
})
