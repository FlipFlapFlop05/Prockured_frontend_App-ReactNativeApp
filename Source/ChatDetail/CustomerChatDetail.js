// CustomerChatDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PaperAirplaneIcon } from 'react-native-heroicons/outline';
import { database, firebase } from '../Firebase/firebase'; // Ensure this path is correct for your Firebase setup

export default function CustomerChatDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { customerName, initialMessages, vendorGST, customerGST, currentUserGST } = route.params; // Added currentUserGST

  const [messages, setMessages] = useState(initialMessages || []);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  // Derive chat ID - always consistent by sorting
  const chatId = [vendorGST, customerGST].sort().join('_');
  const chatMessagesRef = database.ref(`chats/${chatId}/messages`);
  const chatMetadataRef = database.ref(`chats/${chatId}`);

  useEffect(() => {
    // Ensure the chat node exists with participants upon first access if it doesn't
    const setupChatParticipants = async () => {
      try {
        const snapshot = await chatMetadataRef.once('value');
        if (!snapshot.exists()) {
          // Only create if the node doesn't exist at all
          await chatMetadataRef.set({
            participants: {
              [vendorGST]: true,
              [customerGST]: true,
            },
            createdAt: database.ServerValue.TIMESTAMP,
            lastMessageText: '',
            lastMessageTimestamp: database.ServerValue.TIMESTAMP,
          });
        } else {
          // If node exists, ensure both participants are marked
          await chatMetadataRef.child('participants').update({
            [vendorGST]: true,
            [customerGST]: true,
          });
        }
      } catch (error) {
        console.error("Error setting up chat participants:", error);
      }
    };
    setupChatParticipants();

    // Set up real-time listener for messages
    const onValueChange = chatMessagesRef.orderByChild('timestamp').on('value', (snapshot) => {
      const firebaseMessages = [];
      snapshot.forEach((childSnapshot) => {
        const messageData = childSnapshot.val();
        firebaseMessages.push({
          id: childSnapshot.key,
          sender: messageData.sender,
          type: messageData.type || 'text', // Default to text if not specified
          text: messageData.message,
          order: messageData.order, // Include order data if present
          timestamp: new Date(messageData.timestamp), // Convert timestamp to Date object
        });
      });

      // Filter out any duplicate orders if initialMessages also contains orders
      // This is crucial to avoid showing the same order multiple times
      const uniqueInitialOrders = (initialMessages || []).filter(
        (msg, index, self) =>
          msg.type === 'order' && index === self.findIndex(o => o.id === msg.id && o.type === 'order')
      );

      // Combine unique initial (order) messages with real-time Firebase messages
      const combinedMessages = [...uniqueInitialOrders, ...firebaseMessages];
      combinedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Remove duplicates that might arise from both initialMessages and Firebase fetching the same message
      const finalMessages = combinedMessages.filter((msg, index, self) =>
        index === self.findIndex((m) => m.id === msg.id)
      );

      setMessages(finalMessages);
    });

    // Clean up listener on component unmount
    return () => chatMessagesRef.off('value', onValueChange);
  }, [chatId, initialMessages]); // Added initialMessages to dependency array to ensure proper re-evaluation

  // Scroll to bottom when messages update
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Function to format timestamp using native Date methods
  const formatTimestamp = (date) => {
    if (!date instanceof Date) {
      date = new Date(date); // Ensure it's a Date object
    }
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;

    return `${month} ${day}, ${hours}:${minutesFormatted} ${ampm}`;
  };

 // Inside CustomerChatDetails.js, within handleSendMessage function:
// Your current handleSendMessage with good logs:
const handleSendMessage = async () => {
    if (inputText.trim() === '') {
        return;
    }

    const senderId = currentUserGST;

    console.log("Attempting to send message...");
    console.log("Sender ID:", senderId); // Check if senderId is what you expect (client's GST)
    console.log("Message Text:", inputText.trim());
    console.log("Chat ID:", chatId); // Verify the constructed chat ID matches Firebase structure

    const newMessage = {
        sender: senderId,
        message: inputText.trim(),
        timestamp: firebase.database.ServerValue.TIMESTAMP, // This will now work
        type: 'text',
    };

    try {
        console.log("Pushing new message to Firebase:", newMessage);
        await chatMessagesRef.push(newMessage);
        console.log("Message pushed successfully to Firebase!");

        console.log("Updating chat metadata...");
        await chatMetadataRef.update({
            lastMessageText: inputText.trim(),
            lastMessageTimestamp: firebase.database.ServerValue.TIMESTAMP, // This will now work
            lastMessageSender: senderId,
        });
        console.log("Chat metadata updated successfully!");

        setInputText('');
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }

    } catch (error) {
        console.error('Firebase Send Message Error:', error); // Look for the exact error code/message here
        Alert.alert('Error', `Failed to send message: ${error.message}`);
    }
};

  const renderMessage = ({ item }) => {
    // Determine if the message was sent by the current user viewing the chat
    const isMyMessage = item.sender === currentUserGST; // Use currentUserGST from route.params
    const isOrderMessage = item.type === 'order';

    return (
      <View style={[
        styles.messageBubble,
        isMyMessage ? styles.myMessage : styles.otherMessage,
        isOrderMessage && styles.orderMessageBubble // Apply specific style for order messages
      ]}>
        {isOrderMessage ? (
          <View>
            <Text style={[styles.messageText, styles.orderTitle]}>Order Details:</Text>
            <Text style={styles.messageText}>
              <Text style={{ fontWeight: 'bold' }}>Order ID: </Text>{item.order.orderId}
            </Text>
            <Text style={styles.messageText}>
              <Text style={{ fontWeight: 'bold' }}>Status: </Text>{item.order.status}
            </Text>
            <Text style={styles.messageText}>
              <Text style={{ fontWeight: 'bold' }}>Total: </Text>₹ {Number(item.order.totalAmount).toFixed(2)}
            </Text>
            <Text style={styles.messageText}>
              <Text style={{ fontWeight: 'bold' }}>Date: </Text>{item.order.date}
            </Text>
            {item.order.notes ? <Text style={styles.messageText}>
              <Text style={{ fontWeight: 'bold' }}>Notes: </Text>{item.order.notes}
            </Text> : null}
            {/* You can list items here if needed */}
            {item.order.items && item.order.items.length > 0 && (
                <View style={styles.orderItemsContainer}>
                    <Text style={styles.orderItemsHeader}>Items:</Text>
                    {item.order.items.map((orderItem, index) => (
                        <Text key={index} style={styles.orderItemText}>
                            • {orderItem.productName} ({orderItem.quantity})
                        </Text>
                    ))}
                </View>
            )}
          </View>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        <Text style={styles.messageTimestamp}>
          {formatTimestamp(item.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{customerName}</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust as needed for your header
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id || index.toString()} // Ensure unique key
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <PaperAirplaneIcon size={24} color={'white'} />
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
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', // Light green for my messages
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF', // White for others' messages
  },
  orderMessageBubble: {
    backgroundColor: '#FFEBEE', // Light red/pink for order messages
    borderColor: '#EF5350',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  orderTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#D32F2F',
  },
  orderItemsContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 5,
  },
  orderItemsHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
    color: '#555',
  },
  orderItemText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  messageTimestamp: {
    fontSize: 10,
    color: '#777',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 40,
    maxHeight: 120, // Prevent input from becoming too large
  },
  sendButton: {
    backgroundColor: '#76B117',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
});