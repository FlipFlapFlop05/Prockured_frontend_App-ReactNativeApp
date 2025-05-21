import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  HomeIcon as OutlineHomeIcon,
  Cog6ToothIcon as OutlineCog6ToothIcon,
  ShoppingBagIcon as OutlineShoppingBagIcon,
  BookOpenIcon as OutlineBookOpenIcon,
  ChatBubbleOvalLeftEllipsisIcon as ChatIcon,
  ShoppingCartIcon as CartIcon,
  ChartBarIcon as MarketingIcon,
} from 'react-native-heroicons/outline';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Authentication Screens
import AppleLoadingPage from '../Authentication/AppleLoadingPage';
import ChooseMode from '../Authentication/ChooseMode';
import CreateAnAccount from '../Authentication/CreateAnAccount';
import FacebookLoadingPage from '../Authentication/FacebookLoadingPage';
import ForgotPassword from '../Authentication/ForgotPassword';
import GoogleLoadingPage from '../Authentication/GoogleLoadingPage';
import LogIn from '../Authentication/LogIn';

// Vendor Screens
import VendorChatScreen from '../Vendor/VendorChatScreen';
import VendorOrderPage from '../Vendor/VendorOrderPage';
import VendorMarketingPage from '../Vendor/VendorMarketingPage';
import VendorCatalogue from '../Vendor/VendorCatalogue';
import VendorSetting from '../Vendor/VendorSetting';
import BasicVendorProfile from '../Vendor/BasicVendorProfile';
import CustomerDetails from '../Vendor/CustomerDetails';
import Customers from '../Vendor/Customers';
import VendorExistingPresets from '../Vendor/VendorExistingPresets';
import PresetEdits from '../Vendor/PresetEdits';
import NewCampaign from '../Vendor/NewCampaign';
import ApprovedRequestMessage from '../Vendor/ApprovedRequestMessage';
import SupplierFAQ from '../Vendor/FAQ';
import SupplierNotificationAndSearch from '../Vendor/NotificationAndSearch';
import VendorAddProduct from '../Vendor/VendorAddProduct';
import VendorChatSupport from '../Vendor/VendorChatSupport';

