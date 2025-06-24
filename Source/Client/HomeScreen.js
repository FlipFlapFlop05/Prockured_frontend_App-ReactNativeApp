// HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal, // Keep Modal for other purposes, but we'll try to avoid it for the dropdown first
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BellIcon, QuestionMarkCircleIcon, MagnifyingGlassIcon, ChevronDownIcon, ChatBubbleLeftEllipsisIcon } from 'react-native-heroicons/outline';
import GenericVectorIcon from 'react-native-vector-icons/FontAwesome';
import { database } from '../Firebase/firebase';
import { categories, worksData } from '../Constant/constant';

const { width } = Dimensions.get('window');

const dummyOutlets = [];

export default function HomeScreen() {
  const navigation = useNavigation();

  const [data, setData] = useState([]); // This will hold supplier data
  const [clientData, setClientData] = useState(null); // This will hold client's own data
  const [clientGST, setClientGST] = useState(null); // Client's GST number
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [hasSuppliers, setHasSuppliers] = useState(false); // State to manage conditional rendering

  // UI state for visibility
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  const [isWorkDataVisible, setWorkDataVisible] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  const [isOutletDropdownVisible, setIsOutletDropdownVisible] = useState(false);

  // Local state for outlets and selected outlet
  const [clientOutlets, setClientOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  // State to store last messages and unread counts for chat previews
  const [lastMessages, setLastMessages] = useState({});

  const filteredData = data.filter(item =>
    item?.businessName?.toLowerCase().includes(searchText.toLowerCase()),
  );

  useEffect(() => {
    setHasSuppliers(filteredData.length > 0);
  }, [filteredData]);


  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true; // Flag to prevent state updates on unmounted component

      const fetchData = async () => {
        setIsLoading(true);
        let storedClientGst = null;
        try {
          storedClientGst = await AsyncStorage.getItem('clientGST');

          if (isMounted && storedClientGst) {
            setClientGST(storedClientGst);

            const clientResponse = await axios.get(
              `https://api-v7quhc5aza-uc.a.run.app/getClient/${storedClientGst}`,
            );
            if (isMounted) setClientData(clientResponse.data);

            const supplierResponse = await axios.get(
              `https://api-v7quhc5aza-uc.a.run.app/getSupplier/${storedClientGst}`,
            );

            const supplierDataArray = Object.values(supplierResponse.data || {}).map(sup => ({
              ...sup,
              supplierGST: sup.gstNumber
            }));
            if (isMounted) setData(supplierDataArray);

            await fetchClientOutletData(storedClientGst);
            await fetchLastMessagesAndUnreadCounts(storedClientGst, supplierDataArray);

          } else if (isMounted) {
            console.warn('No clientGST found in AsyncStorage or component unmounted.');
            setData([]);
            const dummyWithIds = dummyOutlets.map(item => ({...item, id: item.outletId}));
            setClientOutlets(dummyWithIds);
            if (dummyWithIds.length > 0) {
                setSelectedOutlet(dummyWithIds[0]);
            }
          }
        } catch (error) {
          console.error('Fetch error in HomeScreen:', error);
          if (isMounted) {
            Alert.alert('Error', 'Failed to load data. Please check your internet connection or try again.');
            setData([]);
            const dummyWithIds = dummyOutlets.map(item => ({...item, id: item.id || item.outletId || Math.random().toString()}));
            setClientOutlets(dummyWithIds);
            if (dummyWithIds.length > 0) {
                setSelectedOutlet(dummyWithIds[0]);
            }
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      const fetchClientOutletData = async (clientGstParam) => {
        try {
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getOutlets/${clientGstParam}`,
          );

          if (isMounted && response.data && Object.keys(response.data).length > 0) {
            const dataArray = Object.values(response.data).map(item => ({
              ...item,
              id: item.outletId,
            }));

            setClientOutlets(dataArray);
            if (!selectedOutlet || !dataArray.some(o => o.id === selectedOutlet.id)) {
                setSelectedOutlet(dataArray[0]);
            }
          } else if (isMounted) {
            const dummyWithIds = dummyOutlets.map(item => ({
              ...item,
              id: item.outletId || item.id || Math.random().toString(),
            }));
            setClientOutlets(dummyWithIds);
            setSelectedOutlet(dummyWithIds[0]);
          }
        } catch (error) {
          console.error('Error fetching outlets:', error);
          if (isMounted) {
            const dummyWithIds = dummyOutlets.map(item => ({
              ...item,
              id: item.outletId || item.id || Math.random().toString(),
            }));
            setClientOutlets(dummyWithIds);
            setSelectedOutlet(dummyWithIds[0]);
          }
        }
      };

      const fetchLastMessagesAndUnreadCounts = async (currentClientGst, suppliers) => {
        if (!isMounted || !currentClientGst || !suppliers || suppliers.length === 0) {
          if (isMounted) setLastMessages({});
          return;
        }

        const newLastMessages = {};
        for (const supplier of suppliers) {
          const supplierGST = supplier.supplierGST;
          if (!supplierGST) continue;

          const chatId = [currentClientGst, supplierGST].sort().join('_');
          const chatRef = database.ref(`chats/${chatId}`);

          try {
            const snapshot = await chatRef.once('value');
            if (!isMounted) return;
            const chatData = snapshot.val();

            let lastMsgText = "No messages yet.";
            let unreadCount = 0;
            let lastMsgTimestamp = 0;

            if (chatData && chatData.messages) {
              const messages = Object.values(chatData.messages);
              messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

              const lastMessage = messages[messages.length - 1];
              if (lastMessage) {
                lastMsgText = lastMessage.message || "New message";
                lastMsgTimestamp = lastMessage.timestamp || 0;
              }

              unreadCount = messages.filter(msg =>
                msg.sender !== currentClientGst && (!msg.seen || !msg.seen[currentClientGst])
              ).length;
            }

            newLastMessages[supplierGST] = {
              lastMsg: lastMsgText,
              unreadCount: unreadCount,
              timestamp: lastMsgTimestamp,
            };

          } catch (error) {
            console.error(`Error fetching chat for ${supplierGST}:`, error);
            if (isMounted) {
              newLastMessages[supplierGST] = {
                lastMsg: "Error loading chat.",
                unreadCount: 0,
                timestamp: 0,
              };
            }
          }
        }
        if (isMounted) setLastMessages(newLastMessages);
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const renderSupplierItem = ({ item }) => {
    const chatInfo = lastMessages[item.supplierGST] || { lastMsg: "No messages yet.", unreadCount: 0, timestamp: 0 };
    const displayTime = chatInfo.timestamp ? new Date(chatInfo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <TouchableOpacity
        style={styles.chatScreenCard}
        onPress={() => handleChatWithSupplier(item)}
      >
        <View style={styles.chatScreenCardView}>
          <Image
            source={require('../Images/VendorProfileImage.png')}
            style={styles.chatScreenCardImage}
          />
          <View style={styles.chatScreenCardTextView}>
            <Text style={styles.chatScreenCardText} numberOfLines={1}>
              {item.businessName || 'Unknown Supplier'}
            </Text>
            <Text style={styles.lastMessageText} numberOfLines={1}>
              {chatInfo.lastMsg}
            </Text>
          </View>
          <View style={styles.chatInfoRight}>
            {chatInfo.timestamp > 0 && (
              <Text style={styles.messageTime}>{displayTime}</Text>
            )}
            {chatInfo.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{chatInfo.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };


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
        setSelectedOutlet(item);
        setIsOutletDropdownVisible(false);
      }}>
      <Text style={styles.outletName}>{item.OutletName}</Text>
      <Text style={styles.outletAddress}>{item.Address}</Text>
    </TouchableOpacity>
  );

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

    const chatId = [clientGST, supplier.supplierGST].sort().join('_');
    const chatMessagesRef = database.ref(`chats/${chatId}/messages`);

    try {
      const snapshot = await chatMessagesRef.orderByChild('timestamp').once('value');
      const existingMessages = [];
      const messagesToMarkSeen = [];

      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        // Ensure 'readBy' is used instead of 'seen' for consistency with CustomerChatDetails
        if (messageData.sender === supplier.supplierGST && (!messageData.readBy || !messageData.readBy[clientGST])) {
          messagesToMarkSeen.push(childSnapshot.key);
        }

        existingMessages.push({
          id: childSnapshot.key,
          sender: messageData.sender,
          type: messageData.type || 'text',
          text: messageData.message,
          order: messageData.order,
          timestamp: new Date(messageData.timestamp),
          status: 'sent', // Default status for existing messages
          readBy: messageData.readBy || {},
        });
      });

      const updates = {};
      messagesToMarkSeen.forEach(msgKey => {
        // Ensure 'readBy' is used instead of 'seen'
        updates[`chats/${chatId}/messages/${msgKey}/readBy/${clientGST}`] = true;
      });
      if (Object.keys(updates).length > 0) {
        await database.ref().update(updates);
      }

      // `isMounted` and `fetchLastMessagesAndUnreadCounts` seem to be from an outer scope.
      // Ensure they are correctly handled or removed if not needed here.
      // if (isMounted) {
      //     fetchLastMessagesAndUnreadCounts(clientGST, data);
      // }

      navigation.navigate('CustomerChatDetail', {
        customerGST: clientGST,
        vendorGST: supplier.supplierGST,
        customerName: supplierName,
        initialMessages: existingMessages,
        currentUserGST: clientGST,
      });
    } catch (error) {
      console.error("Error fetching existing chat messages:", error);
      // Alert.alert("Error", "Failed to load chat history."); // <-- REMOVE or comment this line

      // Still navigate, potentially with an empty initialMessages,
      // relying on the real-time listener in CustomerChatDetails
      navigation.navigate('CustomerChatDetail', {
        customerGST: clientGST,
        vendorGST: supplier.supplierGST,
        customerName: supplierName,
        initialMessages: [], // Pass empty if there was an error fetching initially
        currentUserGST: clientGST,
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
        <View style={styles.chatScreenMainContainer}>
          {/* Header Section for Chat Screen - Give it a very high zIndex */}
          <View style={[styles.chatScreenHeaderView, { zIndex: 9999 }]}> {/* Increased zIndex */}
            <View style={styles.chatScreenHeaderViewIcon}>
              {/* Outlet Dropdown Wrapper - Needs position: 'relative' and high zIndex */}
              <View style={styles.outletDropdownWrapper}>
                <TouchableOpacity
                  onPress={() => setIsOutletDropdownVisible(!isOutletDropdownVisible)}
                  style={styles.outletSelector}>
                  <Text style={styles.deliveryAddressLabel}>Delivery Address</Text>
                  <View style={styles.selectedOutletContainer}>
                    <Text style={styles.selectedOutletName} numberOfLines={1}>
                      {selectedOutlet?.OutletName || 'Select Outlet'}
                    </Text>
                    <ChevronDownIcon
                      size={20}
                      color={'#000'}
                      style={{
                        transform: [{ rotate: isOutletDropdownVisible ? '180deg' : '0deg' }],
                      }}
                    />
                  </View>
                  <Text style={styles.selectedOutletAddress} numberOfLines={1}>
                    {selectedOutlet?.Address || 'No address selected'}
                  </Text>
                </TouchableOpacity>

                {isOutletDropdownVisible && clientOutlets.length > 0 && (
                  <View style={styles.outletDropdown}>
                    <FlatList
                      data={clientOutlets}
                      renderItem={renderOutletItem}
                      keyExtractor={item => item.id.toString()}
                      ListEmptyComponent={<Text style={styles.noOutletsText}>No Outlets Found</Text>}
                    />
                  </View>
                )}
              </View>

              <View style={styles.rightIconsContainer}>
                <TouchableOpacity onPress={() => setWorkDataVisible(true)}>
                  <BellIcon size={30} color={'#a9a9a9'} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Notification And Search')}>
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
                placeholderTextColor={'#666'}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>
          {/* Supplier List (Chats) - It will flow below the header due to zIndex */}
          <FlatList
            data={filteredData.sort((a, b) => {
              const timeA = lastMessages[a.supplierGST]?.timestamp || 0;
              const timeB = lastMessages[b.supplierGST]?.timestamp || 0;
              return timeB - timeA;
            })}
            keyExtractor={item => item.supplierGST || item.id}
            renderItem={renderSupplierItem}
            contentContainerStyle={styles.supplierListContent}
            ListEmptyComponent={
                <View style={styles.emptySupplierList}>
                    <Text style={styles.emptySupplierListText}>No suppliers found. Add one!</Text>
                </View>
            }
          />
          {/* Floating Buttons */}
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

          {/* Modals for Categories and How It Works */}
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
        // Initial / Empty State Layout (No Suppliers Yet) - This part doesn't have the dropdown
        <SafeAreaView style={styles.safeAreaViewContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.header}>
              <Image
                source={require('../Images/ProckuredImage.jpg')}
                style={styles.profileImage}
              />
              <View style={styles.headerIcons}>
                <TouchableOpacity onPress={() => navigation.navigate('Notification And Search')}>
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
            onPress={() => setChatModalVisible(true)}
          >
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
  chatScreenMainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatScreenHeaderView: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    backgroundColor: '#fff',
    paddingBottom: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Add position relative to establish a stacking context if it's not already
    position: 'relative',
    zIndex: 9999, // Extremely high zIndex to ensure it's on top
  },
  chatScreenHeaderViewIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  outletDropdownWrapper: {
    flex: 1, // Allow it to take available space
    position: 'relative', // ESSENTIAL: Makes children with 'absolute' position relative to this wrapper
    zIndex: 1001, // Ensures this wrapper is above most other elements within the header
  },
  outletSelector: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
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
    flexShrink: 1,
  },
  selectedOutletAddress: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  outletDropdown: {
    position: 'absolute',
    top: '100%', // Position it right below the outletSelector
    left: 0,     // Adjusted to 0 to align with its parent wrapper
    right: 0,    // Adjusted to 0
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000, // Still needs to be high to be above chat list
    maxHeight: 200,
    overflow: 'hidden', // Essential to clip content that goes beyond maxHeight
    borderColor: '#eee',
    borderWidth: 1,
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
  noOutletsText: {
    padding: 15,
    textAlign: 'center',
    color: '#888',
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    gap: 10,
  },
  chatScreenTextInputView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    height: 45,
  },
  chatScreenTextInputViewIcon: {
    marginRight: 10,
  },
  chatScreenTextInput: {
    flex: 1,
    color: 'black',
  },
  supplierListContent: {
    paddingTop: 15,
    paddingBottom: 100,
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
    justifyContent: 'space-between',
  },
  chatScreenCardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatScreenCardTextView: {
    flex: 1,
    marginRight: 10,
  },
  chatScreenCardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lastMessageText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chatInfoRight: {
    alignItems: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    backgroundColor: '#76B117',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 5,
    minWidth: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptySupplierList: {
      alignItems: 'center',
      marginTop: 50,
  },
  emptySupplierListText: {
      fontSize: 16,
      color: '#888',
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
    zIndex: 10, // Maintain a decent zIndex for floating buttons
  },
  chatButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
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
    zIndex: 10, // Maintain a decent zIndex for floating buttons
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 30,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    width: width / 3 - 20,
    margin: 10,
  },
  categoryItemModal: {
    alignItems: 'center',
    width: width / 3 - 20,
    margin: 10,
  },
  categoryImage: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    marginBottom: 5,
  },
  categoryText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#333',
  },
  workItem: {
    alignItems: 'center',
    width: width / 2 - 30,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
    backgroundColor: 'white',
  },
  scrollViewContent: {
    paddingBottom: 80,
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
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.6,
  }
});