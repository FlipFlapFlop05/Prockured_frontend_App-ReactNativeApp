import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChevronLeftIcon, MicrophoneIcon} from 'react-native-heroicons/outline';
import {widthToDP} from 'react-native-responsive-screens';
import {PlusIcon} from 'react-native-heroicons/outline';

const {width, height} = Dimensions.get('window');
const ChatScreenWithSupplier = ({ route, navigation }) => {
  const { vendor } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem(`messages_${vendor.supplierId}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.log("Error loading messages:", error);
      }
    };
    fetchMessages();
  }, [vendor]);

  const sendMessage = async () => {
    if (messageText.trim()) {
      const newMessage = {
        sender: "client",
        message: messageText,
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...messages, newMessage];

      try {
        // Save the updated messages to AsyncStorage
        await AsyncStorage.setItem(`messages_${vendor.supplierId}`, JSON.stringify(updatedMessages));
        setMessages(updatedMessages);
        setMessageText(""); // Clear input after sending the message
      } catch (error) {
        console.log("Error saving message:", error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={styles.keyBoardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={30} color={'black'} strokeWidth={3} />
          </TouchableOpacity>
          <View style={{flexDirection: 'column'}}>
            <Text style={styles.headerText}>
              {vendor.businessName}
            </Text>
            <Text style={{fontSize: 16, fontStyle: 'normal', fontFamily: 'OpenSans', marginLeft: 10, fontWeight: '400'}}>
              Fruits and Vegetable
            </Text>
          </View>
        </View>
        <View style={styles.messageView}>
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 10, flexDirection: item.sender === "client" ? "row-reverse" : "row"}}>
                <View
                  style={{
                    padding: 10,
                    backgroundColor: item.sender === "client" ? 'lightgray' : "#f1f1f1",
                    borderRadius: 10,
                    maxWidth: "70%",
                  }}
                >
                  <Text style={{color: 'black', fontWeight: 'bold', fontSize: 14}}>{item.message}</Text>
                  <Text style={{ fontSize: 14, color: "#76B117", marginTop: 5, fontWeight: 'bold' }}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
        <TouchableOpacity style={{width: 118, backgroundColor: "#76B117", height: 36, left: width * 0.68, borderRadius: 24, borderWidth: 1, padding: 8, borderColor: '#76B117', justifyContent: 'center', alignContent: 'center', alignItems: 'center'}}>
          <Text style={{fontWeight: 14, fontStyle: 'normal', fontFamily: 'Montserrat', lineHeight: 13, letterSpacing: 0, alignContent: 'center', justifyContent: 'center', alignItems: 'center', color: 'white'}}>
            +  Add Order
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", padding: 10, justifyContent: 'space-between'}}>
          <View style={{height: 50, width: widthToDP(82), flexDirection: 'row', alignContent: 'center', justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightgray', borderRadius: 20}}>
            <TextInput
              style={{flex: 1, borderRadius: 25, paddingLeft: 10}}
              placeholderTextColor={'black'}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
            />
            <TouchableOpacity>
              <PlusIcon size={24} color={'#76B117'} strokeWidth={4} />
            </TouchableOpacity>
            <TouchableOpacity>
              <MicrophoneIcon size={24} color={'#76B117'} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={sendMessage} style={{ backgroundColor: '#76B117', alignItems: 'center', alignContent: "center", justifyContent: 'center', borderRadius: 40, width: 40, marginLeft: -5, height: 40, marginTop: 5 }}>
            <Image source={require('../Images/SendButton.png')} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreenWithSupplier;

const styles = StyleSheet.create({
  safeAreaContainer: { flex: 1 },
  keyBoardContainer: { flex: 1 },
  header: {flexDirection: 'row', padding: 16, paddingLeft: -6, borderBottomWidth: 1, borderBottomColor: 'lightgray'},
  headerText: {fontSize: 20, fontStyle: 'normal', fontFamily: 'Montesserat', marginLeft: 10, fontWeight: '700'},
  messageView: { flex: 1, padding: 10 },
})
