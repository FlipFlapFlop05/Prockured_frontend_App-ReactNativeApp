// (Keep all previous imports – no changes needed in import section)
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
  Alert,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  ChevronLeftIcon,
  PencilIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import {CheckCircleIcon} from 'react-native-heroicons/solid';
import {Clipboard} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import GenericVectorIcon from '../components/GenericVectorIcon';

const {width} = Dimensions.get('window');

export default function VendorSetting() {
  const [modalVisible, setModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [selectedModal, setSelectedModal] = useState(null);
  const [minOrderValue, setMinOrderValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [gstNumber, setGSTNumber] = useState(null);
  const [data, setData] = useState([]);
  const [copied, setCopied] = useState(false);

  const navigation = useNavigation();
  const clientId = 'V-4561';
  const inviteLink = `https://client.invite/${clientId}`;

  const copyToClipboard = text => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Setting',
      headerStyle: {backgroundColor: '#f8f8f8', elevation: 0},
      headerTitleStyle: {fontWeight: '700', fontSize: 20},
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{paddingHorizontal: 15}}>
          <ChevronLeftIcon size={22} color="#333" strokeWidth={2} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchGST = async () => {
      const gst = await AsyncStorage.getItem('supplierGST');
      if (gst) setGSTNumber(gst);
    };
    fetchGST();
  }, []);

  useEffect(() => {
    if (gstNumber) {
      axios.get(`https://api-v7quhc5aza-uc.a.run.app/getSupplierDetails/${gstNumber}`)
        .then(res => setData(res.data))
        .catch(err => console.log(err));
    }
  }, [gstNumber]);

  useEffect(() => {
    loadMinOrderValue();
  }, []);

  const loadMinOrderValue = async () => {
    try {
      const value = await AsyncStorage.getItem('minOrderValue');
      if (value) setMinOrderValue(value);
    } catch (e) {
      console.log('Error loading minOrderValue:', e);
    }
  };

  const saveMinOrderValue = async () => {
    try {
      await AsyncStorage.setItem('minOrderValue', inputValue);
      setMinOrderValue(inputValue);
      setModalVisible(false);
    } catch (e) {
      console.log('Error saving minOrderValue:', e);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({index: 0, routes: [{name: 'Authentication', params: {screen: 'LogIn'}}]});
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: 1,
      type: 'vector',
      icon: 'account-edit-outline',
      iconType: 'MaterialCommunityIcons',
      label: 'Edit Profile Details',
      screen: 'Vendor Profile',
    },
    {
      id: 2,
      type: 'vector',
      iconType: 'Ionicons',
      icon: 'receipt-outline',
      label: `Minimum Order Value${minOrderValue ? `: ₹${minOrderValue}` : ''}`,
      modal: 'minOrderValue',
    },
    {
      id: 3,
      type: 'vector',
      iconType: 'Feather',
      icon: 'user-check',
      label: 'Customer',
      screen: 'Customers',
    },
    {
      id: 4,
      type: 'vector',
      icon: 'account-group-outline',
      iconType: 'MaterialCommunityIcons',
      label: 'Teams & Roles',
      modal: 'teamsRoles',
    },
    {
      id: 5,
      type: 'vector',
      iconType: 'AntDesign',
      icon: 'adduser',
      label: 'Invite Customer',
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
      label: 'Log out',
      action: handleLogout,
    },
  ];

  const handlePress = item => {
    if (item.screen) navigation.navigate(item.screen);
    else if (item.modal) {
      setSelectedModal(item.modal);
      setModalVisible(true);
    } else if (item.action) item.action();
  };

  const renderVendorItem = () => {
    if (selectedModal === 'inviteVendor') {
      return (
        <View style={styles.modalContainer}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.title}>Share this link</Text>
            <View style = {{flexDirection: 'row'}}>
              <TouchableOpacity onPress={() => copyToClipboard(inviteLink)} style={{flexDirection: 'row'}}>
                <Icon name="content-copy" size={22} color="#76B117" />
                <Text style={styles.copyText}> Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <XMarkIcon size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.linkBox}>
            <Text style={styles.linkText}>{inviteLink}</Text>
          </View>
          {copied && (
            <Text style={styles.copiedMessage}>
              <AntIcon name="checkcircle" color="#76B117" /> Link copied. <Text style={{fontWeight: '600'}}>Anyone with this link can join</Text>
            </Text>
          )}
        </View>
      );
    } else if (selectedModal === 'minOrderValue') {
      return (
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Set Minimum Order Value</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              padding: 10,
              marginTop: 10,
            }}
            keyboardType="numeric"
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter value in ₹"
          />
          <TouchableOpacity
            style={[styles.modalCloseButton, {marginTop: 20, alignItems: 'center'}]}
            onPress={saveMinOrderValue}
          >
            <Text style={styles.modalCloseButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderMenuItem = ({item}) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handlePress(item)}>
      <GenericVectorIcon
        type={item.iconType}
        name={item.icon}
        size={28}
        color={item.label === 'Log out' ? '#900' : '#333'}
        style={styles.menuItemIcon}
      />
      <Text style={[styles.menuItemText, item.label === 'Log out' && {color: '#900'}]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} className="bg-white">
      <View style={styles.container}>
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {renderVendorItem()}
            </View>
          </View>
        </Modal>

        <View style={styles.profileContainer}>
          <Image
            source={{uri: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg'}}
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
    width: '130%',
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
