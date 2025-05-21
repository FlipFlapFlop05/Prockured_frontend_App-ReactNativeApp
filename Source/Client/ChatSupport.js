import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Dimensions, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const predefinedResponses = {
  'order': { text: 'You can check your order status in the Orders section.', screen: 'Orders' },
  'delivery': { text: 'You can change your delivery address in the Profile Page.', screen: 'Client Profile' },
  'payment': { text: 'We accept multiple payment methods including credit cards, PayPal, and UPI.', screen: null },
  'refund': { text: 'Refunds usually take 5-7 business days to process.', screen: null },
  'support': { text: 'Our support team is available 24/7 to assist you.', screen: 'Chat Support' },
  'help': { text: 'How can I assist you further?', screen: null },
  'hi': {text: 'Hello there! Welcome to Prockured Support. How can I help you today?', screen: null },
  'multiple outlet': {text: 'You can go to setting screen and can see Multiple Outlet Dashboad which can lead you to Outlets Dashboard. Or you can click this chat to redirect you to your screen', screen: 'Multiple Outlet Dashboard' },
  'outlet dashboad': {text: 'You can go to setting screen and can see Multiple Outlet Dashboad which can lead you to Outlets Dashboard. Or you can click this chat to redirect you to your screen', screen: 'Multiple Outlet Dashboard' },
  'add product': {text: 'You can go to Catalogue screen and can see Add Product Sign which can lead you to Add Product. Or you can click this chat to redirect you to your screen', screen: 'Add Product Manually' },
  'add supplier': {text: 'You can go to Home screen and can see Add Supplier Button which can lead you to Add Supplier Button. Or you can click this chat to redirect you to your screen', screen: 'Add Supplier' },
  'catalogue': {text: 'You can go to Catalogue screen through Home Screen which can lead you to Catalogue. Or you can click this chat to redirect you to your screen', screen: 'Catalogue' },
  'all supplier': {text: 'You can go to Home Screen and can see All Suppliers in Home Screen or go to Search Bar which can lead you to All Suppliers list. Or you can click this chat to redirect you to your screen', screen: 'Search Bar' },
};

const defaultResponse = { text: "I'm sorry, but I didn't understand your query. Can you please rephrase it?", screen: null };

const ChatSupport = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef();
  const navigation = useNavigation();

  useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        headerTitle: 'Chat Support',
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
          justifyContent: 'center'
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
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveMessages = async (messages) => {
    try {
      await AsyncStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.log('Error saving messages:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem('chatMessages');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([{ text: 'Hello there! Welcome to Prockured Support. How can I help you today?', sender: 'support', timestamp: new Date() }]);
      }
    } catch (error) {
      console.log('Error loading messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const userMessage = newMessage.trim().toLowerCase();
      const timestamp = new Date();
      const updatedMessages = [...messages, { text: newMessage.trim(), sender: 'user', timestamp }];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
      setNewMessage('');

      setTimeout(() => {
        const keyword = Object.keys(predefinedResponses).find(key => userMessage.includes(key));
        const response = keyword ? predefinedResponses[keyword] : defaultResponse;
        const updatedMessagesWithResponse = [...updatedMessages, { ...response, sender: 'support', timestamp: new Date() }];
        setMessages(updatedMessagesWithResponse);
        saveMessages(updatedMessagesWithResponse);
      }, 1000);
    }
  };

  const handleNavigation = (screen) => {
    if (screen) {
      navigation.navigate(screen);
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>

          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.messageContainer} showsVerticalScrollIndicator={false}>
            {messages.map((message, index) => (
              <View key={index}>
                {index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp) ? (
                  <Text style={styles.dateSeparator}>{formatDate(message.timestamp)}</Text>
                ) : null}
                <View style={[styles.messageBubble, message.sender === 'user' ? styles.userMessage : styles.supportMessage]}>
                  {message.screen ? (
                    <TouchableOpacity onPress={() => handleNavigation(message.screen)} style={{backgroundColor: 'black'}}>
                      <Text style={[styles.messageText, styles.linkText]}>{message.text}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.messageText}>{message.text}</Text>
                  )}
                  <Text style={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={handleSendMessage}
              placeholderTextColor={'black'}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  inner: { flex: 1, justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  messageContainer: { padding: 10 },
  messageBubble: { maxWidth: '80%', borderRadius: 15, padding: 10, marginBottom: 10, backgroundColor: '#76B117' },
  userMessage: { backgroundColor: '#e0f2f7', alignSelf: 'flex-end' },
  supportMessage: { backgroundColor: 'white', alignSelf: 'flex-start' },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 12, color: 'gray', marginTop: 5, alignSelf: 'flex-end' },
  dateSeparator: { textAlign: 'center', fontSize: 14, fontWeight: 'bold', marginVertical: 10 },
  inputArea: { flexDirection: 'row', padding: 10, backgroundColor: 'white' },
  input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 15 },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 15 },
  sendButtonText: { color: 'white', fontWeight: 'bold' },
  linkText: {color: 'blue'}
});

export default ChatSupport;
