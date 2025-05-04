import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, FlatList} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeftIcon, MagnifyingGlassIcon} from 'react-native-heroicons/outline';
import {tagColors} from '../Constant/constant';
import axios from 'axios';
import {CheckBox} from 'react-native-elements';

export default function PresetEdits() {
  {/*Navigation*/}
  const navigation = useNavigation();



  {/*Use States*/}
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedItems, setSelectedItems] = useState({})


  {/*Routes*/}
  const route = useRoute();
  const { data } = route.params;


  {/*Const*/}
  const Highlighted_Text = 'AM'


  {/*Functions*/}
  const toggleSelection = (id) => {
    setSelectedItems((prev) => ({...prev, [id]: !prev[id]}));
  }

  {/*Use Effect*/}
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api-v7quhc5aza-uc.a.run.app/getCatalogue/1234`);
        const dataArray = Object.values(response.data);
        setItems(dataArray);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
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
      {/*Header View*/}
      <View style={styles.headerView}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color="black" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.header}>Preset Edit</Text>
      </View>

      {/*Date Bar*/}
      <View style={styles.dateView}>
        <Text style={styles.dateText}>
          Date
        </Text>
        <View style={styles.dateEntryView}>
          <View style={styles.dateEntryDateView}>
            <Text style={styles.dateEntryDateText}>
              {data.date}
            </Text>
          </View>
          <View style={styles.dateEntryMonthView}>
            <Text style={styles.dateEntryMonthText}>
              {data.month}
            </Text>
          </View>
          <View style={styles.dateEntryYearView}>
            <Text style={styles.dateEntryYearText}>
              {data.year}
            </Text>
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
            <Text style={styles.timeEntryHourText}>
              {data.hourTime}
            </Text>
          </View>
          <View style={styles.timeEntryColonView}>
            <Text style={styles.timeEntryColonText}>
              :
            </Text>
          </View>
          <View style={styles.timeEntryMinuteView}>
            <Text style={styles.timeEntryMinuteText}>
              {data.hourMinute}
            </Text>
          </View>
        </View>
      </View>


      {/*Choose Audience*/}
      <View style = {styles.chooseAudienceView}>
        <Text style={styles.chooseAudienceText}>
          Choose Audience
        </Text>
        <View style={styles.tagsContainer}>
          {data.tags.map((tag, index) => (
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
          <Text style={styles.taglineTextStyle}>
            {data.taglineText}
          </Text>
        </View>
      </View>


      <View style={styles.buttonsView}>
        <TouchableOpacity style = {styles.cancelButtonTouchableOpacity} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.saveButtonTouchableOpacity} onPress={() => navigation.goBack()}>
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
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  dateEntryDateText: {
    fontStyle: 'normal',
    fontFamily: 'Open Sans',
    fontWeight: '600',
    fontSize: 16
  },
  dateEntryMonthView: {
    backgroundColor: '#EEEEEE',
    width: 80,
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
    fontSize: 16
  },
  dateEntryYearView: {
    backgroundColor: '#EEEEEE',
    width: 50,
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
    fontSize: 16
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
    alignSelf: 'center',
    borderRadius: 10
  },
  timeEntryHourText: {
    backgroundColor: '#EEEEEE',
    width: 50,
    height: 50,
    borderRadius: 10
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
    width: 50,
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
    elevation: 2
  },
  checkBoxContainerStyle: {
    padding: 0,
    margin: 0
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
});
