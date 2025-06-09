import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, FlatList, Alert} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeftIcon, MagnifyingGlassIcon} from 'react-native-heroicons/outline';
import {tags, tagColors} from '../Constant/constant';
import axios from 'axios';
import {CheckBox} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NewCampaign() {
  {/*Navigation*/}
  const navigation = useNavigation();



  {/*Use States*/}
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedItems, setSelectedItems] = useState({})
  const [formData, setFormData] = useState({
    date: '',
    month: '',
    year: '',
    timeHour: '',
    timeMinute: '',
    taglineText: ''
  });
  const [productData, setProductData] = useState({});
  const [selectedProductData, setSelectedProductData] = useState([]);
  const [audienceData, setAudienceData] = useState({});
  const [selected, setSelected] = useState('AM');
  const [gstNumber, setGSTNumber] = useState(null);


  {/*Const*/}
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({...prev, [field]: value}));
  }

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
      headerTitle: 'New Campaign',
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
  const handleSubmit = () => {
    const {date, month, year, timeHour, timeMinute, taglineText} = formData;
    if (!date || !month || !year || !timeHour || !timeMinute || !taglineText) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    if (selectedProductData.length === 0) {
      Alert.alert("Error", "Please select at least one product.");
      return;
    }
    Alert.alert("Selected Products", JSON.stringify(selectedProductData.map(p => p.prodName).join(", ")));
    const campaignData = {
      date,
      month,
      year,
      timeHour,
      timeMinute,
      period: selected,
      taglineText,
      selectedProducts: selectedProductData,
    };
    // Navigate or process
    navigation.navigate("Campaign Overview", {campaignData});
    Alert.alert('Data', `Date: ${date}, Month: ${month}, Year: ${year}, Hour: ${timeHour}, Minute: ${timeMinute}, Tagline Text: ${taglineText}, Selected Time: ${selected}`);
  };


  {/*Functions*/}
  const toggleSelection = (id) => {
    setSelectedItems((prev) => {
      const newState = {...prev, [id]: !prev[id]};
      const selectedIds = Object.keys(newState).filter(key => newState[key]);
      const selectedProducts = items.filter(item => selectedIds.includes(item.productId));
      setSelectedProductData(selectedProducts);
      return newState;
    });
  };

  
  {/*Use Effect*/}
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api-v7quhc5aza-uc.a.run.app/getCatalogue/${gstNumber}`);
        const dataArray = Object.values(response.data);
        setItems(dataArray);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [gstNumber]);
  useEffect(() => {
    if (searchTerm) {
      const results = items.filter(item =>
        item.prodName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(results);
    } else {
      setFilteredData(items);
    }
  }, [searchTerm, items]);

  return (
    <ScrollView style = {styles.container}>

      {/*Date Bar*/}
      <View style={styles.dateView}>
        <Text style={styles.dateText}>
          Date
        </Text>
        <View style={styles.dateEntryView}>
          <View style={styles.dateEntryDateView}>
            <TextInput
              style={styles.dateEntryDateText}
              placeholder={'Date'}
              placeholderTextColor={'black'}
              keyboardType={'numeric'}
              value={formData.date}
              onChangeText={(text) => handleInputChange('date', text)}
            />
          </View>
          <View style={styles.dateEntryMonthView}>
            <TextInput
              style={styles.dateEntryMonthText}
              placeholder={'Month'}
              placeholderTextColor={'black'}
              keyboardType={'default'}
              value={formData.month}
              onChangeText={(text) => handleInputChange('month', text)}
            />
          </View>
          <View style={styles.dateEntryYearView}>
            <TextInput
              style={styles.dateEntryYearText}
              placeholder={'Year'}
              placeholderTextColor={'black'}
              keyboardType={'numeric'}
              value={formData.year}
              onChangeText={(text) => handleInputChange('year', text)}
            />
          </View>
        </View>
      </View>


      {/*Time View*/}
      <View style = {styles.timeView}>
        <Text style={styles.timeText}>
          Time
        </Text>
        <View style={styles.timeEntryView}>
          <View style={styles.timeEntryHourView}>
            <TextInput
              style={styles.timeEntryHourText}
              placeholder={'Hour'}
              placeholderTextColor={'black'}
              keyboardType={'numeric'}
              value={formData.timeHour}
              onChangeText={(text) => handleInputChange('timeHour', text)}
            />
          </View>
          <View style={styles.timeEntryColonView}>
            <Text style={styles.timeEntryColonText}>
              :
            </Text>
          </View>
          <View style={styles.timeEntryMinuteView}>
            <TextInput
              style={styles.timeEntryMinuteText}
              placeholder={'Minute'}
              placeholderTextColor={'black'}
              keyboardType={'numeric'}
              value={formData.timeMinute}
              onChangeText={(text) => handleInputChange('timeMinute', text)}
            />
          </View>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[styles.option, selected === 'AM' && styles.selected]}
              onPress={() => setSelected('AM')}
            >
              <Text style={[styles.text, selected === 'AM' && styles.selectedText]}>AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, selected === 'PM' && styles.selected]}
              onPress={() => setSelected('PM')}
            >
              <Text style={[styles.text, selected === 'PM' && styles.selectedText]}>PM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      {/*Choose Audience*/}
      <View style = {styles.chooseAudienceView}>
        <Text style={styles.chooseAudienceText}>
          Choose Audience
        </Text>
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <Text key={index} style={[styles.tag, { backgroundColor: tagColors[tag] || "#ccc" }]}>
              {tag} x
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.dataView}>
        {/*Search Bar*/}
        <View style={styles.searchContainerView}>
          <MagnifyingGlassIcon size={20} color={'black'} strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            placeholderTextColor={'black'}
            placeholder={'Search any Product'}
            value={searchTerm}
            onChangeText={setSearchTerm}
            keyboardType={'default'}
            style={styles.searchBarInput}
          />
        </View>
        <View>
          {
            (searchTerm ? filteredData : items).length !== 0 ? (
              <>
                <FlatList
                  data={searchTerm ? filteredData : items}
                  keyExtractor={(item) => item.productId}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.dataTouchableOpacity}
                      onPress={() => toggleSelection(item.productId)}
                    >
                      <CheckBox
                        checked = {!!selectedItems[item.productId]}
                        onPress={() => toggleSelection(item.productId)}
                        containerStyle={styles.checkBoxContainerStyle}
                        checkedColor={'green'}
                      />

                      <View style={styles.supplierDataView}>
                        <Text style = {styles.productNameStyle}>
                          {item.prodName}
                        </Text>
                        <Text style={styles.productCategoryStyle}>
                          {item.CategoryName}
                        </Text>
                        <Text style = {styles.productPriceStyle}>
                          {item.myPrice}
                        </Text>
                        <Text style={styles.productDiscountStyle}>
                          10% off
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )} />
              </>
            ):(
              <View></View>
            )
          }
        </View>
      </View>

      <View style = {styles.productImageView}>
        <Text style={styles.productImageText}>
          Choose Product Image*
        </Text>
        <Image
          source = {require('../Images/AddProduct.png')}
          style = {styles.productImage}
        />
      </View>


      <View style = {styles.taglineView}>
        <Text style={styles.writeTaglineText}>
          Write Tagline Text*
        </Text>
        <View style={styles.taglineTextView}>
          <TextInput
            style={styles.taglineTextStyle}
            placeholder = {'Enter the tagline text'}
            placeholderTextColor={'black'}
            keyboardType={'default'}
            value={formData.taglineText}
            onChangeText={(text) => handleInputChange('taglineText', text)}
          />
        </View>
      </View>


      <View style={styles.buttonsView}>
        <TouchableOpacity style = {styles.cancelButtonTouchableOpacity} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.saveButtonTouchableOpacity} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20
  },
  dateView: {
    flexDirection: 'column'
  },
  headerView: {
    flexDirection: 'row',
    paddingTop: 22
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 22,
    color: "#222",
    marginTop: -5,
    marginLeft: 10
  },
  tagsContainer: {
    flexDirection: "row",
    marginTop: 10,
    borderRadius: 25
  },
  tag: {
    color: "white",
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginBottom: 5,
    alignSelf: "flex-start",
    marginRight: 5
  },
  buttonsView: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10,
    alignContent: 'space-between',
    marginBottom: 30
  },
  cancelButtonTouchableOpacity: {
    backgroundColor: '#ECF0F1',
    width: 100, height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60
  },
  cancelButtonText: {
    fontStyle: 'normal',
    fontFamily: 'Montserrat',
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#76B117'
  },
  saveButtonTouchableOpacity: {
    backgroundColor: '#76B117',
    width: 120,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
    marginLeft: 30
  },
  saveButtonText: {
    fontStyle: 'normal',
    fontFamily: 'Montserrat',
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: '#ECF0F1'
  },
  taglineView: {
    paddingTop: 30
  },
  writeTaglineText: {
    fontWeight: '700',
    fontSize: 18,
    fontStyle: 'normal',
    fontFamily: 'Montserrat',
    lineHeight: 20,
    letterSpacing: 0.4
  },
  taglineTextView: {
    borderWidth: 1,
    borderColor: 'lightgray',
    marginTop: 10,
    borderRadius: 10
  },
  taglineTextStyle: {
    color: '#323232',
    fontStyle: 'normal',
    fontFamily: 'OpenSans',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.4,
    marginLeft: 7,
    marginRight: 7
  },
  productImageView: {
    paddingTop: 30
  },
  productImageText: {
    fontWeight: '700',
    fontSize: 18,
    fontStyle: 'normal',
    fontFamily: 'Montserrat',
    lineHeight: 20,
    letterSpacing: 0.4
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginTop: 10
  },
  dateText: {
    fontWeight: '700',
    fontSize: 18,
    fontStyle: 'normal',
    fontFamily: 'Montserrat',
    lineHeight: 20,
    letterSpacing: 0.4
  },
  dateEntryView: {
    flexDirection: 'row',
    marginTop: 15
  },
  dateEntryDateView: {
    backgroundColor: '#EEEEEE',
    width: 60,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  dateEntryDateText: {
    fontStyle: 'normal',
    fontFamily: 'Open Sans',
    fontWeight: '600',
    fontSize: 16,
    color: 'black'
  },
  dateEntryMonthView: {
    backgroundColor: '#EEEEEE',
    width: 60,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginLeft: 10
  },
  dateEntryMonthText: {
    fontStyle: 'normal',
    fontFamily: 'Open Sans',
    fontWeight: '600',
    fontSize: 16,
    color: 'black'
  },
  dateEntryYearView: {
    backgroundColor: '#EEEEEE',
    width: 60,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginLeft: 10
  },
  dateEntryYearText: {
    fontStyle: 'normal',
    fontFamily: 'Open Sans',
    fontWeight: '600',
    fontSize: 16,
    color: 'black'
  },
  timeView: {
    paddingTop: 30
  },
  timeText: {
    fontWeight: '700',
    fontSize: 18,
    fontStyle: 'normal',
    fontFamily: 'Montserrat',
    lineHeight: 20,
    letterSpacing: 0.4
  },
  timeEntryView: {
    flexDirection: 'row',
    marginTop: 15
  },
  timeEntryHourView: {
    backgroundColor: '#EEEEEE',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    alignContent: 'center'
  },
  timeEntryHourText: {
    fontStyle: 'normal',
    fontFamily: 'Open Sans',
    fontWeight: '600',
    fontSize: 16
  },
  timeEntryColonView: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginLeft: 5
  },
  timeEntryColonText: {
    fontStyle: 'normal',
    fontSize: 20,
    fontWeight: 'bold'
  },
  timeEntryMinuteView: {
    backgroundColor: '#EEEEEE',
    width: 80,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginLeft: 5
  },
  timeEntryMinuteText: {
    fontStyle: 'normal',
    fontFamily: 'Open Sans',
    fontWeight: '600',
    fontSize: 16
  },
  chooseAudienceView: {
    paddingTop: 30
  },
  chooseAudienceText: {
    fontWeight: '700',
    fontSize: 18,
    fontStyle: 'normal',
    fontFamily: 'Montserrat',
    lineHeight: 20,
    letterSpacing: 0.4
  },
  dataView: {
    marginTop: 20
  },
  searchContainerView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    elevation: 2
  },
  searchIcon: {
    marginTop: 10
  },
  searchBarInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16
  },
  dataTouchableOpacity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    elevation: 2,
    borderColor: 'black'
  },
  checkBoxContainerStyle: {
    padding: 0,
    margin: 0,
    borderColor: '#76B117'
  },
  supplierDataView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 10
  },
  productNameStyle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  productCategoryStyle: {
    fontSize: 14,
    color: 'gray'
  },
  productPriceStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black'
  },
  productDiscountStyle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'green'
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#69B946',
  },
  text: {
    color: '#333',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
  },
  pickerContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    width: 80,
    marginLeft: 20
  }
});
