import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  UserIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
  UserPlusIcon,
  BookOpenIcon,
  ArrowRightStartOnRectangleIcon,
  MapIcon,
} from 'react-native-heroicons/outline';

import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

export default function ClientSetting() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModal, setSelectedModal] = useState(null);
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState(null);

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
            `https://api-v7quhc5aza-uc.a.run.app/getClient/${phoneNumber}`,
          );
          setData(response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (phoneNumber) {
      fetchData();
    }
  }, [phoneNumber]);

  // Define menu items with corresponding modals
  const menuItems = [
    {
      id: 1,
      icon: UserIcon,
      label: 'Edit Profile Details',
      screen: 'Client Profile',
    },
    {
      id: 2,
      icon: DocumentChartBarIcon,
      label: 'Teams & Roles',
      modal: 'teamsRoles',
    },
    {
      id: 3,
      icon: MapIcon,
      label: 'Multiple Outlet Dashboard',
      screen: 'Multiple Outlet Dashboard',
    },
    {id: 4, icon: BookOpenIcon, label: 'View Report', modal: 'viewReport'},
    {id: 5, icon: UserPlusIcon, label: 'Invite Vendor', modal: 'inviteVendor'},
    {
      id: 6,
      icon: BookOpenIcon,
      label: 'Manage your catalogs',
      screen: 'Catalogue',
    },
  ];

  const handlePress = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.modal) {
      setSelectedModal(item.modal);
      setModalVisible(true);
    }
  };

  const renderMenuItem = ({item}) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handlePress(item)}>
      <item.icon size={20} color={'#333'} style={styles.menuItemIcon} />
      <Text style={styles.menuItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderModalContent = () => {
    switch (selectedModal) {
      case 'teamsRoles':
        return <Text style={styles.categoryText}>Feature Not Available</Text>;
      case 'viewReport':
        return <Text style={styles.categoryText}>Feature Not Available</Text>;
      case 'inviteVendor':
        return <Text style={styles.categoryText}>Feature Not Available</Text>;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} className="bg-white">
      <View style={styles.container} className="bg-white">
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {renderModalContent()}
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Icons name="account-edit-outline" size={28} />

        <View style={styles.profileContainer}>
          <Image
            source={require('../Images/ProckuredImage.jpg')}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Hey {data?.Name}!</Text>
          <Text style={styles.profileType}>Client</Text>
        </View>

        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={item => item.id.toString()}
        />

        <TouchableOpacity style={styles.logoutButton}>
          <ArrowRightStartOnRectangleIcon
            size={20}
            color="red"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 170,
    height: 170,
    borderRadius: 60,
    marginBottom: -12,
  },
  profileName: {
    fontWeight: '800',
    color: 'black',
    fontSize: 25,
    marginBottom: 1,
  },
  profileType: {
    fontWeight: '500',
    color: 'black',
    fontSize: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  menuItemIcon: {
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'red',
  },
  logoutIcon: {
    marginRight: 10,
    color: 'red',
  },
  logoutButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 10,
    backgroundColor: '#76B117',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
