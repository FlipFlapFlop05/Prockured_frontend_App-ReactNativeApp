import React, {useLayoutEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';

const OutletSummary = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {location, groupedItems, total} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: location,
      headerStyle: {
        backgroundColor: '#f8f9fe',
        elevation: 0,
        shadowColor: 'transparent',
        borderBottomWidth: 0,
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'Montserrat',
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <ChevronLeftIcon size={23} strokeWidth={2} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, location]);

  const renderItem = ({item}) => (
    <View style={styles.itemRow}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>₹ {item.price}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Order Summary</Text>

      {groupedItems.map((group, idx) => (
        <View key={idx} style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>{group.category}</Text>
            <Text style={styles.vendorName}>{group.vendor}</Text>
          </View>
          <FlatList
            data={group.items}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
          />
        </View>
      ))}

      <Text style={styles.total}>Order Total ₹ {total}</Text>
    </ScrollView>
  );
};

export default OutletSummary;
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    paddingHorizontal: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#65A30D',
    marginBottom: 16,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  groupTitle: {
    fontWeight: 'bold',
    color: '#16A34A',
  },
  vendorName: {
    fontWeight: 'bold',
    color: '#0E7490',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#111827',
    fontSize: 14,
  },
  total: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
});
