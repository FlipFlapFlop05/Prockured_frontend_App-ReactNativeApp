// HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { BellIcon, QuestionMarkCircleIcon, MagnifyingGlassIcon, ChevronDownIcon, ChatBubbleLeftEllipsisIcon } from 'react-native-heroicons/outline';
import GenericVectorIcon from 'react-native-vector-icons/FontAwesome'; // Example for FontAwesome icon
import { database } from '../Firebase/firebase'; // Ensure this path is correct
import { categories, worksData } from '../Constant/constant';

const { width } = Dimensions.get('window');

const dummyOutlets = [
  { id: 'outlet1', outletId: 'outlet1', OutletName: 'Main Store', Address: '123 Main St, Anytown' },
  { id: 'outlet2', outletId: 'outlet2', OutletName: 'Warehouse', Address: '456 Warehouse Rd, Anytown' },
];


export default function HomeScreen() {
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  const navigation = useNavigation();
  const [data, setData] = useState([]); // This will hold supplier data
  const [clientData, setClientData] = useState([]); // This will hold client's own data
  const [clientOutlet, setClientOutlet] = useState(dummyOutlets ?? []);
  const [clientGST, setClientGST] = useState(null); // Client's GST number
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkDataVisible, setWorkDataVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showCategories, setShowCategories] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  const [isOutletDropdownVisible, setIsOutletDropdownVisible] = useState(false);
  const [hasSuppliers, setHasSuppliers] = useState(false); // New state to manage conditional rendering

  const dispatch = useDispatch();
  const { selectedOutlet } = useSelector(state => state.outlet);

  const filteredData = data.filter(item =>
    item?.businessName?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Effect to determine if there are suppliers to show the main layout
  useEffect(() => {
    setHasSuppliers(filteredData.length > 0);
  }, [filteredData]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const storedClientGst = await AsyncStorage.getItem('clientGST'); // Fetch client's own GST
          setClientGST(storedClientGst); // Set client's GST state

          if (storedClientGst) {
            // Fetch suppliers associated with this client
            const supplierResponse = await axios.get(
              `https://api-v7quhc5aza-uc.a.run.app/getSupplier/${storedClientGst}`,
            );
            // Assuming response.data is an object, convert it to an array of suppliers
            const supplierDataArray = Object.values(supplierResponse.data).map(sup => ({
                ...sup,
                supplierGST: sup.gstNumber // Assuming 'gst' key holds supplier's GST
            }));
            setData(supplierDataArray);

            // Fetch client's own data (if needed, though not directly used for chat init here)
            const clientResponse = await axios.get(
              `https://api-v7quhc5aza-uc.a.run.app/getClient/${storedClientGst}`,
            );
            setClientData(clientResponse.data);

            // Fetch outlets data
            await fetchClientOutletData(storedClientGst);
          }
        } catch (error) {
          console.error('Fetch error:', error);
          Alert.alert('Error', 'Failed to load data. Please try again.');
          // Fallback to dummy data if API fails
          dispatch(setAllOutlets(dummyOutlets));
          if (dummyOutlets.length > 0) {
            dispatch(setSelectedOutlet(dummyOutlets[0]));
          }
        } finally {
          setIsLoading(false);
        }
      };

      const fetchClientOutletData = async phoneNumber => {
        try {
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getOutlets/${phoneNumber}`,
          );

          if (response.data && Object.keys(response.data).length > 0) {
            const dataArray = Object.values(response.data).map(item => ({
              ...item,
              id: item.outletId, // ensure id is present for FlatList
            }));

            dispatch(setAllOutlets(dataArray));
            dispatch(setSelectedOutlet(dataArray[0]));
            setClientOutlet(dataArray);
          } else {
            const dummyWithIds = dummyOutlets.map(item => ({
              ...item,
              id: item.outletId || item.id || Math.random().toString(),
            }));

            dispatch(setAllOutlets(dummyWithIds));
            dispatch(setSelectedOutlet(dummyWithIds[0]));
            setClientOutlet(dummyWithIds);
          }
        } catch (error) {
          console.error('Error fetching outlets:', error);
          const dummyWithIds = dummyOutlets.map(item => ({
            ...item,
            id: item.outletId || item.id || Math.random().toString(),
          }));

          dispatch(setAllOutlets(dummyWithIds));
          dispatch(setSelectedOutlet(dummyWithIds[0]));
          setClientOutlet(dummyWithIds);
        }
      };

      fetchData();
    }, []),
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('View Categories', { ...item })}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text
        style={styles.categoryText}
        numberOfLines={2}
        ellipsizeMode={'tail'}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryItemModal = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItemModal}
      onPress={() => navigation.navigate('View Categories', { ...item })}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text
        style={styles.categoryText}
        numberOfLines={2}
        ellipsizeMode={'tail'}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderWorkItem = ({ item }) => (
    <View style={styles.workItem}>
      <Image source={item.image} style={styles.workImage} />
      <Text style={styles.workTitle}>{item.title}</Text>
      <Text style={styles.workDescription}>{item.description}</Text>
    </View>
  );

  const renderWorkItemModal = ({ item }) => (
    <View
      style={{
        flexDirection: 'column',
        height: width * 0.45,
        alignItems: 'center',
      }}>
      <Image
        source={item.image}
        style={{ width: width * 0.4, height: width * 0.3 }}
      />
      <Text style={styles.workTitle}>{item.title}</Text>
      <Text style={styles.workDescription}>{item.description}</Text>
    </View>
  );

  const renderOutletItem = ({ item }) => (
    <TouchableOpacity
      style={styles.outletItem}
      onPress={() => {
        dispatch(setSelectedOutlet(item));
        setIsOutletDropdownVisible(false);
      }}>
      <Text style={styles.outletName}>{item.OutletName}</Text>
      <Text style={styles.outletAddress}>{item.Address}</Text>
    </TouchableOpacity>
  );

  // New function to handle chat with a supplier
  const handleChatWithSupplier = async (supplier) => {
    if (!clientGST) {
      Alert.alert("Error", "Your GST number is not found. Cannot start chat.");
      return;
    }
    if (!supplier.supplierGST) {
      Alert.alert("Error", "Supplier GST not found. Cannot start chat.");
      return;
    }

    const supplierName = supplier.businessName || supplier.name || 'Unknown Supplier';

    // Fetch existing chat history for this specific supplier-client pair
    const chatId = [clientGST, supplier.supplierGST].sort().join('_');
    const chatMessagesRef = database.ref(`chats/${chatId}/messages`);

    try {
        const snapshot = await chatMessagesRef.orderByChild('timestamp').once('value');
        const existingMessages = [];
        snapshot.forEach((childSnapshot) => {
            const messageData = childSnapshot.val();
            existingMessages.push({
                id: childSnapshot.key,
                sender: messageData.sender,
                type: messageData.type || 'text',
                text: messageData.message,
                order: messageData.order,
                timestamp: new Date(messageData.timestamp),
            });
        });

        // Navigate to the chat detail screen
        navigation.navigate('CustomerChatDetail', {
            customerGST: clientGST,        // Your GST as the client
            vendorGST: supplier.supplierGST,
            customerName: supplierName,
            initialMessages: existingMessages,
            currentUserGST: clientGST, // <--- Add this line: the current user (client)'s GST
        });
    } catch (error) {
        console.error("Error fetching existing chat messages:", error);
        Alert.alert("Error", "Failed to load chat history.");
        // Navigate anyway, but with no initial messages
        navigation.navigate('CustomerChatDetail', {
            customerGST: clientGST,
            vendorGST: supplier.supplierGST,
            customerName: supplierName,
            initialMessages: [],
        });
    }
  };


  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {isLoading ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color="#76B117" />
        </View>
      ) : hasSuppliers ? (
        <View style={styles.chatScreenHeaderView}>
          <View style={styles.chatScreenHeaderViewIcon}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={() =>
                  setIsOutletDropdownVisible(!isOutletDropdownVisible)
                }
                style={styles.outletSelector}>
                <Text style={styles.deliveryAddressLabel}>
                  Delivery Address
                </Text>
                <View style={styles.selectedOutletContainer}>
                  <Text style={styles.selectedOutletName} numberOfLines={1}>
                    {selectedOutlet?.OutletName || 'Select Outlet'}
                  </Text>
                  <ChevronDownIcon
                    size={20}
                    color={'#000'}
                    style={{
                      transform: [
                        { rotate: isOutletDropdownVisible ? '180deg' : '0deg' },
                      ],
                    }}
                  />
                </View>
                <Text style={styles.selectedOutletAddress} numberOfLines={1}>
                  {selectedOutlet?.Address || 'No address selected'}
                </Text>
              </TouchableOpacity>

              {isOutletDropdownVisible && (
                <View style={styles.outletDropdown}>
                  <FlatList
                    data={clientOutlet}
                    renderItem={renderOutletItem}
                    keyExtractor={item => item.id.toString()}
                  />
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => setWorkDataVisible(true)}>
                <BellIcon size={30} color={'#a9a9a9'} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notification And Search')}>
                <QuestionMarkCircleIcon
                  size={30}
                  color={'#a9a9a9'}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.chatScreenTextInputView}>
            <MagnifyingGlassIcon
              size={20}
              color={'black'}
              strokeWidth={3}
              style={styles.chatScreenTextInputViewIcon}
            />
            <TextInput
              placeholder={'Search any Supplier'}
              style={styles.chatScreenTextInput}
              placeholderTextColor={'black'}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={item => item.supplierId || item.gst} // Use gst as fallback key
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity
                  style={styles.chatScreenCard}
                  onPress={() => handleChatWithSupplier(item)} // Use the new chat handler
                >
                  <View style={styles.chatScreenCardView}>
                    <Image
                      source={require('../Images/VendorProfileImage.png')}
                      style={styles.chatScreenCardImage}
                    />
                    <View style={styles.chatScreenCardTextView}>
                      <Text style={styles.chatScreenCardText}>
                        {item.businessName}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => setChatModalVisible(true)}>
            <View style={styles.chatButtonInner}>
              <Image
                source={require('../Images/Categories.png')}
                style={{ width: 25, height: 25 }}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => navigation.navigate('Add Supplier')}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isChatModalVisible}
            onRequestClose={() => setChatModalVisible(!isChatModalVisible)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={categories}
                  numColumns={3}
                  renderItem={renderCategoryItemModal}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={styles.flatListContent}
                />
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setChatModalVisible(!isChatModalVisible)}>
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isWorkDataVisible}
            onRequestClose={() => setWorkDataVisible(!isWorkDataVisible)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={worksData}
                  renderItem={renderWorkItemModal}
                  keyExtractor={item => item.id.toString()}
                  contentContainerStyle={styles.flatListContent}
                />
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setWorkDataVisible(!isWorkDataVisible)}>
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      ) : (
        <SafeAreaView style={styles.safeAreaViewContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.header}>
              <Image
                source={require('../Images/ProckuredImage.jpg')}
                style={styles.profileImage}
              />
              <View style={styles.headerIcons}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Notification And Search')
                  }>
                  <GenericVectorIcon
                    name="bell"
                    type="FontAwesome"
                    color="rgba(0, 0, 0, 0.54)"
                    size={23}
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
                <QuestionMarkCircleIcon
                  size={25}
                  color={'rgba(0, 0, 0, 0.54)'}
                  strokeWidth={2}
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => navigation.navigate('Search Bar')}>
              <MagnifyingGlassIcon
                size={20}
                color={'black'}
                strokeWidth={3}
                style={styles.searchIcon}
              />
              <Text style={styles.searchText}>Search any Product</Text>
            </TouchableOpacity>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Categories</Text>
              <TouchableOpacity
                onPress={() => setShowCategories(!showCategories)}>
                <ChevronDownIcon
                  size={20}
                  color={'black'}
                  strokeWidth={3}
                  style={{
                    transform: [{ rotate: showCategories ? '180deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>
            </View>
            {showCategories && (
              <FlatList
                data={categories}
                numColumns={3}
                renderItem={renderCategoryItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.flatListContent}
              />
            )}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>How it works?</Text>
              <TouchableOpacity
                onPress={() => setShowHowItWorks(!showHowItWorks)}>
                <ChevronDownIcon
                  size={20}
                  color={'black'}
                  strokeWidth={3}
                  style={{
                    transform: [{ rotate: showHowItWorks ? '180deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>
            </View>
            {showHowItWorks && (
              <FlatList
                data={worksData}
                renderItem={renderWorkItem}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.flatListContent}
              />
            )}
            <View style={styles.allChatView}>
              <Text style={styles.allChatText}>All Chats</Text>
              <View style={styles.chatContainer}>
                <Image
                  source={require('../Images/VendorHomePage.png')}
                  style={styles.imageContainer}
                />
                <View style={styles.emptyChatView}>
                  <ChatBubbleLeftEllipsisIcon size={30} color={'#757575'} />
                  <Text style={styles.emptyChatText}>Your Chat is Empty</Text>
                  <TouchableOpacity
                    style={styles.AddSupplierTouchableOpacity}
                    onPress={() => navigation.navigate('Add Supplier')}>
                    <Text style={styles.AddSupplierText}>+ Add Supplier</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isChatModalVisible}
              onRequestClose={() => setChatModalVisible(!isChatModalVisible)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={categories}
                    numColumns={3}
                    renderItem={renderCategoryItemModal}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.flatListContent}
                  />
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setChatModalVisible(!isChatModalVisible)}>
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => setChatModalVisible(true)}>
            <View style={styles.chatButtonInner}>
              <Image
                source={require('../Images/Categories.png')}
                style={styles.categoryPopUp}
              />
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

// Minimal styles needed for this component, add others as per your design
const styles = StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chatScreenHeaderView: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 20 : 0, // Adjust for status bar
    },
    chatScreenHeaderViewIcon: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    outletSelector: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
      maxWidth: '80%', // Limit width
    },
    deliveryAddressLabel: {
      fontSize: 12,
      color: '#666',
    },
    selectedOutletContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },
    selectedOutletName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginRight: 5,
      flexShrink: 1, // Allow text to shrink
    },
    selectedOutletAddress: {
      fontSize: 12,
      color: '#888',
      marginTop: 2,
    },
    outletDropdown: {
      position: 'absolute',
      top: 130, // Adjust based on your header height
      left: 15,
      right: 15,
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 1000, // Ensure it's above other content
      maxHeight: 200, // Limit height
    },
    outletItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    outletName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    outletAddress: {
      fontSize: 13,
      color: '#666',
    },
    chatScreenTextInputView: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 10,
      marginHorizontal: 15,
      paddingHorizontal: 10,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    chatScreenTextInputViewIcon: {
      marginRight: 10,
    },
    chatScreenTextInput: {
      flex: 1,
      height: 45,
      color: 'black',
    },
    chatScreenCard: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      marginHorizontal: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    chatScreenCardView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chatScreenCardImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 15,
    },
    chatScreenCardTextView: {
      flex: 1,
    },
    chatScreenCardText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    chatButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#76B117',
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    chatButtonInner: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    floatingButton: {
      position: 'absolute',
      bottom: 90, // Adjust as needed, above the chat button
      right: 20,
      backgroundColor: '#007bff', // Or your preferred color
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    floatingButtonText: {
      color: 'white',
      fontSize: 30,
      lineHeight: 30, // Adjust to center the '+' vertically
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      width: '80%',
      maxHeight: '70%',
    },
    modalCloseButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#76B117',
      borderRadius: 5,
    },
    modalCloseButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    flatListContent: {
      // styles for FlatLists within modals or categories/works
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryItem: {
      alignItems: 'center',
      width: width / 3 - 20, // Adjust for spacing
      margin: 10,
    },
    categoryItemModal: {
      alignItems: 'center',
      width: width / 3 - 20, // Adjust for spacing
      margin: 10,
    },
    categoryImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 5,
    },
    categoryText: {
      textAlign: 'center',
      fontSize: 13,
      color: '#333',
    },
    workItem: {
      alignItems: 'center',
      width: width / 2 - 30, // Adjust for spacing
      margin: 10,
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    workImage: {
      width: width * 0.35,
      height: width * 0.25,
      resizeMode: 'contain',
    },
    workTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      marginTop: 5,
      textAlign: 'center',
    },
    workDescription: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center',
      marginTop: 3,
    },
    safeAreaViewContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollViewContent: {
        paddingBottom: 80, // Space for the floating button
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 15,
        paddingHorizontal: 10,
        height: 45,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchText: {
        color: '#888',
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    allChatView: {
        paddingHorizontal: 15,
        marginTop: 20,
    },
    allChatText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    chatContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    emptyChatView: {
        alignItems: 'center',
        marginTop: 10,
    },
    emptyChatText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#757575',
        marginTop: 10,
    },
    AddSupplierTouchableOpacity: {
        backgroundColor: '#76B117',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    AddSupplierText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    categoryPopUp: {
        width: 25,
        height: 25,
    }
  });