// Client Screens
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
import SplashScreen from '../SplashScreen/SplashScreen';
import Basket from '../Client/Basket';
import ApprovalPending from '../Client/ApprovalPending';
import ChatWithSupplier from '../Client/ChatWithSupplier';
import CategoriesBasket from '../Client/CategoriesBasket';
import ChatSupport from '../Client/ChatSupport';
import SpecificOrderScreen from '../Client/SpecificOrderScreen';
import SpecificVendorOrderNow from '../Client/SpecificVendorOrderNow';
import OrderTracking from '../Client/OrderTracking';
import LinkProduct from '../Client/LinkProduct';
import NotificationAndSearch from '../Client/NotificationAndSearch';
import ClientFAQ from '../Client/FAQ';
import VendorProfile from '../Vendor/VendorProfile';
import OutletDashboard from '../Client/OutletDashboard';
import OutletSummary from '../Client/OutletSummary';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigation = () => {
  const MainApp = () => {
    return (
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: 'black',
          tabBarLabelStyle: {fontSize: 12, fontWeight: 'bold'},
          tabBarIcon: ({color, size}) => {
            let IconComponent;

            if (route.name === 'Home') {
              IconComponent = OutlineHomeIcon;
            } else if (route.name === 'Orders') {
              IconComponent = OutlineShoppingBagIcon;
            } else if (route.name === 'Catalogue') {
              IconComponent = OutlineBookOpenIcon; // Or a more appropriate icon
            } else if (route.name === 'Setting') {
              IconComponent = OutlineCog6ToothIcon;
            }

            return <IconComponent size={size} color={color} />;
          },
        })}>
        <Tab.Screen
          name={'Home'}
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Tab.Screen
          name={'Orders'}
          component={Orders}
          options={{headerShown: false}}
        />
        <Tab.Screen
          name={'Catalogue'}
          component={Catalogue}
          options={{headerShown: false}}
        />
        <Tab.Screen name={'Setting'} component={ClientSetting} />
      </Tab.Navigator>
    );
  };
  const VendorMainApp = () => {
    return (
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: 'black',
          tabBarLabelStyle: {fontSize: 12, fontWeight: 'bold'},
          tabBarIcon: ({color, size}) => {
            let IconComponent;
            if (route.name === 'Chat') {
              IconComponent = ChatIcon;
            } else if (route.name === 'Order') {
              IconComponent = CartIcon;
            } else if (route.name === 'Marketing') {
              IconComponent = MarketingIcon;
            } else if (route.name === 'Catalogue') {
              IconComponent = OutlineBookOpenIcon;
            } else if (route.name === 'Setting') {
              IconComponent = OutlineCog6ToothIcon;
            }
            return <IconComponent size={size} color={color} />;
          },
        })}>
        <Tab.Screen
          name={'Chat'}
          component={VendorChatScreen}
          options={{headerShown: false}}
        />
        <Tab.Screen
          name={'Order'}
          component={VendorOrderPage}
          options={{headerShown: false}}
        />
        <Tab.Screen
          name={'Marketing'}
          component={VendorMarketingPage}
          options={{headerShown: false}}
        />
        <Tab.Screen
          name={'Catalogue'}
          component={VendorCatalogue}
          options={{headerShown: false}}
        />
        <Tab.Screen
          name={'Setting'}
          component={VendorSetting}
          options={{headerShown: false}}
        />
      </Tab.Navigator>
    );
  };
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={'Splash Screen'}
        screenOptions={{headerShown: false}}>
        {/*Splash Screen*/}
        <Stack.Screen name={'Splash Screen'} component={SplashScreen} />
        {/*Authentication Screen*/}
        <Stack.Screen name={'Authentication'} component={AuthenticationStack} />
        {/*Client Main Screens*/}
        <Stack.Screen name={'Main'} component={MainApp} />
        {/*Vendor Main Screen*/}
        <Stack.Screen name={'Vendor App'} component={VendorMainApp} />
        {/*Client Stack*/}
        <Stack.Screen
          name={'Home'}
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name={'Add Supplier'} component={AddSupplier} />
        <Stack.Screen name={'Search Bar'} component={SearchBar} />
        <Stack.Screen
          name={'Basic Client Profile'}
          component={BasicClientProfile}
        />
        <Stack.Screen name={'Add Product'} component={AddProduct} />
        <Stack.Screen name={'View Categories'} component={ViewCategories} />
        <Stack.Screen name={'Client Profile'} component={ClientProfile} />
        <Stack.Screen
          name={'Multiple Outlet Dashboard'}
          component={MultipleOutletDashboard}
        />
        <Stack.Screen name={'Report'} component={Report} />
        <Stack.Screen name={'Add Outlet'} component={AddOutlet} />
        <Stack.Screen
          name={'Add Product Manually'}
          component={AddProductManually}
        />
        <Stack.Screen name={'View Basket'} component={Basket} />
        <Stack.Screen name={'Approval Pending'} component={ApprovalPending} />
        <Stack.Screen name={'Client FAQ'} component={ClientFAQ} />
        <Stack.Screen
          name={'Notification And Search'}
          component={NotificationAndSearch}
        />
        <Stack.Screen name={'Categories Basket'} component={CategoriesBasket} />
        <Stack.Screen
          name={'Chat With Supplier'}
          component={ChatWithSupplier}
        />
        <Stack.Screen name={'Chat Support'} component={ChatSupport} />
        <Stack.Screen name={'Order Tracking'} component={OrderTracking} />
        <Stack.Screen name={'Link Product'} component={LinkProduct} />
        <Stack.Screen name={'Client Report'} component={Report} />
        <Stack.Screen
          name={'Specific Order Screen'}
          component={SpecificOrderScreen}
        />
        <Stack.Screen
          name={'Specific Vendor Order Now'}
          component={SpecificVendorOrderNow}
        />
        <Stack.Screen name={'Outlet Dashboard'} component={OutletDashboard} />
        <Stack.Screen name={'OutletSummary'} component={OutletSummary} />
        {/*Vendor Stack*/}
        <Stack.Screen
          name={'Basic Vendor Profile'}
          component={BasicVendorProfile}
        />
        <Stack.Screen name={'Customer Details'} component={CustomerDetails} />
        <Stack.Screen name={'Customers'} component={Customers} />
        <Stack.Screen
          name={'Vendor Existing Presets'}
          component={VendorExistingPresets}
        />
        <Stack.Screen name={'Vendor FAQ'} component={SupplierFAQ} />
        <Stack.Screen
          name={'Supplier Notification And Search'}
          component={SupplierNotificationAndSearch}
        />
        <Stack.Screen
          name={'Vendor Add Product'}
          component={VendorAddProduct}
        />
        <Stack.Screen name={'Edit Preset'} component={PresetEdits} />
        <Stack.Screen name={'New Campaign'} component={NewCampaign} />
        <Stack.Screen
          name={'Approved Request Message'}
          component={ApprovedRequestMessage}
        />
        <Stack.Screen
          name={'Vendor Chat Support'}
          component={VendorChatSupport}
        />
        <Stack.Screen name={'Catalogue'} component={VendorCatalogue} />
        <Stack.Screen name={'Vendor Profile'} component={VendorProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AuthenticationStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={'ChooseMode'} component={ChooseMode} />
      <Stack.Screen name={'LogIn'} component={LogIn} />
      <Stack.Screen name={'CreateAnAccount'} component={CreateAnAccount} />
      <Stack.Screen name={'ForgotPassword'} component={ForgotPassword} />
      <Stack.Screen name={'AppleLoadingPage'} component={AppleLoadingPage} />
      <Stack.Screen
        name={'FacebookLoadingPage'}
        component={FacebookLoadingPage}
      />
      <Stack.Screen name={'GoogleLoadingPage'} component={GoogleLoadingPage} />
    </Stack.Navigator>
  );
};

export default AppNavigation;
