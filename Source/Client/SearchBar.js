import React, { useEffect, useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, Modal, Dimensions} from 'react-native';
import { MagnifyingGlassIcon, QuestionMarkCircleIcon } from 'react-native-heroicons/outline';
import { BellIcon } from 'react-native-heroicons/solid';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {worksData} from '../Constant/constant';



const { width } = Dimensions.get('window');


export default function SearchBar() {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isWorkDataVisible, setWorkDataVisible] = useState(false);

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (storedId) {
          setClientId(storedId);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };

    const fetchData = async () => {
      if (clientId) {
        try {
          const response = await axios.get(`https://api-v7quhc5aza-uc.a.run.app/getSupplier/${clientId}`);
          const dataArray = Object.values(response.data);
          setData(dataArray);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchClientId();
    fetchData();
  }, [clientId]);

  useEffect(() => {
    if (searchTerm) {
      const results = data.filter(item =>
        item.businessName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(results);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  const renderWorkItemModal = ({ item }) => (
    <View style={{flexDirection: 'column', height: width* 0.45, alignItems: 'center'}}>
      <Image source={item.image} style={{width: width* 0.4, height: width* 0.3}} />
      <Text style={styles.workTitle}>{item.title}</Text>
      <Text style={styles.workDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerIconView}>
        <TouchableOpacity onPress={() => navigation.navigate('Notification And Search')}>
          <BellIcon size={30} color={'#a9a9a9'} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setWorkDataVisible(true)}>
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
      <View style={styles.searchBarView}>
        <MagnifyingGlassIcon size={20} color={'black'} strokeWidth={3} style={styles.searchBarIcon} />
        <TextInput
          placeholder={'Search any Supplier'}
          style={styles.searchBarTextInput}
          placeholderTextColor={"black"}
          value={searchTerm}
          onChangeText={setSearchTerm}
          keyboardType={'default'}
        />
      </View>

      <View>
        {(searchTerm ? filteredData : data).length !== 0 ? (
          <>
            <FlatList
              data={searchTerm ? filteredData : data}
              keyExtractor={(item) => item.supplierId}
              renderItem={({ item }) => (
                <View>
                  <View style={styles.itemCard}>
                    <View style={styles.itemCardDetails}>
                      <Image
                        source={require('../Images/ProckuredImage.jpg')}
                        style={styles.itemImage}
                      />
                      <View style={styles.itemDetailsView}>
                        <Text style={styles.itemName}>
                          {item.businessName}
                        </Text>
                        <Text>{item.email}</Text>
                        <Text>{item.country}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.reviewTouchableOpacity}>
                      <Text style={styles.reviewText}>+</Text>
                      <Text style={styles.reviewText}>Send for</Text>
                      <Text style={styles.reviewText}>Review</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.AddSupplierTouchableOpacity}
              onPress={() => navigation.navigate("Add Supplier")}
            >
              <Text style={styles.AddSupplierText}>+ Add Supplier</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <Image
              source={require('../Images/FindAnySupplier.png')}
              style={styles.addSupplierImage}
            />
            <TouchableOpacity
              style={styles.addSupplierTouchableOpacity}
              onPress={() => navigation.navigate("Add Supplier")}
            >
              <Text style={styles.addSupplierText}>+ Add Supplier</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: 'white'
  },
  headerIconView: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    paddingTop: 40
  },
  searchBarView: {
    backgroundColor: 'gainsboro',
    width: "90%",
    alignSelf: "center",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  searchBarIcon: {
    marginLeft: 20
  },
  searchBarTextInput: {
    marginLeft: 10,
    width: "70%",
    color: "black"
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'lightgray',
    width: "95%",
    alignSelf: "center",
    borderRadius: 20
  },
  itemCardDetails: {
    flexDirection: "row"
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 20
  },
  itemDetailsView: {
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  itemName: {
    color: "black",
    fontWeight: 'bold',
    fontSize: 18
  },
  reviewTouchableOpacity: {
    flexDirection: "column",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  reviewText: {
    color: "green"
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
  addSupplierTouchableOpacity: {
    backgroundColor: "#76B117",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: 320,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30
  },
  addSupplierText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: 700,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    font: "Montserrat"
  },
  addSupplierImage: {
    width: 320,
    height: 320,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    borderRadius: 50
  },
  AddSupplierTouchableOpacity: {
    backgroundColor: "#76B117",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: 320,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30
  },
  AddSupplierText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: 700,
    alignSelf: "center",
    font: "Montserrat"
  },
})
