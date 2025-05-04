import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
import {ChevronLeftIcon, StarIcon} from "react-native-heroicons/outline";

export default function ApprovedRequestMessage() {
  return(
    <View style={styles.container}>
      <View style = {styles.headerView}>
        <ChevronLeftIcon size={22} color={"black"} strokeWidth={2} />
        <Text style={styles.headerText}>
          Congratulations
        </Text>
      </View>
      <View style = {styles.contentView}>
        <StarIcon size={50} color={"green"} />
        <Text style = {styles.contentViewText1}>
          Successfully Sent
        </Text>
        <Text style={styles.contentViewText2}>
          Wait for some time and see
        </Text>
        <Text style={styles.contentViewText3}>
          the magic happen
        </Text>
      </View>
      <TouchableOpacity style = {styles.buttonView}>
        <Text style = {styles.buttonText}>
          Check Insights
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between"
  },
  headerView: {
    padding: 30,
    flexDirection: "row"
  },
  headerText: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10
  },
  contentView: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  contentViewText1: {
    color: "green",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 28
  },
  contentViewText2: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 16
  },
  contentViewText3: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 16
  },
  buttonView: {
    alignItems: "center",
    width: "90%",
    backgroundColor: "green",
    padding: 10,
    alignSelf: "center",
    borderRadius: 20,
    marginBottom: 20
  },
  buttonText: {
    color: "white",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 18
  },
})
