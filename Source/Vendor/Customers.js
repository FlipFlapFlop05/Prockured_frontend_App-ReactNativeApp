import React, {useLayoutEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {customers} from '../Constant/constant';
import {ChevronDownIcon, ChevronLeftIcon} from 'react-native-heroicons/outline';
import {tagColors} from '../Constant/constant';
import GenericVectorIcon from '../components/GenericVectorIcon';

const Customers = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Customers',
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
      },
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 20,
        fontFamily: 'Montserrat',
        justifyContent: 'center',
        // color: 'white',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{paddingHorizontal: 15}}>
          <ChevronLeftIcon size={22} color="#333" strokeWidth={2} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* <View style={styles.headerView}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color={'black'} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headersText}>Customers</Text>
      </View> */}

      <View style={styles.filters}>
        <TouchableOpacity
          style={styles.filterBox}
          // onPress={() => openModal('sort')}
        >
          <Text style={styles.filterText}>Sort by</Text>
          <ChevronDownIcon size={14} color="#76B117" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: '2%',
          backgroundColor: '#F2F2F2',
          paddingVertical: '2%',
          borderRadius: 10,
          marginBottom: '4%',
          width: '92%',
          marginHorizontal: 'auto',
        }}>
        <View>
          <Text
            style={{
              color: '#2C3E50',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: 'Open Sans',
            }}>
            Name
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: '#2C3E50',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: 'Open Sans',
            }}>
            Order Details
          </Text>
        </View>
      </View>

      <FlatList
        data={customers}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.itemCardContainer}>
            <View style={styles.itemCard}>
              <View style={styles.nameAndTag}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.tagsContainer}>
                  {item.tags.map((tag, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.tag,
                        {backgroundColor: tagColors[tag] || '#ccc'},
                      ]}>
                      {tag}
                      <GenericVectorIcon
                        name={'cross'}
                        type={'Entypo'}
                        size={16}
                        color="#323232"
                      />
                    </Text>
                  ))}
                </View>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.orderTotalText}>{item.orderTotal}</Text>
                <Text style={styles.orderDateText}>{item.orderDate}</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Customer Details', {customer: item})
                  }
                  style={styles.viewSummaryTouchableOpacity}>
                  <Text style={styles.viewSummaryText}>View Summary</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerView: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  headersText: {
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Montserrat',
  },
  itemCardContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: '5%',
  },
  nameAndTag: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#76B117',
    fontFamily: 'Montserrat',
  },
  detailsContainer: {
    flexDirection: 'column',
  },
  orderTotalText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    paddingVertical: '2%',
    paddingBottom: '3%',
  },
  orderDateText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    paddingVertical: '3%',
    paddingBottom: '4%',
  },
  viewSummaryTouchableOpacity: {
    backgroundColor: '#76B117',
    height: 25,
    width: 100,
    borderRadius: 20,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    paddingVertical: '2%',
    marginTop: '4%',
  },
  viewSummaryText: {
    color: '#F8F9FE',
    fontSize: 12,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    fontWeight: 400,
    fontFamily: 'Open Sans',
  },
  tagsContainer: {
    flexDirection: 'column',
    marginTop: 10,
    borderRadius: 25,
  },
  tag: {
    color: '#323232',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },

  filters: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: '6%',
  },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECF0F1',
    paddingHorizontal: '4%',
    paddingVertical: '2%',
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Open Sans',
    color: '#2C3E50',
  },
});

export default Customers;
