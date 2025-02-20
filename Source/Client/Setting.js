import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, Image, FlatList, TouchableOpacity} from 'react-native';
import {
  ChevronLeftIcon,
  UserIcon,
  DocumentChartBarIcon,
  UserCircleIcon,
  UserPlusIcon,
  BookOpenIcon,
  ArrowRightStartOnRectangleIcon
} from "react-native-heroicons/outline";
import Icon from "react-native-vector-icons/Feather";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";




export default function ClientSetting() {
  const navigation = useNavigation();
  const menuItems = [
    { id: 1, icon: "user", label: "Edit Profile Details", screen: "Client Profile" },
    { id: 2, icon: "briefcase", label: "Teams & Roles", screen: "Home Screen"},
    { id: 3, icon: "apple-keyboard-command", label: "Multiple Outlet Dashboard", screen: "Multiple Outlet Dashboard"},
    { id: 4, icon: "folder", label: "View Report", screen: "Report" },
    { id: 5, icon: "user-plus", label: "Invite Vendor", screen: "Home Screen" },
    { id: 6, icon: "folder", label: "Manage your catalogs", screen: "Catalogue" },
  ];
  return(
    <View style = {{flex: 1, display: 'flex'}}>
      {/* Header */}
      <View style = {{padding: 22, flexDirection: "row", alignContent: "center", alignSelf: "center", paddingTop: 30}}>
        <Text style = {{fontSize: 18, fontWeight: "bold", color: "black"}}>
          Setting
        </Text>
      </View>

      <View style = {{alignContent: "center", alignSelf: "center", flexDirection: "column"}}>
        <Image
          source={require("../Images/ProckuredImage.jpg")}
          style = {{width: 120, height: 120, borderRadius: 50}}
        />
        <Text style = {{fontWeight: "800", color: "black", fontSize: 32}}>
          Crunch
        </Text>
        <Text style = {{fontWeight: "500", color: "black", alignContent: "center", alignSelf: "center", fontSize: 18}}>
          Client
        </Text>
      </View>

      <FlatList
        data = {menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style = {{borderColor: "#ddd", flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: "15", borderRadius: 10, marginBottom: 10, borderWidth: 1}} onPress={() => navigation.navigate(item.screen)}>
            <Icon name = {item.icon} size = {20} color={"#333"} style = {{marginRight: 10, padding: 10}} />
            <Text>
              {item.label}
              {item.value && <Text style = {{color: item.valueColor, fontWeight: "bold"}}>{item.value}</Text>}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style = {{borderColor: "red", flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: "15", borderRadius: 10, marginBottom: 10, borderWidth: 1}}>
        <Icon name={"log-out"} size = {20} color = "red" style = {{marginRight: 10}} />
        <Text style={{color: "red", fontWeight: "bold"}}>Log Out</Text>
      </TouchableOpacity>
    </View>
  )
}
