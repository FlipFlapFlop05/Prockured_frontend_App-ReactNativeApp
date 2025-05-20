import React, {useEffect, useLayoutEffect, useState} from 'react';
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
  ChartBarIcon,
  ChevronLeftIcon,
} from 'react-native-heroicons/outline';

// import Icon from 'react-native-vector-icons/FontAwesome';

import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import GenericVectorIcon from '../components/GenericVectorIcon';
import {PencilIcon} from 'react-native-heroicons/solid';

const {width} = Dimensions.get('window');

export default function ClientSetting() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModal, setSelectedModal] = useState(null);
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Setting',
      headerStyle: {
        backgroundColor: '#f8f8f8',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
        // color: 'white',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={25} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
  // const menuItems = [
  //   {
  //     id: 1,
  //     icon: 'account-edit-outline',
  //     label: 'Edit Profile Details',
  //     screen: 'Client Profile',
  //   },
  //   {
  //     id: 2,
  //     icon: DocumentChartBarIcon,
  //     label: 'Teams & Roles',
  //     modal: 'teamsRoles',
  //   },
  //   {
  //     id: 3,
  //     icon: 'widgets-outline',
  //     label: 'Multiple Outlet Dashboard',
  //     screen: 'Multiple Outlet Dashboard',
  //   },
  //   {id: 4, icon: ChartBarIcon, label: 'View Report', modal: 'viewReport'},
  //   {id: 5, icon: UserPlusIcon, label: 'Invite Vendor', modal: 'inviteVendor'},
  //   {
  //     id: 6,
  //     icon: BookOpenIcon,
  //     label: 'Manage your catalogs',
  //     screen: 'Catalogue',
  //   },
  //   {
  //     id: 7,
  //     icon: BookOpenIcon,
  //     label: 'Logout',
  //     screen: '',
  //   },
  // ];

  const menuItems = [
    {
      id: 1,
      type: 'vector', // from react-native-vector-icons
      icon: 'account-edit-outline',
      iconType: 'MaterialCommunityIcons',
      label: 'Edit Profile Details',
      screen: 'Client Profile',
    },
    {
      id: 2,
      type: 'vector',
      iconType: 'FontAwesome',
      icon: 'users',
      label: 'Teams & Roles',
      modal: 'teamsRoles',
    },
    {
      id: 3,
      type: 'vector',
      icon: 'widgets-outline',
      iconType: 'MaterialCommunityIcons',
      label: 'Multiple Outlet Dashboard',
      screen: 'Multiple Outlet Dashboard',
    },
    {
      id: 4,
      type: 'hero',
      icon: ChartBarIcon,
      label: 'View Report',
      modal: 'viewReport',
    },
    {
      id: 5,
      type: 'vector',
      iconType: 'AntDesign',
      icon: 'adduser',
      label: 'Invite Vendor',
      modal: 'inviteVendor',
    },
    {
      id: 6,
      type: 'vector',
      iconType: 'Feather',
      icon: 'book',
      label: 'Manage your catalogs',
      screen: 'Catalogue',
    },
    {
      id: 7,
      type: 'vector',
      icon: 'logout',
      iconType: 'AntDesign',
      label: 'Logout',
      screen: '',
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
      {item.type === 'vector' ? (
        <GenericVectorIcon
          type={item.iconType}
          name={item.icon}
          size={item.iconType === 'FontAwesome' ? 24 : 28}
          color={item.label === 'Logout' ? '#900' : '#333'}
          style={styles.menuItemIcon}
        />
      ) : (
        <item.icon size={28} color="#333" style={styles.menuItemIcon} />
      )}
      <Text style={styles.menuItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  // const renderMenuItem = ({item}) => (
  //   <TouchableOpacity style={styles.menuItem} onPress={() => handlePress(item)}>
  //     {/* <item.icon size={20} color={'#333'} style={styles.menuItemIcon} /> */}
  //     <Icons name={item.icon} size={28} className="mr-1" />

  //     <Text style={styles.menuItemText} className="mx-1">
  //       {item.label}
  //     </Text>
  //   </TouchableOpacity>
  // );

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

        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
            }}
            style={styles.profileImage}
          />

          <View style={styles.iconWrapper}>
            <TouchableOpacity style={styles.editIconButton}>
              <PencilIcon size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>Hey {data?.Name}!</Text>
          <Text style={styles.profileType}>Client</Text>
        </View>

        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={item => item.id.toString()}
        />

        {/* <TouchableOpacity style={styles.logoutButton}>
          <ArrowRightStartOnRectangleIcon
            size={20}
            color="red"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity> */}
        {/* hhh */}
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
    width: 140,
    height: 140,
    borderRadius: 100,
    marginBottom: -12,
    borderWidth: 1,
    borderColor: '#76B117',
  },
  profileName: {
    fontWeight: '800',
    color: 'black',
    fontSize: 25,
    marginBottom: 1,
    marginTop: 25,
  },
  profileType: {
    fontWeight: '500',
    color: 'black',
    fontSize: 18,
  },
  iconWrapper: {
    position: 'absolute',
    top: 110,
    right: 120,
  },

  editIconButton: {
    backgroundColor: '#76B117',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Optional: for slight shadow on Android
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 1.5,
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
