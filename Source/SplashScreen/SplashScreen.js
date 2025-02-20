import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {useNavigation} from "@react-navigation/native";

export default function SplashScreen(){
  const navigation = useNavigation();
  useEffect(() => {
    setTimeout(() => navigation.navigate('Authentication', {screen: 'CreateAnAccount'}), 2500);
  }, []);
  return (
    <View style = {{display: 'flex', flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Image
        source={require('../Images/ProckuredImage.jpg')}
        style = {{width: 200, height: 200, backgroundColor: "white"}}
      />
    </View>
  );
};

const styles = StyleSheet.create({

});
