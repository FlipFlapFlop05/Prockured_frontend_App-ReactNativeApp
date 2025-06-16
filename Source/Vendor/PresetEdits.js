import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, FlatList, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeftIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { CheckBox } from 'react-native-elements';
// Assuming tagColors is still needed, keep this import. If not, you can remove it.
// import { tagColors } from '../Constant/constant'; 

export default function PresetEdits() {
  const navigation = useNavigation();
  const route = useRoute();
  const { data } = route.params;
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selected, setSelected] = useState('AM');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});


  useEffect(() => {
    if (data.schedule.format === "PM"){
      setSelectedStatus("PM");
    }
    else if (data.schedule.format === "AM"){
      setSelectedStatus("AM");
    }
  }, []);
  useEffect(() => {
    if (data && data.product) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const newFilteredData = data.product
      setFilteredProducts(newFilteredData);
    } else {
      setFilteredProducts([]); 
    }
  }, [searchTerm, data]); 
  useEffect(() => {
    Alert.alert("Fil", JSON.stringify(filteredProducts));
  }, []);

  const toggleSelection = (id) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderProductItem = ({ item }) => {
    if (!item || item.productId === undefined || item.productId === null) {
      console.warn("❌ Cannot render product item: Invalid item or missing productId.", item);
      return null; 
    }

    const productIdString = item.productId.toString();

    return (
      <TouchableOpacity
        style={styles.dataTouchableOpacity}
        onPress={() => toggleSelection(productIdString)}
      >
        <CheckBox
          checked={!!selectedItems[productIdString]} 
          onPress={() => toggleSelection(productIdString)}
          containerStyle={styles.checkBoxContainerStyle}
          checkedColor={'green'}
        />

        <View style={styles.supplierDataView}>
          <Text style={styles.productNameStyle} numberOfLines={1}>
            {item.name || 'N/A'}
          </Text>
          <Text style={styles.productCategoryStyle} numberOfLines={1}>
            {item.category || 'N/A'}
          </Text>
          <Text style={styles.productPriceStyle} numberOfLines={1}>
            ₹{item.price !== undefined ? item.price : 'N/A'} 
          </Text>
          <Text style={styles.productDiscountStyle} numberOfLines={1}>
            10% off 
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Preset Edit',
      headerStyle: {
        backgroundColor: '#f8f8f8',
        elevation: 0, // Remove shadow on Android
        shadowOpacity: 0, // Remove shadow on iOS
        borderBottomWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
        justifyContent: 'center',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={{ paddingHorizontal: 13 }}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]); // Depend on navigation to re-run if navigation object changes

  const handleSubmit = () => {
    Alert.alert("Success", "Changes Saved");
    navigation.navigate("Vendor App", {screen: "Chat"})
  }

  return (
          <ScrollView style={styles.container}>
  
              {/* Date Bar */}
              <View style={styles.dateView}>
                  <Text style={styles.dateText}>Date</Text>
                  <View style={styles.dateEntryView}>
                      <View style={styles.dateEntryDateView}>
                          <TextInput
                              style={styles.dateEntryDateText}
                              placeholder={'DD'}
                              placeholderTextColor={'gray'}
                              keyboardType={'numeric'}
                              maxLength={2}
                              value={data.schedule.day}
                              onChangeText={(text) => handleInputChange('date', text)}
                          />
                      </View>
                      <View style={styles.dateEntryMonthView}>
                          <TextInput
                              style={styles.dateEntryMonthText}
                              placeholder={'MM'}
                              placeholderTextColor={'gray'}
                              keyboardType={'numeric'}
                              maxLength={2}
                              value={data.schedule.month}
                              onChangeText={(text) => handleInputChange('month', text)}
                          />
                      </View>
                      <View style={styles.dateEntryYearView}>
                          <TextInput
                              style={styles.dateEntryYearText}
                              placeholder={'YYYY'}
                              placeholderTextColor={'gray'}
                              keyboardType={'numeric'}
                              maxLength={4}
                              value={data.schedule.year}
                              onChangeText={(text) => handleInputChange('year', text)}
                          />
                      </View>
                  </View>
              </View>
  
              {/* Time View */}
              <View style={styles.timeView}>
                  <Text style={styles.timeText}>Time</Text>
                  <View style={styles.timeEntryView}>
                      <View style={styles.timeEntryHourView}>
                          <TextInput
                              style={styles.timeEntryHourText}
                              placeholder={'HH'}
                              placeholderTextColor={'gray'}
                              keyboardType={'numeric'}
                              maxLength={2}
                              value={data.schedule.hour}
                              onChangeText={(text) => handleInputChange('timeHour', text)}
                          />
                      </View>
                      <View style={styles.timeEntryColonView}>
                          <Text style={styles.timeEntryColonText}>:</Text>
                      </View>
                      <View style={styles.timeEntryMinuteView}>
                          <TextInput
                              style={styles.timeEntryMinuteText}
                              placeholder={'MM'}
                              placeholderTextColor={'gray'}
                              keyboardType={'numeric'}
                              maxLength={2}
                              value={data.schedule.month}
                              onChangeText={(text) => handleInputChange('timeMinute', text)}
                          />
                      </View>
                      <View style={styles.pickerContainer}>
                         <TouchableOpacity
                            style={[styles.option, selectedStatus === 'AM' && styles.selected]}
                            onPress={() => setSelected('AM')}
                          >
                                <Text style={[styles.text, selected === 'AM' && styles.selectedText]}>AM</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.option, selectedStatus === 'PM' && styles.selected]}
                            onPress={() => setSelected('PM')}
                          >
                            <Text style={[styles.text, selected === 'PM' && styles.selectedText]}>PM</Text>
                          </TouchableOpacity>
                        </View>
                  </View>
              </View>
  
              {/* Choose Audience - Dynamic Tags */}
              <View style={styles.chooseAudienceView}>
                  <Text style={styles.chooseAudienceText}>Choose Audience</Text>
                  <View style={styles.tagsContainer}>
                      <Text>
                        {data.audienceTags}
                      </Text>
                  </View>
              </View>
  
              {/* Product Selection Section */}
              <View style={styles.dataView}>
                  {/* Search Bar */}
                  <View style={styles.searchContainerView}>
                      <MagnifyingGlassIcon size={20} color={'black'} strokeWidth={2} style={styles.searchIcon}/>
                      <TextInput
                          placeholderTextColor={'gray'}
                          placeholder={'Search any Product'}
                          value={searchTerm}
                          onChangeText={setSearchTerm}
                          keyboardType={'default'}
                          style={styles.searchBarInput}
                      />
                  </View>
                  <View>
                    <TouchableOpacity
                        style={styles.dataTouchableOpacity}
                      >
                        <CheckBox
                          containerStyle={styles.checkBoxContainerStyle}
                          checkedColor={'green'}
                        />

                        <View style={styles.supplierDataView}>
                          <Text style={styles.productNameStyle} numberOfLines={1}>
                            {data.product.name || 'N/A'}
                          </Text>
                          <Text style={styles.productCategoryStyle} numberOfLines={1}>
                            {data.product.category || 'N/A'}
                          </Text>
                          <Text style={styles.productPriceStyle} numberOfLines={1}>
                            ₹{data.product.price !== undefined ? data.product.price : 'N/A'} 
                          </Text>
                          <Text style={styles.productDiscountStyle} numberOfLines={1}>
                            10% off 
                          </Text>
                        </View>
                      </TouchableOpacity>
                  </View>
              </View>
  
              {/* Choose Product Image */}
              <View style={styles.productImageView}>
                  <Text style={styles.productImageText}>Choose Product Image*</Text>
                  <TouchableOpacity onPress={() => Alert.alert("Feature", "Image selection not yet implemented!")}>
                      <Image
                          source={require('../Images/AddProduct.png')}
                          style={styles.productImage}
                      />
                  </TouchableOpacity>
              </View>
  
              {/* Write Tagline Text */}
              <View style={styles.taglineView}>
                  <Text style={styles.writeTaglineText}>Write Tagline Text*</Text>
                  <View style={styles.taglineTextView}>
                      <TextInput
                          style={styles.taglineTextStyle}
                          placeholder={'Enter the tagline text'}
                          placeholderTextColor={'gray'}
                          keyboardType={'default'}
                          value={data.tagLine}
                          onChangeText={(text) => handleInputChange('taglineText', text)}
                          multiline={true}
                          numberOfLines={3}
                      />
                  </View>
              </View>
  
              {/* Action Buttons */}
              <View style={styles.buttonsView}>
                  <TouchableOpacity style={styles.cancelButtonTouchableOpacity} onPress={() => navigation.goBack()}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButtonTouchableOpacity} onPress={handleSubmit}>
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
              </View>
          </ScrollView>
      );
  }
  
  const styles = StyleSheet.create({
      container: {
          flex: 1,
          backgroundColor: "white",
          paddingHorizontal: 20,
      },
      dateView: {
          flexDirection: 'column',
          paddingTop: 20,
      },
      dateText: {
          fontWeight: '700',
          fontSize: 18,
          fontStyle: 'normal',
          fontFamily: 'Montserrat',
          lineHeight: 20,
          letterSpacing: 0.4,
          color: '#333',
      },
      dateEntryView: {
          flexDirection: 'row',
          marginTop: 15,
          justifyContent: 'flex-start',
          gap: 10,
      },
      dateEntryDateView: {
          backgroundColor: '#EEEEEE',
          width: 60,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
      },
      dateEntryDateText: {
          fontStyle: 'normal',
          fontFamily: 'Open Sans',
          fontWeight: '600',
          fontSize: 16,
          color: 'black',
          textAlign: 'center',
      },
      dateEntryMonthView: {
          backgroundColor: '#EEEEEE',
          width: 60,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
      },
      dateEntryMonthText: {
          fontStyle: 'normal',
          fontFamily: 'Open Sans',
          fontWeight: '600',
          fontSize: 16,
          color: 'black',
          textAlign: 'center',
      },
      dateEntryYearView: {
          backgroundColor: '#EEEEEE',
          width: 75,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
      },
      dateEntryYearText: {
          fontStyle: 'normal',
          fontFamily: 'Open Sans',
          fontWeight: '600',
          fontSize: 16,
          color: 'black',
          textAlign: 'center',
      },
      timeView: {
          paddingTop: 30,
      },
      timeText: {
          fontWeight: '700',
          fontSize: 18,
          fontStyle: 'normal',
          fontFamily: 'Montserrat',
          lineHeight: 20,
          letterSpacing: 0.4,
          color: '#333',
      },
      timeEntryView: {
          flexDirection: 'row',
          marginTop: 15,
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 5,
      },
      timeEntryHourView: {
          backgroundColor: '#EEEEEE',
          width: 50,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
      },
      timeEntryHourText: {
          fontStyle: 'normal',
          fontFamily: 'Open Sans',
          fontWeight: '600',
          fontSize: 16,
          color: 'black',
          textAlign: 'center',
      },
      timeEntryColonView: {
          alignItems: 'center',
          justifyContent: 'center',
      },
      timeEntryColonText: {
          fontStyle: 'normal',
          fontSize: 20,
          fontWeight: 'bold',
          color: '#333',
      },
      timeEntryMinuteView: {
          backgroundColor: '#EEEEEE',
          width: 50,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
      },
      timeEntryMinuteText: {
          fontStyle: 'normal',
          fontFamily: 'Open Sans',
          fontWeight: '600',
          fontSize: 16,
          color: 'black',
          textAlign: 'center',
      },
      pickerContainer: {
          flexDirection: 'row',
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#ddd',
          width: 100,
          marginLeft: 20,
      },
      option: {
          flex: 1,
          paddingVertical: 10,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
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
      chooseAudienceView: {
          paddingTop: 30,
      },
      chooseAudienceText: {
          fontWeight: '700',
          fontSize: 18,
          fontStyle: 'normal',
          fontFamily: 'Montserrat',
          lineHeight: 20,
          letterSpacing: 0.4,
          color: '#333',
      },
      tagsContainer: {
          flexDirection: "row",
          flexWrap: 'wrap',
          marginTop: 10,
          gap: 8,
      },
      tag: {
          color: "white",
          fontSize: 14,
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 20,
          alignSelf: "flex-start",
      },
      dataView: {
          marginTop: 20,
      },
      searchContainerView: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: {width: 0, height: 2},
          shadowRadius: 4,
          elevation: 2,
      },
      searchIcon: {
          marginRight: 8,
      },
      searchBarInput: {
          flex: 1,
          fontSize: 16,
          color: '#333',
      },
      loadingContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 20,
      },
      loadingText: {
          marginTop: 10,
          fontSize: 16,
          color: '#555',
      },
      flatListContent: {
          paddingBottom: 20,
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
          shadowOffset: {width: 0, height: 2},
          shadowRadius: 4,
          elevation: 2,
          borderColor: '#eee',
          borderWidth: 1,
      },
      checkBoxContainerStyle: {
          padding: 0,
          margin: 0,
          marginRight: 10,
          backgroundColor: 'transparent',
          borderWidth: 0,
      },
      supplierDataView: {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
      },
      productNameStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          flexShrink: 1,
          marginRight: 5,
      },
      productCategoryStyle: {
          fontSize: 14,
          color: 'gray',
          flexShrink: 1,
          marginRight: 5,
      },
      productPriceStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          marginRight: 5,
      },
      productDiscountStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: 'green',
      },
      emptyListContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 20,
      },
      emptyListText: {
          fontSize: 16,
          color: '#757575',
      },
      productImageView: {
          paddingTop: 30,
      },
      productImageText: {
          fontWeight: '700',
          fontSize: 18,
          fontStyle: 'normal',
          fontFamily: 'Montserrat',
          lineHeight: 20,
          letterSpacing: 0.4,
          color: '#333',
      },
      productImage: {
          width: 100,
          height: 100,
          borderRadius: 20,
          marginTop: 10,
          borderWidth: 1,
          borderColor: '#ddd',
      },
      taglineView: {
          paddingTop: 30,
      },
      writeTaglineText: {
          fontWeight: '700',
          fontSize: 18,
          fontStyle: 'normal',
          fontFamily: 'Montserrat',
          lineHeight: 20,
          letterSpacing: 0.4,
          color: '#333',
      },
      taglineTextView: {
          borderWidth: 1,
          borderColor: 'lightgray',
          marginTop: 10,
          borderRadius: 10,
      },
      taglineTextStyle: {
          color: '#323232',
          fontStyle: 'normal',
          fontFamily: 'OpenSans',
          fontSize: 15,
          fontWeight: '600',
          lineHeight: 20,
          letterSpacing: 0.4,
          padding: 10,
          minHeight: 80,
          textAlignVertical: 'top',
      },
      buttonsView: {
          flexDirection: 'row',
          alignSelf: 'center',
          justifyContent: 'center',
          marginTop: 30,
          marginBottom: 30,
          gap: 30,
      },
      cancelButtonTouchableOpacity: {
          backgroundColor: '#ECF0F1',
          width: 120,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 60,
      },
      cancelButtonText: {
          fontStyle: 'normal',
          fontFamily: 'Montserrat',
          fontWeight: '800',
          fontSize: 16,
          lineHeight: 20,
          letterSpacing: 0.4,
          color: '#76B117',
      },
      saveButtonTouchableOpacity: {
          backgroundColor: '#76B117',
          width: 150,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 60,
      },
      saveButtonText: {
          fontStyle: 'normal',
          fontFamily: 'Montserrat',
          fontWeight: '800',
          fontSize: 16,
          lineHeight: 20,
          letterSpacing: 0.4,
          color: '#ECF0F1',
      },
  });