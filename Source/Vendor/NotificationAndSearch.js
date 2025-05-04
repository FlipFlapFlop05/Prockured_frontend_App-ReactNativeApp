import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, Modal} from 'react-native';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {
  ChevronLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  ChatBubbleBottomCenterIcon,
} from 'react-native-heroicons/outline';
import {BellIcon} from "react-native-heroicons/solid";
import {useNavigation} from '@react-navigation/native';
import {worksData} from '../Constant/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const { width } = Dimensions.get('window');

export default function SupplierNotificationAndSearch() {
  const navigation = useNavigation();
  const [isWorkDataVisible, setWorkDataVisible] = useState(false);



  const [data, setData] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState(null);

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.log('Error Fetching Client ID: ', error);
      }
    };
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (phoneNumber) {
        try {
          const response = await axios.get(
            `https://api-v7quhc5aza-uc.a.run.app/getSupplierDetails/${phoneNumber}`
          );
          setData(response.data);
        } catch (error) {
          console.log(error);
        }
      }
    };

    if (phoneNumber) {fetchData();}
  }, [phoneNumber]);



  const renderWorkItemModal = ({ item }) => (
    <View style={styles.workCard}>
      <Image source={item.image} style={{width: width* 0.4, height: width* 0.3}} />
      <Text style={styles.workTitle}>{item.title}</Text>
      <Text style={styles.workDescription}>{item.description}</Text>
    </View>
  );
  const options = [
    {
      id: 1,
      title: "Chat Support",
      icon: ChatBubbleOvalLeftEllipsisIcon,
      screen: 'Vendor Chat Support'
    },
    {
      id: 2,
      title: "Support History",
      icon: ClockIcon,
      screen: 'Vendor Chat Support'
    },
    {
      id: 3,
      title: "FAQs & SOP",
      icon: ChatBubbleBottomCenterIcon,
      screen: 'Vendor FAQ'
    }
  ]

  return (
    <View style = {styles.container}>
      <View style = {styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={25} color = "black" strokeWidth={3}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setWorkDataVisible(true)} >
          <BellIcon size={25} color = {"black"} strokeWidth={3} />
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



      <View style = {styles.header}>
        <Text style = {styles.greeting}>
          Hey{"\t"}
          <Text style = {styles.name}>
            {data.Name}!
          </Text>
        </Text>
        <Text style = {styles.subtitle}>
          How can we help?
        </Text>
      </View>
      <FlatList
        data={options}
        keyExtractor= {(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style = {styles.button} onPress={() => navigation.navigate(item.screen)}>
            {
              item.id === "2" ? (
                <item.icon size={24} color = "#333" />
              ):(
                <item.icon size={24} color={"#333"} />
              )
            }
            <Text style = {styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
    paddingHorizontal: 20,
    paddingTop: 50
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  header: {
    marginBottom: 20,
    padding: 5,
    paddingTop: 30
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222"
  },
  name: {
    color: "#85C100"
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333"
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
})
