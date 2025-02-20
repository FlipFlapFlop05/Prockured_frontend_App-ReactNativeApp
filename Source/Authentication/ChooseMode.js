import React from "react";
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import {UserIcon} from "react-native-heroicons/outline";
import {useNavigation} from "@react-navigation/native";


export default function ChooseMode() {
  const navigation = useNavigation();
  return (
    <View style = {styles.container}>
      <View style = {styles.chooseModeView}>
        <Text style={styles.chooseModeText}>
          Choose Mode
        </Text>
      </View>
      <View style = {styles.clientModeView}>
        <UserIcon size={100} color={"black"} strokeWidth={3} />
        <TouchableOpacity style = {styles.clientModeTouchableOpacity} onPress={() => navigation.navigate("Basic Client Profile")}>
          <Text style = {styles.clientModeText}>
            Client Mode
          </Text>
        </TouchableOpacity>
      </View>
      <View style = {styles.vendorModeView}>
        <UserIcon size={100} color={"black"} strokeWidth={3} />
        <TouchableOpacity style = {styles.vendorModeTouchableOpacity}>
          <Text style = {styles.vendorModeText}>
            Vendor Mode
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
    flexDirection: "column"
  },
  chooseModeView: {
    padding: 100
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
    justifyContent: "space-between"
  },
  clientModeTouchableOpacity: {
    backgroundColor: "green",
    width: 300,
    height: 50,
    marginTop: 30,
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
    padding: 80
  },
  vendorModeTouchableOpacity: {
    backgroundColor: "green",
    width: 300,
    height: 50,
    marginTop: 30,
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
