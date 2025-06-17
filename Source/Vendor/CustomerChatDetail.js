// CustomerChatDetail.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon, PaperAirplaneIcon, PaperClipIcon, ShoppingCartIcon } from 'react-native-heroicons/outline';

export default function CustomerChatDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  // Destructure initialMessages from route.params, providing a default empty array
  const { customerId, customerName, initialMessages = [] } = route.params;

  // Initialize messages state with the passed initialMessages
  // Ensure timestamps are Date objects for consistent handling
  const [messages, setMessages] = useState(
    initialMessages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp), // Convert all timestamps to Date objects
    }))
  );
  const [newMessage, setNewMessage] = useState('');
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const flatListRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now().toString(), // Unique ID for the new message
        sender: 'vendor', // Assuming the current user is the vendor
        type: 'text', // New messages are always text
        text: newMessage.trim(),
        timestamp: new Date(), // Current timestamp
      };
      setMessages(prevMessages => [...prevMessages, newMsg]);
      setNewMessage('');
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderModalVisible(true);
  };

  const renderMessage = ({ item }) => {
    const isVendor = item.sender === 'vendor';
    const messageStyle = isVendor ? styles.vendorMessage : styles.customerMessage;
    const messageContainerStyle = isVendor ? styles.vendorMessageContainer : styles.customerMessageContainer;

    return (
      <View style={messageContainerStyle}>
        {item.type === 'order' ? (
          <TouchableOpacity style={styles.orderMessageCard} onPress={() => openOrderModal(item.order)}>
            <ShoppingCartIcon size={24} color="#76B117" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.orderMessageTitle}>Order Request: {item.order.orderId}</Text>
              <Text style={styles.orderMessageText}>Total: ₹{item.order.totalAmount.toFixed(2)}</Text>
              <Text style={styles.orderMessageText}>Items: {item.order.items.length}</Text>
              <Text style={styles.orderMessageViewDetails}>Tap to view details</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.messageBubble, messageStyle]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestampText}>
              {/* Using built-in Date.prototype.toLocaleTimeString() */}
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeftIcon size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{customerName}</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachmentButton}>
            <PaperClipIcon size={24} color="#555" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <PaperAirplaneIcon size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Order Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={orderModalVisible}
          onRequestClose={() => setOrderModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.orderModalContent}>
              <ScrollView>
                <Text style={styles.orderModalTitle}>Order Details</Text>
                {selectedOrder && (
                  <>
                    <Text style={styles.orderModalText}>Order ID: {selectedOrder.orderId}</Text>
                    <Text style={styles.orderModalText}>Date: {selectedOrder.date}</Text>
                    <Text style={styles.orderModalText}>Status: {selectedOrder.status}</Text>
                    <Text style={styles.orderModalText}>Delivery By: {selectedOrder.deliveryDate}</Text>
                    <Text style={styles.orderModalText}>Total Amount: ₹{selectedOrder.totalAmount.toFixed(2)}</Text>

                    <Text style={styles.orderModalSubtitle}>Items:</Text>
                    {selectedOrder.items.map((item, index) => (
                      <View key={index} style={styles.orderItem}>
                        <Text style={styles.orderItemText}>- {item.prodName}</Text>
                        <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
                        <Text style={styles.orderItemPrice}>Price: ₹{item.unitPrice}</Text>
                      </View>
                    ))}
                    {selectedOrder.notes && (
                      <Text style={styles.orderModalText}>Notes: {selectedOrder.notes}</Text>
                    )}
                  </>
                )}
              </ScrollView>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setOrderModalVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  messageList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  customerMessageContainer: {
    justifyContent: 'flex-start',
  },
  vendorMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  customerMessage: {
    backgroundColor: '#e0e0e0',
    borderTopLeftRadius: 5,
  },
  vendorMessage: {
    backgroundColor: '#76B117',
    borderTopRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestampText: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 10,
    fontSize: 16,
    color: 'black',
  },
  sendButton: {
    backgroundColor: '#76B117',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Order Message Card Styles
  orderMessageCard: {
    flexDirection: 'row',
    backgroundColor: '#eaf4e0',
    borderRadius: 15,
    padding: 15,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#76B117',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderMessageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderMessageText: {
    fontSize: 14,
    color: '#555',
  },
  orderMessageViewDetails: {
    fontSize: 12,
    color: '#76B117',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  orderModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  orderModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  orderModalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#555',
  },
  orderModalText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderItemText: {
    flex: 2,
    fontSize: 15,
    color: '#333',
  },
  orderItemQuantity: {
    flex: 0.8,
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  orderItemPrice: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  modalCloseButton: {
    backgroundColor: '#76B117',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});