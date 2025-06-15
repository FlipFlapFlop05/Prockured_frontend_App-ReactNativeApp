import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronLeftIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
} from 'react-native-heroicons/outline';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const SpecificVendorOrderNow = ({route}) => {
  const {details} = route.params;

  const [selectedTab, setSelectedTab] = useState('supplier');
  const [selectedUnit, setSelectedUnit] = useState('carton');
  const [clientGST, setClientGST] = useState('');
  const [products, setProducts] = useState({my: [], supplier: []});
  const [loading, setLoading] = useState(true); // initial screen loader
  const [tabLoading, setTabLoading] = useState(false); // loader during tab switch

  const navigation = useNavigation();

  const updateCount = (tab, productId, delta) => {
    setProducts(prev => {
      const updated = {...prev};
      updated[tab] = updated[tab].map(product =>
        product.productId === productId
          ? {...product, count: Math.max(0, product.count + delta)}
          : product,
      );
      return updated;
    });
  };

  const renderProduct = ({item}) => (
    <View style={styles.productCard}>
      <Image
        source={
          typeof item.image === 'number'
            ? item.image
            : require('../Images/VendorProfileImage.png')
        }
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.prodName}</Text>
        <Text style={styles.productBrand}>{item.SupplierName}</Text>
        <Text style={styles.productWeight}>Unit: {item.prodUnit}</Text>
      </View>
      <View style={styles.productPricing}>
        <Text style={styles.productPrice}>₹ {item.myPrice}</Text>
      </View>
      <View style={styles.counter}>
        <TouchableOpacity
          onPress={() => updateCount(selectedTab, item.productId, -1)}
          style={styles.counterBtn}>
          <MinusIcon size={15} color="white" />
        </TouchableOpacity>

        <Text style={styles.counterText}>{item.count}</Text>

        <TouchableOpacity
          onPress={() => updateCount(selectedTab, item.productId, 1)}
          style={styles.counterBtn}>
          <PlusIcon size={15} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Get client GST once on mount
  useEffect(() => {
    const fetchClientGST = async () => {
      try {
        const gst = await AsyncStorage.getItem('clientGST');
        if (gst) setClientGST(gst);
      } catch (error) {
        console.log('Error reading client GST:', error);
      }
    };
    fetchClientGST();
  }, []);

  // Fetch catalogue
  const fetchCatalogue = async selected => {
    if (
      (selected === 'my' && !clientGST) ||
      (selected === 'supplier' && !details?.gstNumber)
    ) {
      Alert.alert('Missing GST', 'Could not find a valid GST number.');
      return;
    }

    console.log(details);

    const gstToUse = selected === 'my' ? clientGST : details?.gstNumber;

    try {
      if (products[selected].length === 0) setTabLoading(true); // show only if data isn't cached
      const res = await axios.get(
        `https://api-v7quhc5aza-uc.a.run.app/getCatalogue/${gstToUse}`,
      );
      const fetched = Object.values(res.data || []).map(p => ({
        ...p,
        count: 0,
        image: require('../Images/VendorProfileImage.png'),
      }));

      setProducts(prev => ({
        ...prev,
        [selected]: fetched,
      }));
    } catch (err) {
      console.log('Catalogue fetch failed:', err);
      Alert.alert('Error', 'Failed to load catalogue.');
    } finally {
      setLoading(false);
      setTabLoading(false);
    }
  };

  // Initial fetch for default tab
  useEffect(() => {
    fetchCatalogue(selectedTab);
  }, [clientGST]);

  // Refetch when tab changes
  const handleTabChange = tab => {
    setSelectedTab(tab);
    fetchCatalogue(tab);
  };

  const goToBasket = () => {
    const selectedProducts = products[selectedTab].filter(p => p.count > 0);

    if (selectedProducts.length === 0) {
      Alert.alert('No items', 'Please add at least one item to proceed.');
      return;
    }

    const cart = {};
    selectedProducts.forEach(product => {
      cart[product.productId] = product.count;
    });

    navigation.navigate('View Basket', {
      cart,
      data: selectedProducts,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={24} color="black" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Order Now</Text>
      </View>

      {/* Vendor Info */}
      <View style={styles.vendorBox}>
        <Image
          source={require('../Images/VendorProfileImage.png')}
          style={styles.vendorLogo}
        />
        <Text style={styles.vendorName}>{details.businessName}</Text>
        <Text style={styles.vendorLabel}>Vendor</Text>
        <TouchableOpacity style={styles.addProductBtn}>
          <Text style={styles.addProductText}>+ Add Products</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Options */}
      <View style={styles.tabWrapper}>
        <TouchableOpacity onPress={() => handleTabChange('my')}>
          <Text style={[styles.tab, selectedTab === 'my' && styles.activeTab]}>
            My Catalogue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTabChange('supplier')}>
          <Text
            style={[
              styles.tab,
              selectedTab === 'supplier' && styles.activeTab,
            ]}>
            Supplier’s Catalogue
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unit Switch */}
      <View style={styles.unitSwitch}>
        <TouchableOpacity
          onPress={() => setSelectedUnit('kg')}
          style={
            selectedUnit === 'kg' ? styles.unitBtnGreen : styles.unitBtnGray
          }>
          <Text
            style={
              selectedUnit === 'kg' ? styles.unitTextGreen : styles.unitTextGray
            }>
            Per Kg
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedUnit('carton')}
          style={
            selectedUnit === 'carton' ? styles.unitBtnGreen : styles.unitBtnGray
          }>
          <Text
            style={
              selectedUnit === 'carton'
                ? styles.unitTextGreen
                : styles.unitTextGray
            }>
            Per 10 kg Carton
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loader or Product List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#76B117"
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        />
      ) : tabLoading ? (
        <ActivityIndicator
          size="large"
          color="#76B117"
          style={{marginTop: 50}}
        />
      ) : (
        <FlatList
          data={products[selectedTab]}
          renderItem={renderProduct}
          keyExtractor={item => item?.productId?.toString()}
          contentContainerStyle={{paddingBottom: 100}}
        />
      )}

      {/* Basket Button */}
      <TouchableOpacity style={styles.basketBtn} onPress={goToBasket}>
        <Text style={styles.basketText}>View Basket</Text>
        <ShoppingCartIcon size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default SpecificVendorOrderNow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
  },
  vendorBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  vendorLogo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 30,
  },
  vendorName: {
    fontSize: 24,
    fontWeight: '700',
  },
  vendorLabel: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 10,
  },
  addProductBtn: {
    backgroundColor: '#76B117',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    width: '60%',
    alignItems: 'center',
  },
  addProductText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 17,
  },
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 20,
  },
  tab: {
    paddingVertical: 8,
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTab: {
    color: '#76B117',
    fontWeight: '700',
    borderBottomWidth: 2,
    borderColor: '#76B117',
  },
  unitSwitch: {
    flexDirection: 'row',
    marginVertical: 15,
    gap: 10,
  },
  unitBtnGray: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  unitBtnGreen: {
    backgroundColor: '#76B117',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  unitTextGray: {
    color: '#6B7280',
    fontWeight: '600',
  },
  unitTextGreen: {
    color: 'white',
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#76B117',
    fontWeight: '700',
  },
  productBrand: {
    fontSize: 12,
    color: '#6B7280',
  },
  productWeight: {
    fontSize: 12,
    color: '#6B7280',
  },
  productPricing: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontWeight: '700',
    fontSize: 14,
  },
  productDiscount: {
    fontSize: 10,
    color: '#76B117',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#76B117',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
  },
  counterBtn: {
    padding: 2,
  },
  counterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  basketBtn: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#76B117',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  basketText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
