import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from "react-native-heroicons/outline";
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VendorExistingPresets(){
  const navigation = useNavigation();
  const [expandedSections, setExpandedSections] = useState({});
  const [gstNumber, setGSTNumber] = useState(null);
  const [data, setData] = useState([]);
  const [drafts, setDrafts] = useState([]);            // ⬅️ live === false
  const [previous, setPrevious] = useState([]);  
  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const getAllAsyncStorageItems = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const stores = await AsyncStorage.multiGet(keys);
        stores.forEach(([key, value]) => {
          if (key === 'supplierGST') {
            setGSTNumber(value);
          }
        });
      } catch (error) {
        console.error('Error fetching AsyncStorage items:', error);
      }
    };

    getAllAsyncStorageItems();
  }, [gstNumber]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Existing Presets',
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
        justifyContent: 'center',
        // color: 'white',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={{paddingHorizontal: 13}}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  useEffect(() => {
    const getData = async() => {
      try{
        const response = await axios.post('https://api-v7quhc5aza-uc.a.run.app/getCampaign', {
          "gstNumber": gstNumber,
        });

        const campaigns = Object.values(response.data.data || {});
        const liveCampaigns  = campaigns.filter(
          c => c.live === true || c.live === 'true'
        );
        const nonLiveCampaigns = campaigns.filter(
          c => c.live === false || c.live === 'false'
        );
        setPrevious(liveCampaigns);
        setDrafts(nonLiveCampaigns);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data. Please try again later.');
      }
    };
    if(gstNumber){
      getData();
    }
  }, [gstNumber]);
  
  const vendorExistingPresets = [
  {
    id: 'drafts',
    title: 'Drafts',
    questions: drafts,
  },
  {
    id: 'previousCampaign',
    title: 'Previous Campaign',
    questions: previous,
  },
];
  return (
    <ScrollView style={styles.container}>
      {vendorExistingPresets.map(section => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.questions.map(q => (
            <View key={q.id} style={styles.question}>
              <View styles={styles.question}>
                <Text style={styles.questionText}>{q.tagLine}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Edit Preset', {data: q})}>
                <ChevronRightIcon size={20} color={'black'} strokeWidth={4} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 22,
    color: "#222",
    marginTop: -5,
    marginLeft: 10
  },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  question: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  questionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: 'bold'
  },
  answer: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
    paddingLeft: 10,
    fontWeight: 'bold'
  },
});
