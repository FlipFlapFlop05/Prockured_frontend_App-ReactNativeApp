import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('window');
const vendorsData = [
  {
    id: '1',
    name: 'DM Agro Care',
    category: 'Fruits & Vegetables',
    location: 'Jaipur',
    image: require('./Images/ClientSettingImage.png'), 
  },
  {
    id: '2',
    name: 'Frugreen',
    category: 'Fruits & Vegetables',
    location: 'Jaipur',
    image: require('./Images/VendorProfileImage.png'),
  },
  {
    id: '3',
    name: 'Nirvana Suppliers',
    category: 'Poultry',
    location: 'Jaipur',
    image: require('./Images/ClientSettingImage.png'),
  },
  {
    id: '4',
    name: 'Suparna’s Farm',
    category: 'Poultry',
    location: 'Jaipur',
    image: require('./Images/VendorProfileImage.png'),
  },
  {
    id: '5',
    name: 'Coastal Catch',
    category: 'Meat and Fish',
    location: 'Jaipur',
    image: require('./Images/ClientSettingImage.png'),
  },
];

const VendorScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedVendors, setSelectedVendors] = useState([]);

  const toggleSelection = id => {
    if (selectedVendors.includes(id)) {
      setSelectedVendors(prev => prev.filter(item => item !== id));
    } else {
      setSelectedVendors(prev => [...prev, id]);
    }
  };

  const filteredVendors = vendorsData.filter(vendor =>
    vendor.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => console.log('Back pressed')}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <View style={styles.searchBox}>
            <Ionicons
              name="search"
              size={20}
              color="#000"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Vendor.."
              placeholderTextColor="#000"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </View>

      {/* Vendor List */}
      <View style={styles.ventorContainer}>
        <FlatList
          data={filteredVendors}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingHorizontal: 16}}
          renderItem={({item}) => {
            const isSelected = selectedVendors.includes(item.id);
            return (
              <View style={styles.vendorItem}>
                <Image source={item.image} style={styles.vendorImage} />
                <View style={styles.vendorDetails}>
                  <Text style={styles.vendorName}>{item.name}</Text>
                  <Text style={styles.vendorCategory}>{item.category}</Text>
                  <Text style={styles.vendorLocation}>{item.location}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleSelection(item.id)}>
                  <View style={styles.addBtn}>
                    <Text
                      style={[
                        styles.addIcon,
                        {color: isSelected ? '#D32F2F' : '#4CAF50'},
                      ]}>
                      {isSelected ? '−' : '+'}
                    </Text>
                    <Text
                      style={[
                        styles.addText,
                        {color: isSelected ? '#D32F2F' : '#4CAF50'},
                      ]}>
                      {isSelected ? 'Remove\nreview' : 'Add for\nreview'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.itemsSelected}>
          Items Selected ({selectedVendors.length})
        </Text>
        <TouchableOpacity style={styles.reviewBtn}>
          <Text style={styles.reviewBtnText}>Send for Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VendorScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fe'},
  backButton: {
    marginRight: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,

  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginLeft: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 0,
  },
  ventorContainer: {
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor:"#fff",
    marginVertical:8
  },
  vendorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  vendorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  vendorDetails: {flex: 1},
  vendorName: {
    fontWeight: 'bold',
    color: '#4CAF50',
    fontSize: 16,
  },
  vendorCategory: {
    fontSize: 13,
    color: '#555',
  },
  vendorLocation: {
    fontSize: 12,
    color: '#777',
  },
  addBtn: {
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  footer: {
    padding: 16,
    backgroundColor: '#f8f9fe',
    marginTop:30

  },
  itemsSelected: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 13,
    fontSize: 16
  },
  reviewBtn: {
    backgroundColor: '#7BC043',
    borderRadius: 4,
    paddingVertical: 17,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
