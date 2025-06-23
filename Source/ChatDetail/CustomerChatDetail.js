import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator // Added for potential loading indicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon, MicrophoneIcon, PaperAirplaneIcon, PlusIcon } from 'react-native-heroicons/outline';
import { CheckIcon, ExclamationCircleIcon } from 'react-native-heroicons/solid'; // Import CheckIcon and potentially ExclamationCircleIcon
import { database, firebase } from '../Firebase/firebase'; // Ensure this path is correct

const { width } = Dimensions.get('window');

export default function CustomerChatDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { customerName, initialMessages, vendorGST, customerGST, currentUserGST } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false); // To prevent multiple sends
  const flatListRef = useRef(null);

  // Determine if the current user is the client or vendor
  const isCurrentUserClient = currentUserGST === customerGST;
  // const isCurrentUserVendor = currentUserGST === vendorGST; // Not directly used in rendering logic

  const chatId = [vendorGST, customerGST].sort().join('_');
  const chatMessagesRef = database.ref(`chats/${chatId}/messages`);
  const chatMetadataRef = database.ref(`chats/${chatId}`);

  const currentUserUnreadRef = database.ref(`chats/${chatId}/participants/${currentUserGST}/unreadCount`);
  const otherUserGST = isCurrentUserClient ? vendorGST : customerGST;
  const otherUserUnreadRef = database.ref(`chats/${chatId}/participants/${otherUserGST}/unreadCount`);

  const formatDateForSeparator = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const formatTimestamp = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutesFormatted} ${ampm}`;
  };

  const renderItem = useCallback(({ item, index }) => {
    if (item.type === 'dateSeparator') {
      return (
        <View style={styles.dateSeparatorContainer}>
          <View style={styles.dateSeparatorLine} />
          <Text style={styles.dateSeparatorText}>{item.date}</Text>
          <View style={styles.dateSeparatorLine} />
        </View>
      );
    } else {
      const isMyMessage = item.sender === currentUserGST;
      const isOrderMessage = item.type === 'order';

      // Determine message status
      const isSending = isMyMessage && item.status === 'sending';
      const isSent = isMyMessage && item.status === 'sent';
      const isRead = isMyMessage && item.status === 'read';
      const isFailed = isMyMessage && item.status === 'failed';

      return (
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
          isOrderMessage && styles.orderMessageBubble
        ]}>
          {isOrderMessage ? (
            <View>
              <Text style={styles.messageText}>
                <Text style={{ fontWeight: 'bold' }}>Order Details:                            </Text>
              </Text>
              <Text style={styles.messageText}>
                <Text style={{ fontWeight: 'bold' }}>Order ID: </Text>{item.order.orderId}
              </Text>

              {item.order.items && item.order.items.length > 0 && (
                <View style={styles.orderItemsContainer}>
                  <View style={styles.orderHeaderRow}>
                    <Text style={[styles.orderItemsHeader, { flex: 1.5 }]}>Item</Text>
                    <Text style={[styles.orderItemsHeader, { flex: 1, textAlign: 'right' }]}>Quantity</Text>
                  </View>
                  {item.order.items.map((orderItem, idx) => (
                    <View key={idx} style={styles.orderItemRow}>
                      <Text style={styles.orderItemName}>{orderItem.productName}</Text>
                      <Text style={styles.orderItemQuantity}>
                        {Number(orderItem.quantity).toFixed(orderItem.quantity % 1 !== 0 ? 2 : 0)}{' '}
                        {orderItem.unit || 'Unit'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.messageText}>{item.text}</Text>
          )}
          <View style={styles.timestampAndStatusContainer}>
            <Text style={styles.messageTimestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
            {isMyMessage && (
              <View style={styles.tickContainer}>
                {isSending && <Text style={styles.sendingText}>Sending...</Text>}
                {isFailed && <ExclamationCircleIcon size={14} color="red" />}
                {isSent && !isRead && <CheckIcon size={14} color="#888" />}
                {isRead && (
                  <>
                    <CheckIcon size={14} color="#34B7F1" />
                    <CheckIcon size={14} color="#34B7F1" style={{ marginLeft: -8 }} />
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      );
    }
  }, [currentUserGST, otherUserGST]); // Dependencies for useCallback

  useEffect(() => {
    // Setup chat participants and initial metadata if not present
    const setupChatParticipants = async () => {
      try {
        const snapshot = await chatMetadataRef.once('value');
        if (!snapshot.exists() || !snapshot.val().participants) {
          await chatMetadataRef.set({
            participants: {
              [vendorGST]: { name: "Vendor", unreadCount: 0 },
              [customerGST]: { name: customerName, unreadCount: 0 },
            },
            createdAt: database.ServerValue.TIMESTAMP,
            lastMessageText: '',
            lastMessageTimestamp: database.ServerValue.TIMESTAMP,
            lastMessageSender: '',
          });
        } else {
          // Update participant names if they changed or ensure structure
          await chatMetadataRef.child('participants').update({
            [vendorGST]: {
              name: snapshot.val().participants?.[vendorGST]?.name || "Vendor",
              unreadCount: snapshot.val().participants?.[vendorGST]?.unreadCount || 0
            },
            [customerGST]: {
              name: snapshot.val().participants?.[customerGST]?.name || customerName,
              unreadCount: snapshot.val().participants?.[customerGST]?.unreadCount || 0
            },
          });
        }
      } catch (error) {
        console.error("Error setting up chat participants:", error);
      }
    };
    setupChatParticipants();

    // Mark messages as read and reset unread count when user enters chat
    const markChatAsRead = async () => {
      try {
        // Reset current user's unread count to 0
        await currentUserUnreadRef.set(0);

        // Find messages sent by the other user that current user hasn't read
        const messagesToMarkReadSnapshot = await chatMessagesRef
          .orderByChild('sender')
          .equalTo(otherUserGST)
          .once('value');

        const updates = {};
        messagesToMarkReadSnapshot.forEach(childSnapshot => {
          const messageId = childSnapshot.key;
          const messageData = childSnapshot.val();
          if (!messageData.readBy || !messageData.readBy[currentUserGST]) {
            updates[`${messageId}/readBy/${currentUserGST}`] = true;
          }
        });

        if (Object.keys(updates).length > 0) {
          await chatMessagesRef.update(updates);
          console.log(`Marked ${Object.keys(updates).length} messages as read for ${currentUserGST}`);
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };
    markChatAsRead(); // Call this immediately on component mount

    // Firebase listener for real-time messages
    const onValueChange = chatMessagesRef.orderByChild('timestamp').on('value', (snapshot) => {
      const firebaseMessages = [];
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        // Determine status based on Firebase data
        let status = 'sent'; // Default to sent if it's in Firebase
        if (messageData.readBy && messageData.readBy[otherUserGST] && messageData.sender === currentUserGST) {
          status = 'read';
        } else if (messageData.readBy && messageData.readBy[currentUserGST] && messageData.sender === otherUserGST) {
          status = 'read';
        }

        firebaseMessages.push({
          id: childSnapshot.key,
          sender: messageData.sender,
          type: messageData.type || 'text',
          text: messageData.message,
          order: messageData.order,
          timestamp: new Date(messageData.timestamp),
          status: status, // Use the derived status
          readBy: messageData.readBy || {},
        });
      });

      const uniqueInitialOrders = (initialMessages || []).filter(
        (msg, index, self) =>
          msg.type === 'order' && index === self.findIndex(o => o.id === msg.id && o.type === 'order')
      );

      // Combine local "sending" messages with Firebase messages, ensuring uniqueness and correct ID
      setMessages(prevMessages => {
        const combined = [...prevMessages.filter(msg => msg.status === 'sending'), ...firebaseMessages];
        // Ensure no duplicates by ID
        const seenIds = new Set();
        const uniqueMessages = [];
        for (const msg of combined) {
          if (!seenIds.has(msg.id)) {
            uniqueMessages.push(msg);
            seenIds.add(msg.id);
          } else {
            // If a message with the same ID exists, update it if the new one has a more "final" status
            const existingMsgIndex = uniqueMessages.findIndex(m => m.id === msg.id);
            if (existingMsgIndex !== -1 && msg.status !== 'sending' && uniqueMessages[existingMsgIndex].status === 'sending') {
              uniqueMessages[existingMsgIndex] = msg;
            }
          }
        }

        // Add date separators and sort
        const messagesWithSeparators = [];
        let lastDate = null;
        uniqueMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        uniqueMessages.forEach(msg => {
          const messageDate = new Date(msg.timestamp);
          if (lastDate === null || messageDate.toDateString() !== lastDate.toDateString()) {
            messagesWithSeparators.push({
              id: `date-${messageDate.getTime()}`,
              type: 'dateSeparator',
              date: formatDateForSeparator(messageDate),
              timestamp: messageDate, // Use timestamp for sorting date separators
            });
            lastDate = messageDate;
          }
          messagesWithSeparators.push(msg);
        });
        return messagesWithSeparators;
      });
    });

    // Clean up listener on unmount
    return () => {
      chatMessagesRef.off('value', onValueChange);
    };
  }, [chatId, initialMessages, currentUserGST, vendorGST, customerGST, otherUserGST]); // Added otherUserGST to dependencies

  // Scroll to end when messages update
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isSendingMessage) {
      return;
    }

    setIsSendingMessage(true); // Disable send button
    const senderId = currentUserGST;
    const messageContent = inputText.trim();
    const tempMessageId = `temp-${new Date().getTime()}`; // Generate a unique temporary ID

    // Add message to local state immediately with 'sending' status
    setMessages(prevMessages => {
      const newMessage = {
        id: tempMessageId,
        sender: senderId,
        message: messageContent,
        timestamp: new Date(), // Use local time for immediate display
        type: 'text',
        status: 'sending', // Mark as sending
        readBy: {
          [senderId]: true, // Sender has read it by definition
          [otherUserGST]: false,
        },
      };

      // Find the last actual message's timestamp to correctly place the new message
      const lastMessageTimestamp = prevMessages.length > 0
        ? prevMessages[prevMessages.length - 1].timestamp
        : new Date(0); // If no messages, start from epoch

      const messagesCopy = [...prevMessages];
      let lastDate = null;
      if (messagesCopy.length > 0 && messagesCopy[messagesCopy.length - 1].type !== 'dateSeparator') {
          lastDate = new Date(messagesCopy[messagesCopy.length - 1].timestamp);
      } else if (messagesCopy.length > 0 && messagesCopy[messagesCopy.length - 1].type === 'dateSeparator') {
          lastDate = new Date(messagesCopy[messagesCopy.length - 1].timestamp);
      }


      const messageDate = new Date(); // Current time for the new message
      if (lastDate === null || messageDate.toDateString() !== lastDate.toDateString()) {
        messagesCopy.push({
          id: `date-${messageDate.getTime()}`,
          type: 'dateSeparator',
          date: formatDateForSeparator(messageDate),
          timestamp: messageDate,
        });
      }
      messagesCopy.push(newMessage);
      return messagesCopy;
    });

    setInputText('');

    try {
      const messagePushRef = chatMessagesRef.push(); // Get a new push key
      const messageId = messagePushRef.key;

      const messageToSave = {
        sender: senderId,
        message: messageContent,
        timestamp: firebase.database.ServerValue.TIMESTAMP, // Use server timestamp for accuracy
        type: 'text',
        readBy: {
          [senderId]: true,
          [otherUserGST]: false,
        },
      };

      await messagePushRef.set(messageToSave);
      console.log("Message pushed successfully to Firebase! Key:", messageId);

      // Update local message with actual Firebase ID and 'sent' status
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === tempMessageId
            ? { ...msg, id: messageId, status: 'sent', timestamp: new Date(messageToSave.timestamp) } // Update timestamp as well
            : msg
        )
      );

      // Update chat metadata
      await chatMetadataRef.update({
        lastMessageText: messageContent,
        lastMessageTimestamp: firebase.database.ServerValue.TIMESTAMP,
        lastMessageSender: senderId,
      });

      // Increment unread count for the other user
      await otherUserUnreadRef.transaction((currentUnreadCount) => {
        return (currentUnreadCount || 0) + 1;
      });

      console.log("Chat metadata and unread count updated successfully!");
    } catch (error) {
      console.error('Firebase Send Message Error:', error);
      Alert.alert('Error', `Failed to send message: ${error.message}`);
      // Mark local message as 'failed' if Firebase push fails
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === tempMessageId ? { ...msg, status: 'failed' } : msg
        )
      );
    } finally {
      setIsSendingMessage(false); // Re-enable send button
    }
  };

  // Function to handle "Add Order" button press
  const handleAddOrderPress = () => {
    navigation.navigate('Specific Vendor Order Now', {
      clientGST: customerGST,
      vendorGST: vendorGST,
      customerName: customerName,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeftIcon size={20} color={"black"} strokeWidth={4} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{customerName}</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id} // Use item.id as key
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }}
          onLayout={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }}
        />
        {isCurrentUserClient && ( // Conditionally render Add Order button for clients
          <TouchableOpacity style={styles.addOrderButton} onPress={handleAddOrderPress}>
            <PlusIcon size={20} color={'white'} />
            <Text style={styles.addOrderButtonText}>Add Order</Text>
          </TouchableOpacity>
        )}
        <View style={styles.inputContainer}>
          <View style={styles.textInput}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#888"
              value={inputText}
              onChangeText={setInputText}
              multiline
              style={styles.actualTextInput}
            />
            <View style={styles.micPlusIcons}>
              <PlusIcon size={24} color={'#76B117'} style={{ marginRight: 5 }} />
              <MicrophoneIcon size={24} color={'#76B117'} />
            </View>
          </View>
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={isSendingMessage}>
            {isSendingMessage ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <PaperAirplaneIcon size={24} color={'white'} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    paddingRight: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1, // Allow text to take up space, pushing button to right
  },
  addOrderButton: {
    flexDirection: 'row',
    backgroundColor: '#76B117',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignContent: 'flex-end',
    marginLeft: "auto", // Push to the right
    marginRight: 10, // Add some margin from the edge
    marginBottom: 10, // Space between button and input
  },
  addOrderButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  messagesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  orderMessageBubble: {
    backgroundColor: '#ECF0F1',
    borderColor: '#ECF0F1',
    borderWidth: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestampAndStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTimestamp: {
    fontSize: 10,
    color: '#777',
    marginRight: 5,
  },
  tickContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendingText: {
    fontSize: 10,
    color: '#777',
    fontStyle: 'italic',
    marginRight: 5, // Space between "Sending..." and timestamp
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 20 // Adjusted for better keyboard handling usually
  },
  textInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 10,
    backgroundColor: '#fff',
    minHeight: 40,
    maxHeight: 120,
  },
  actualTextInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
    paddingTop: 0, // Remove extra padding on Android
    paddingBottom: 0, // Remove extra padding on Android
  },
  micPlusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  sendButton: {
    backgroundColor: '#76B117',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItemsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 5,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d0d0',
    marginBottom: 5,
  },
  orderItemsHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  orderItemName: {
    fontSize: 14,
    color: '#555',
    flex: 1.5,
    textAlign: 'left',
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    justifyContent: 'center',
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#777',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
});