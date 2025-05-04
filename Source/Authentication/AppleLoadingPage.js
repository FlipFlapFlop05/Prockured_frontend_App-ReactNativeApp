import React, {useEffect, useRef, useState} from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions, Image, Animated } from 'react-native';
import {useNavigation} from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const AppleLoadingPage = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      navigation.navigate('Authentication', {screen: 'ChooseMode'});
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -10,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [translateY]);

  return (
    <View style={styles.container}>
      <View style={styles.logoView}>
        <Image
          source = {require('../Images/ProckuredImage.jpg')}
          style = {styles.logoImage}
        />
      </View>
      <View style={styles.otherContainer}>
        <View style={styles.loaderContainer}>
          {[...Array(4)].map((_, index) => (
            <Animated.View key={index} style={[styles.loaderDot, { transform: [{ translateY }] }]} />
          ))}
        </View>

        <Text style={styles.text}>Signing In with</Text>
        <Image source={require('../Images/AppleImage.png')} style={styles.image} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  loaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.3,
    marginTop: height * 0.3
  },
  loaderDot: {
    width: 10,
    height: 10,
    backgroundColor: '#76B117',
    borderRadius: 5,
  },
  text: {
    color: 'gray',
    marginTop: height * 0.05,
    fontSize: width * 0.045,
  },
  image: {
    width: 35,
    height: 35,
    marginTop: 20,
  },
  logoImage: {
    width: 200,
    height: 200,
    marginTop: 20
  },
  logoView: {
    marginTop: height * 0.2
  },
  otherContainer: {
    flexDirection: "column",
    alignSelf: "center",
    alignItems: "center"
  },
});

export default AppleLoadingPage;
