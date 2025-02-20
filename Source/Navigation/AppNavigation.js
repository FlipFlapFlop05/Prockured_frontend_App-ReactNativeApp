import React, { useState, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  HomeIcon as OutlineHomeIcon,
  Cog6ToothIcon as OutlineCog6ToothIcon,
  ShoppingBagIcon as OutlineShoppingBagIcon,
  BookOpenIcon as OutlineBookOpenIcon,
} from "react-native-heroicons/outline";
import {
  HomeIcon as SolidHomeIcon,
  Cog6ToothIcon as SolidCog6ToothIcon,
  ShoppingBagIcon as SolidShoppingBagIcon,
  BookOpenIcon as SolidBookOpenIcon,
} from "react-native-heroicons/solid";
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Authentication Screens
import HomeScreen from '../Client/HomeScreen';
import AddOutlet from '../Client/AddOutlet';
import AddProduct from '../Client/AddProduct';
import AddProductManually from '../Client/AddProductManually';
import AddSupplier from '../Client/AddSupplier';
import BasicClientProfile from '../Client/BasicClientProfile';
import Catalogue from '../Client/Catalogue';
import ClientProfile from '../Client/ClientProfile';
import MultipleOutletDashboard from '../Client/MultipleOutletDashboad';
import Orders from '../Client/Orders';
import Report from '../Client/Report';
import SearchBar from '../Client/SearchBar';
import ClientSetting from '../Client/Setting';
import ViewCategories from '../Client/ViewCategories';
import AppleLoadingPage from '../Authentication/AppleLoadingPage';
import ChooseMode from '../Authentication/ChooseMode';
import CreateAnAccount from '../Authentication/CreateAnAccount';
import FacebookLoadingPage from '../Authentication/FacebookLoadingPage';
import ForgotPassword from '../Authentication/ForgotPassword';
import GoogleLoadingPage from '../Authentication/GoogleLoadingPage';
import LogIn from '../Authentication/LogIn';
import SplashScreen from '../SplashScreen/SplashScreen';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigation = () => {
  const MainApp = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "green",
          tabBarInactiveTintColor: "black",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
          tabBarIcon: ({color, size }) => {
            let IconComponent;

            if (route.name === 'Home Screen') {
              IconComponent = OutlineHomeIcon;
            } else if (route.name === 'Orders') {
              IconComponent = OutlineShoppingBagIcon;
            } else if (route.name === 'Catalogue') {
              IconComponent = OutlineBookOpenIcon ; // Or a more appropriate icon
            } else if (route.name === 'Setting') {
              IconComponent = OutlineCog6ToothIcon;
            }

            return <IconComponent size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home Screen" component={HomeScreen} options={{headerShown: false}}  />
        <Tab.Screen name="Orders" component={Orders} options={{headerShown: false}} />
        <Tab.Screen name="Catalogue" component={Catalogue} options={{headerShown: false}} />
        <Tab.Screen name="Setting" component={ClientSetting} options={{headerShown: false}} />
      </Tab.Navigator>
    );
  };
  return(
    <NavigationContainer>
      <Stack.Navigator initialRouteName={"Splash Screen"} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={"Splash Screen"} component={SplashScreen} />
        <Stack.Screen name={"Authentication"} component={AuthenticationStack} />
        <Stack.Screen name={"Main"} component={MainApp} />
        <Stack.Screen name={"Add Supplier"} component={AddSupplier} />
        <Stack.Screen name={"Search Bar"} component={SearchBar} />
        <Stack.Screen name={"Basic Client Profile"} component={BasicClientProfile} />
        <Stack.Screen name={"Add Product"} component={AddProduct} />
        <Stack.Screen name={"View Categories"} component={ViewCategories}/>
        <Stack.Screen name={"Client Profile"} component={ClientProfile} />
        <Stack.Screen name={"Multiple Outlet Dashboard"} component={MultipleOutletDashboard} />
        <Stack.Screen name={"Report"} component={Report} />
        <Stack.Screen name={"Add Outlet"} component={AddOutlet} />
        <Stack.Screen name={"Add Product Manually"} component={AddProductManually} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AuthenticationStack = () => {
  return(
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChooseMode" component={ChooseMode} />
      <Stack.Screen name="LogIn" component={LogIn} />
      <Stack.Screen name="CreateAnAccount" component={CreateAnAccount} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="AppleLoadingPage" component={AppleLoadingPage} />
      <Stack.Screen name="FacebookLoadingPage" component={FacebookLoadingPage} />
      <Stack.Screen name="GoogleLoadingPage" component={GoogleLoadingPage} />
      {/* ... other authentication screens ... */}
    </Stack.Navigator>
  );
};


export default AppNavigation;
