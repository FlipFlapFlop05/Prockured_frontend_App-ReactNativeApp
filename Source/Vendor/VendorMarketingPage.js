import React, {useLayoutEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {ChevronLeftIcon, UserIcon} from "react-native-heroicons/outline";
import {useNavigation} from '@react-navigation/native';

export default function VendorMarketingPage() {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Marketing',
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
  return(
    <View style = {styles.container}>
      <View style = {styles.clientModeView}>
        <Image
          source={require('../Images/MoreImage.png')}
          style = {{width: 350, height: 230}}
        />
        <TouchableOpacity style = {styles.clientModeTouchableOpacity} onPress={() => navigation.navigate('New Campaign')}>
          <Text style = {styles.clientModeText}>
            Start a Campaign
          </Text>
        </TouchableOpacity>
      </View>
      <View style = {styles.vendorModeView}>
        <Image
          source={require('../Images/More.jpg')}
          style={{width: 350, height: 230}}
        />
        <TouchableOpacity style = {styles.vendorModeTouchableOpacity} onPress={() => navigation.navigate('Vendor Existing Presets')}>
          <Text style = {styles.vendorModeText}>
            Use Existing Code
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: 'white'
  },
  chooseModeView: {
    padding: 30
  },
  chooseModeText: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 28
  },
  clientModeView: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 20,
    height: 280,
    marginTop: -10
  },
  clientModeTouchableOpacity: {
    backgroundColor: "green",
    width: 300,
    height: 50,
    marginTop: 10,
    borderRadius: 10
  },
  clientModeText: {
    fontStyle: "normal",
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 10,
    fontSize: 18
  },
  vendorModeView: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-between",
    padding: 80,
    borderRadius: 40,
    height: 260,
    marginTop: 10,
    backgroundColor: "white",
    width: 300,
  },
  vendorModeTouchableOpacity: {
    backgroundColor: "green",
    width: 300,
    height: 50,
    marginTop: 10,
    borderRadius: 10
  },
  vendorModeText: {
    fontStyle: "normal",
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 10,
    fontSize: 18
  },
})
