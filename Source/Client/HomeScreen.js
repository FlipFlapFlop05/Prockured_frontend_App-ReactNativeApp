import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  Modal,
  Pressable
} from "react-native";
import { BellIcon } from "react-native-heroicons/solid";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from "react-native-heroicons/outline";
import {categories} from '../Constant/constant';
import {Vegetable_Categories} from '../Constant/constant';
import {worksData} from "../Constant/constant";
import {useNavigation} from "@react-navigation/native";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [isChatModalVisible, setChatModalVisible] = useState(false);

  const navigation = useNavigation();

  return (
    <ScrollView>
      <View style = {{flex: 1}}>
        <View style={{ flexDirection: "row", paddingTop: 30, justifyContent: "space-between", paddingHorizontal: 20 }}>
          <Image
            source={require("../Images/ProckuredImage.jpg")}
            style={{ width: 70, height: 70, borderRadius: 60 }}
          />
          <View style={{ flexDirection: "row" }}>
            <BellIcon size={30} color={"black"} strokeWidth={2} />
            <QuestionMarkCircleIcon size={30} color={"black"} strokeWidth={2} />
          </View>
        </View>
        <TouchableOpacity style={{ backgroundColor: "lightgray", width: "90%", alignSelf: "center", borderRadius: 10, flexDirection: "row", alignItems: "center", marginVertical: 20, padding: 10 }} onPress={() => navigation.navigate("Search Bar")}>
          <MagnifyingGlassIcon size={20} color={"black"} strokeWidth={3} style={{ marginLeft: 10 }} />
          <Text style={{ marginLeft: 10, flex: 1 }} > Search any Product </Text>
        </TouchableOpacity>

        <View style={{ paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>
            All Categories
          </Text>
          <ChevronDownIcon size={20} color={"black"} strokeWidth={3} />
        </View>

        <FlatList
          data={categories}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity style={{
              flex: 1,
              margin: 5,
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
              height: 100,
              width: (width - 40) / 3,
            }}
                              onPress={() => navigation.navigate("View Categories", {...item})}
            >
              <Image
                source={{ uri: item.image }}
                style={{ width: 50, height: 50 }}
              />
              <Text style={{
                fontSize: 14,
                fontWeight: "bold",
                textAlign: "center",
                flexWrap: "wrap",
                width: 80
              }} numberOfLines={2} ellipsizeMode={"tail"}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />

        <View style={{ paddingHorizontal: 20, paddingTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>
            How it works?
          </Text>
          <ChevronDownIcon size={20} color={"black"} strokeWidth={3} />
        </View>


        <FlatList
          data={worksData}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={{
              width: (width - 40) / 2,
              height: 200,
              margin: 10,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 10,
            }}>
              <Image
                source={{ uri: item.image }}
                style={{ width: 100, height: 100, marginTop: 20 }}
              />
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "black", marginTop: 10 }}>{item.title}</Text>
              <Text style={{ fontSize: 16, fontWeight: "500", color: "black", textAlign: "center", paddingHorizontal: 10, marginTop: 5 }}>{item.description}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />

        <View style={{
          position: 'absolute',
          bottom: 200,
          right: 20,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}>
          <TouchableOpacity onPress={() => setChatModalVisible(true)}>
            <View style={{ backgroundColor: 'green', padding: 10, borderRadius: 5, height: 50, width: 50, justifyContent:"center", alignItems:"center" }}>{/*Make width 50*/}
              <ChatBubbleOvalLeftEllipsisIcon size={40} color={"white"} strokeWidth={1} />
            </View>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isChatModalVisible}
          onRequestClose={() => {
            setChatModalVisible(!isChatModalVisible);
          }}
        >
          <View style={{flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22}}>
            <View style={{width: 300, height: 500, margin: 20, backgroundColor: "white", borderRadius: 20, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5}}>
              <Text style={{marginBottom: 15, textAlign: "center", fontSize: 20, fontWeight: "bold"}}>All Chats</Text>
              <Text>Your chat is empty</Text>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setChatModalVisible(!isChatModalVisible)}
              >
                <Text style={{color: "white", fontWeight: "bold", textAlign: "center"}}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF"
  },
  buttonClose: {
    backgroundColor: "#2196F3"
  }
});

export default HomeScreen;
