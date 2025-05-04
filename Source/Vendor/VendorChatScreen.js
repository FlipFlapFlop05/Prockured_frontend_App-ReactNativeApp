import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Image, Dimensions, TextInput} from 'react-native';
import {BellIcon} from 'react-native-heroicons/solid';
import {ChatBubbleLeftEllipsisIcon, MagnifyingGlassIcon, QuestionMarkCircleIcon} from 'react-native-heroicons/outline';
import {worksData} from '../Constant/constant';
import {useNavigation} from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function VendorChatScreen() {
  const navigation = useNavigation();
  const [isWorkDataVisible, setWorkDataVisible] = useState(false);
  const renderWorkItemModal = ({ item }) => (
    <View style={styles.workCard}>
      <Image source={item.image} style={{width: width* 0.4, height: width* 0.3}} />
      <Text style={styles.workTitle}>{item.title}</Text>
      <Text style={styles.workDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerIconView}>
        <TouchableOpacity onPress={() => setWorkDataVisible(true)}>
          <BellIcon size={30} color={'#a9a9a9'} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Supplier Notification And Search')}>
          <QuestionMarkCircleIcon size={30} color={'#a9a9a9'} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isWorkDataVisible}
        onRequestClose={() => setWorkDataVisible(!isWorkDataVisible)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={worksData}
              renderItem={renderWorkItemModal}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.flatListContent}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setWorkDataVisible(!isWorkDataVisible)}>
              <Text style={styles.modalCloseButtonText}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <View style={styles.chatScreenTextInputView}>
        <MagnifyingGlassIcon size={20} color={'black'} strokeWidth={3} style={styles.chatScreenTextInputViewIcon} />
        <TextInput
          placeholder={'Search any Customer'}
          style={styles.chatScreenTextInput}
          placeholderTextColor={'black'}
        />
      </View>

      <View style={{flex: 1}}>
        <Text style={{fontStyle: 'normal', fontWeight: '800', fontSize: 16, fontFamily: 'Montserrat', lineHeight: 30, paddingHorizontal: 20, paddingVertical: 20, letterSpacing: 2}}>
          All Chats
        </Text>
        <View style={{width: '90%', height: '85%', borderWidth: 1, borderColor: '#76B117', alignSelf: 'center', alignItems: 'center', justifyContent: 'space-evenly', borderRadius: 25}}>
          <Image
            source={require('../Images/VendorHomePage.png')}
            style={{width: 200, height: 200}}
          />
          <View style={{alignItems: 'center', alignSelf: 'center', justifyContent: 'center'}}>
            <ChatBubbleLeftEllipsisIcon
              size={30}
              color={'#757575'}
            />
            <Text style={{fontStyle: 'normal', fontWeight: '800', fontSize: 16, lineHeight: 20, letterSpacing: 0.5, fontFamily: 'Montserrat', color: '#757575'}}>
              Your Chat is Empty
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    backgroundColor: 'white'
  },
  headerIconView: {
    flexDirection: 'row',
    justifyContent: "space-between",
    padding: 10,
    paddingTop: 40
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#76B117',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  workCard: {
    flexDirection: 'column',
    height: width * 0.45,
    alignItems: 'center'
  },
  workTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 7,
  },
  workDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  chatScreenTextInputView:{
    backgroundColor: 'gainsboro',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  chatScreenTextInputViewIcon: {
    marginLeft: 20
  },
  chatScreenTextInput: {
    marginLeft: 10,
    width: '70%',
    color: 'black',
  },
})
