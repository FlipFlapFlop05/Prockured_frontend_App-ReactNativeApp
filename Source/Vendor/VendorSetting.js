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
import {XMarkIcon, ClipboardDocumentIcon} from 'react-native-heroicons/outline';
import {CheckCircleIcon} from 'react-native-heroicons/solid';
import {Clipboard} from 'react-native'; // if not using Expo

// import Icon from 'react-native-vector-icons/FontAwesome';

import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import GenericVectorIcon from '../components/GenericVectorIcon';
import {PencilIcon} from 'react-native-heroicons/solid';
import Config from 'react-native-config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';

const {width} = Dimensions.get('window');

export default function VendorSetting() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModal, setSelectedModal] = useState(null);
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [inviteVendor, setInviteVendor] = useState(false);
  const [copied, setCopied] = useState(false);

  const clientId = 'V-4561';
  const inviteLink = `https://client.invite/${clientId}`;

  const copyToClipboard = text => {
    Clipboard.setString(text);
    setCopied(true);

    // Hide the message after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Setting',
      headerStyle: {
        backgroundColor: '#f8f8f8',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
        justifyContent: 'center',
        // color: 'white',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={28} color="#333" />
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
            `https://api-v7quhc5aza-uc.a.run.app/getSupplierDetails/${phoneNumber}`,
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

  const menuItems = [
    {
      id: 1,
      type: 'vector', // from react-native-vector-icons
      icon: 'account-edit-outline',
      iconType: 'MaterialCommunityIcons',
      label: 'Edit Profile Details',
      screen: 'Vendor Profile',
    },
    {
      id: 2,
      type: 'vector',
      iconType: 'FontAwesome',
      icon: 'users',
      label: 'Minimum Order Value',
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
      label: 'Customer',
      screen: 'Customers',
    },
    {
      id: 4,
      type: 'vector',
      iconType: 'AntDesign',
      icon: 'adduser',
      label: 'Invite Customer',
      modal: 'inviteVendor',
    },
    {
      id: 5,
      type: 'vector',
      iconType: 'Feather',
      icon: 'book',
      label: 'Manage your catalogs',
      screen: 'Catalogue',
    },
    {
      id: 6,
      type: 'vector',
      icon: 'logout',
      iconType: 'AntDesign',
      label: 'Logout',
      action: handleLogout,
    },
  ];

  const handlePress = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.modal) {
      setSelectedModal(item.modal);
      setModalVisible(true);
    } else if(item.action) {
      item.action();
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

  const renderVendorItem = () => {
    switch (selectedModal) {
      case 'inviteVendor':
        return (
          <View>
            <Modal visible={modalVisible} animationType="slide" transparent>
              <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 20,
                    }}>
                    <Text style={styles.title}>Share this link</Text>
                    <View style={{flexDirection: 'row'}}>
                      <TouchableOpacity
                        onPress={() => copyToClipboard(inviteLink)}
                        style={{flexDirection: 'row'}}>
                        {/* <ClipboardDocumentIcon size={22} color="#76B117" /> */}
                        <Icon
                          name="content-copy"
                          size={22}
                          color={'#76B117'}
                          style={{marginRight: 3}}
                        />
                        <Text style={styles.copyText}>Copy Link</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.closeButton}>
                        <XMarkIcon size={20} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.linkBox}>
                    <Text style={styles.linkText}>{inviteLink}</Text>
                  </View>

                  {copied && (
                    <Text style={styles.copiedMessage}>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <AntIcon
                          name="checkcircle"
                          color={'#76B117'}
                          style={{marginHorizontal: 5}}
                        />
                      </View>
                      Link copied. <Text></Text>
                      <Text style={{fontWeight: '600'}}>
                        Anyone with this link can join
                      </Text>
                    </Text>
                  )}
                </View>
              </View>
            </Modal>
          </View>
        );

      default:
        return null;
    }
  };

  const renderModalContent = () => {
    switch (selectedModal) {
      case 'teamsRoles':
        return <Text style={styles.categoryText}>Feature Not Available</Text>;
      case 'viewReport':
        return <Text style={styles.categoryText}>Feature Not Available</Text>;
      default:
        return null;
    }
  };

  const handleLogout = () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Authentication', params: { screen: 'LogIn' } }],
            });
          } catch (e) {
            console.error("Error during logout: ", e);
          }
        },
      },
    ],
    { cancelable: true }
  );
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          {renderVendorItem()}
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
          <Text style={styles.profileType}>Vendor</Text>
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
  overlay: {
    flex: 1,
    backgroundColor: '#8E8E8E52',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginLeft: 10,
    textAlignVertical: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Montserrat',
    letterSpacing: 0.5,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Montserrat',
    color: '#76B117',
    marginLeft: 3,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F4F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  linkText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  copiedMessage: {
    marginTop: 15,
    paddingTop: 10,
    backgroundColor: '#107C1014',
    color: '#323232',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    padding: 5,
    paddingVertical: 6,
    borderRadius: 7,
  },
});
