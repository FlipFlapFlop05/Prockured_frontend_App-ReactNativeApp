import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image
} from 'react-native';
import {UserIcon} from "react-native-heroicons/outline";
import {useNavigation} from "@react-navigation/native";

const { width, height } = Dimensions.get('window');

export default function ChooseMode() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.chooseModeView}>
        <Text style={styles.chooseModeText}>
          Choose Mode
        </Text>
      </View>
      <View style={styles.clientModeView}>
        <Image
          source = {require("../Images/ClientSide.png")}
          style = {{
            height: width * 0.5,
            width: width * 0.8,
            borderRadius: 20
          }}
        />
        <TouchableOpacity style={styles.clientModeTouchableOpacity} onPress={() => navigation.navigate("Basic Client Profile")}>
          <Text style={styles.clientModeText}>
            Client Mode
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.vendorModeView}>
        <Image
          source = {require("../Images/More.jpg")}
          style = {{
            height: width * 0.5,
            width: width * 0.8,
            borderRadius: 20
          }}
        />
        <TouchableOpacity style={styles.vendorModeTouchableOpacity} onPress={() => navigation.navigate("Basic Vendor Profile")}>
          <Text style={styles.vendorModeText}>
            Vendor Mode
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: width * 0.10,
    alignSelf: "center",
    alignItems: "center", justifyContent: "center"
  },
  chooseModeView: {
    paddingVertical: height * 0.05,
  },
  chooseModeText: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: width * 0.07,
  },
  clientModeView: {
    alignItems: "center",
  },
  clientModeTouchableOpacity: {
    backgroundColor: "green",
    width: width * 0.8,
    height: height * 0.07,
    marginTop: height * 0.03,
    borderRadius: 10,
    justifyContent: "center",
  },
  clientModeText: {
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontSize: width * 0.045,
  },
  vendorModeView: {
    alignItems: "center",
    paddingVertical: height * 0.05,
  },
  vendorModeTouchableOpacity: {
    backgroundColor: "green",
    width: width * 0.8,
    height: height * 0.07,
    marginTop: height * 0.03,
    borderRadius: 10,
    justifyContent: "center",
  },
  vendorModeText: {
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    fontSize: width * 0.045,
  },
});
