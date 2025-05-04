import React, {useState} from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {customers} from '../Constant/constant';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import {tagColors} from '../Constant/constant';

const Customers = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color={'black'} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headersText}>
          Customers
        </Text>
      </View>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCardContainer}>
            <View style={styles.itemCard}>
              <View style={styles.nameAndTag}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.tagsContainer}>
                  {item.tags.map((tag, index) => (
                    <Text key={index} style={[styles.tag, { backgroundColor: tagColors[tag] || "#ccc" }]}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.orderTotalText}>{item.orderTotal}</Text>
                <Text style={styles.orderDateText}>{item.orderDate}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Customer Details', { customer: item })} style={styles.viewSummaryTouchableOpacity}>
                  <Text style={styles.viewSummaryText}>
                    View Summary
                  </Text>
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
    padding: 20
  },
  headerView: {
    flexDirection: "row",
    marginBottom: 20
  },
  headersText: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "Montserrat"
  },
  itemCardContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  nameAndTag: {
    flexDirection: "column"
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  detailsContainer: {
    flexDirection: "column"
  },
  orderTotalText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat"
  },
  orderDateText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Montserrat"
  },
  viewSummaryTouchableOpacity: {
    backgroundColor: "#76B117",
    height: 25,
    width: 100,
    borderRadius: 20,
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center"
  },
  viewSummaryText: {
    color: 'white',
    fontSize: 12,
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontFamily: "Montserrat"
  },
  tagsContainer: {
    flexDirection: "column",
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
    alignSelf: "flex-start"
  }
});

export default Customers;
