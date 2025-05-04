import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Modal,
  SafeAreaView, TextInput, ActivityIndicator,
} from 'react-native';
import { BellIcon } from 'react-native-heroicons/solid';
import {
  ChatBubbleLeftEllipsisIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from 'react-native-heroicons/outline';
import { categories, worksData } from '../Constant/constant';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function HomeScreen(){
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [clientPhoneNumber, setClientPhoneNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkDataVisible, setWorkDataVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showCategories, setShowCategories] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  const filteredData = data.filter(item => item.businessName.toLowerCase().includes(searchText.toLowerCase()));
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setClientPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };

    const fetchData = async () => {
      if (clientPhoneNumber) {
        try {
          const response = await axios.get(`https://api-v7quhc5aza-uc.a.run.app/getSupplier/${clientPhoneNumber}`);
          const dataArray = Object.values(response.data);
          setData(dataArray);
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPhoneNumber();
    fetchData();
  }, [clientPhoneNumber]);

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('View Categories', { ...item })}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryText} numberOfLines={2} ellipsizeMode={'tail'}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryItemModal = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItemModal}
      onPress={() => navigation.navigate('View Categories', { ...item })}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryText} numberOfLines={2} ellipsizeMode={'tail'}>
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
    <View style={{flexDirection: 'column', height: width * 0.45, alignItems: 'center'}}>
      <Image source={item.image} style={{width: width * 0.4, height: width * 0.3}} />
      <Text style={styles.workTitle}>{item.title}</Text>
      <Text style={styles.workDescription}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {isLoading ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color="#76B117" />
        </View>
      ) : data.length > 0 ? (
        <View style={styles.chatScreenHeaderView}>
          <View style={styles.chatScreenHeaderViewIcon}>
            <TouchableOpacity onPress={() => setWorkDataVisible(true)}>
              <BellIcon size={30} color={'#a9a9a9'} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Notification And Search')}>
              <QuestionMarkCircleIcon size={30} color={'#a9a9a9'} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <View style={styles.chatScreenTextInputView}>
            <MagnifyingGlassIcon size={20} color={'black'} strokeWidth={3} style={styles.chatScreenTextInputViewIcon} />
            <TextInput
              placeholder={'Search any Supplier'}
              style={styles.chatScreenTextInput}
              placeholderTextColor={'black'}
              value = {searchText}
              onChangeText={setSearchText}
            />
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.supplierId}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity style={styles.chatScreenCard} onPress={() => navigation.navigate('Chat With Supplier', {vendor: item})}>
                  <View style={styles.chatScreenCardView} >
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
          <TouchableOpacity style={styles.chatButton} onPress={() => setChatModalVisible(true)}>
            <View style={styles.chatButtonInner}>
              <Image
                source = {require('../Images/Categories.png')}
                style = {{width: 25, height: 25}}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Add Supplier')}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isChatModalVisible}
            onRequestClose={() => setChatModalVisible(!isChatModalVisible)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <FlatList
                  data={categories}
                  numColumns={3}
                  renderItem={renderCategoryItemModal}
                  keyExtractor={(item, index) => index.toString()} // Add a key extractor
                  contentContainerStyle={styles.flatListContent}
                />
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setChatModalVisible(!isChatModalVisible)}>
                  <Text style={styles.modalCloseButtonText}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


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
        </View>
      ) : (
        <SafeAreaView style={styles.safeAreaViewContainer}> {/* Wrap with SafeAreaView */}
          <ScrollView contentContainerStyle={styles.scrollViewContent}> {/* Add contentContainerStyle */}
            <View style={styles.header}>
              <Image
                source={require('../Images/ProckuredImage.jpg')}
                style={styles.profileImage}
              />
              <View style={styles.headerIcons}>
                <TouchableOpacity onPress={() => navigation.navigate('Notification And Search')}>
                  <BellIcon size={30} color={'black'} strokeWidth={2} />
                </TouchableOpacity>
                <QuestionMarkCircleIcon size={30} color={'black'} strokeWidth={2} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => navigation.navigate('Search Bar')}
            >
              <MagnifyingGlassIcon size={20} color={'black'} strokeWidth={3} style={styles.searchIcon} />
              <Text style={styles.searchText}>Search any Product</Text>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Categories</Text>
              <TouchableOpacity onPress={() => setShowCategories((!showCategories))}>
                <ChevronDownIcon size={20} color={'black'} strokeWidth={3} style = {{transform: [{rotate: showCategories ? "180deg": "0deg"}]}} />
              </TouchableOpacity>
            </View>
            {showCategories && (
              <FlatList
                data={categories}
                numColumns={3}
                renderItem={renderCategoryItem}
                keyExtractor={(item, index) => index.toString()} // Add a key extractor
                contentContainerStyle={styles.flatListContent}
              />
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>How it works?</Text>
              <TouchableOpacity onPress={() => setShowHowItWorks(!showHowItWorks)}>
                <ChevronDownIcon size={20} color={'black'} strokeWidth={3} style = {{ transform: [{rotate: showHowItWorks ? "180deg": "0deg"}]}} />
              </TouchableOpacity>
            </View>
            {showHowItWorks && (
              <FlatList
                data={worksData}
                renderItem={renderWorkItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.flatListContent}
              />
            )}


            <View style={styles.allChatView}>
              <Text style={styles.allChatText}>
                All Chats
              </Text>
              <View style={styles.chatContainer}>
                <Image
                  source={require('../Images/VendorHomePage.png')}
                  style={styles.imageContainer}
                />
                <View style={styles.emptyChatView}>
                  <ChatBubbleLeftEllipsisIcon
                    size={30}
                    color={'#757575'}
                  />
                  <Text style={styles.emptyChatText}>
                    Your Chat is Empty
                  </Text>
                  <TouchableOpacity
                    style={styles.AddSupplierTouchableOpacity}
                    onPress={() => navigation.navigate('Add Supplier')}
                  >
                    <Text style={styles.AddSupplierText}>+ Add Supplier</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.chatButton} onPress={() => setChatModalVisible(true)}>
              <View style={styles.chatButtonInner}>
                <Image
                  source = {require('../Images/Categories.png')}
                  style = {styles.categoryPopUp}
                />
              </View>
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isChatModalVisible}
              onRequestClose={() => setChatModalVisible(!isChatModalVisible)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={categories}
                    numColumns={3}
                    renderItem={renderCategoryItemModal}
                    keyExtractor={(item, index) => index.toString()} // Add a key extractor
                    contentContainerStyle={styles.flatListContent}
                  />
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setChatModalVisible(!isChatModalVisible)}>
                    <Text style={styles.modalCloseButtonText}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  chatScreenHeaderView: {
    flex: 1,
    display: 'flex',
    backgroundColor: 'white',
  },
  chatScreenHeaderViewIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    paddingTop: 40,
  },
  chatScreenTextInputView:{
    backgroundColor: 'gainsboro',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatScreenTextInputViewIcon: {
    marginLeft: 20,
  },
  chatScreenTextInput: {
    marginLeft: 10,
    width: '70%',
    color: 'black',
  },
  chatScreenCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'lightgray',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 20,
  },
  chatScreenCardView: {
    flexDirection: 'row',
  },
  chatScreenCardImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
  chatScreenCardTextView: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    marginLeft: 10,
  },
  chatScreenCardText: {
    color: '#76B117',
    fontWeight: 'bold',
    fontSize: 18,
  },
  scrollViewContent: {
    paddingBottom: width * 0.2,
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  header: {
    flexDirection: 'row',
    paddingTop: 30,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center', // Vertically center items
  },
  profileImage: {
    width: width * 0.2,
    height: width * 0.1,
    borderRadius: 35, // Half of width/height for perfect circle
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center', // Vertically center icons
  },
  searchBar: {
    backgroundColor: 'lightgray',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    padding: 10,
  },
  searchIcon: {
    marginLeft: 10,
  },
  searchText: {
    marginLeft: 10,
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5, // Add margin top for spacing
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  flatListContent: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    flex: 1,
    margin: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 100,
    width: (width - 40) / 3,
  },
  categoryItemModal: {
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 100,
    width: (width - 100) / 3,
  },
  categoryImage: {
    width: 65,
    height: 65,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    flexWrap: 'wrap',
    width: 80,
  },
  workItem: {
    width: (width - 60) / 2,
    height: 190,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -5,
    borderRadius: 10,
  },
  safeAreaViewContainer: {
    flex: 1,
  },
  workImage: {
    width: width * 0.4,
    height: width * 0.3,
    marginTop: 40,
    borderRadius: 30,
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
  chatButton: {
    position: 'absolute',
    bottom: height * 0.53, // Adjust as needed
    right: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatButtonInner: {
    backgroundColor: '#76B117',
    padding: 10,
    borderRadius: 25, // Make it a circle
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
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
    backgroundColor: '#76B117', // Example color
    marginTop: 20, // Add some margin top
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  floatingButton: {
    backgroundColor: '#76B117',
    width: 50,
    height: 50,
    borderRadius: 30,
    position: 'absolute',
    bottom: 80,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  AddSupplierTouchableOpacity: {
    backgroundColor: '#76B117',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: 320,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  AddSupplierText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 700,
    alignSelf: 'center',
    font: 'Montserrat',
  },
  categoryPopUp: {
    width: 25,
    height: 25,
  },
  allChatView: {
    flex: 1,
    height: height * 0.5
  },
  allChatText: {
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Montserrat',
    lineHeight: 30,
    paddingHorizontal: 20,
    paddingVertical: 20,
    letterSpacing: 1
  },
  chatContainer: {
    width: '90%',
    height: '85%',
    borderWidth: 1,
    borderColor: '#76B117',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderRadius: 25
  },
  imageContainer: {
    width: width * 0.4,
    height: width * 0.3,
    borderRadius: 20
  },
  emptyChatView: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  emptyChatText: {
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.5,
    fontFamily: 'Montserrat',
    color: '#757575'
  }
});
