import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import {
  ChevronLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ChatBubbleBottomCenterIcon,
} from 'react-native-heroicons/outline';
import {BellIcon} from 'react-native-heroicons/solid';
import {useNavigation} from '@react-navigation/native';
import {categories, worksData} from '../Constant/constant';

const {width, height} = Dimensions.get('window');

export default function NotificationAndSearch() {
  const navigation = useNavigation();
  const [isWorkDataVisible, setWorkDataVisible] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);

  const options = [
    {
      id: 1,
      title: 'Chat Support',
      icon: ChatBubbleOvalLeftEllipsisIcon,
      screen: 'Chat Support',
    },
    {
      id: 2,
      title: 'Find new item',
      icon: MagnifyingGlassIcon,
      modal: 'categoryModal',
    },
    {
      id: 3,
      title: 'Support History',
      icon: ClockIcon,
      screen: 'Chat Support',
    },
    {
      id: 4,
      title: 'FAQs & SOP',
      icon: ChatBubbleBottomCenterIcon,
      screen: 'Client FAQ',
    },
  ];

  const handleOptionPress = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.modal === 'categoryModal') {
      setCategoryModal(true);
    }
  };

  const renderWorkItemModal = ({item}) => (
    <View
      style={{
        flexDirection: 'column',
        height: width * 0.45,
        alignItems: 'center',
      }}>
      <Image
        source={item.image}
        style={{width: width * 0.4, height: width * 0.3}}
      />
      <Text style={styles.workTitle}>{item.title}</Text>
      <Text style={styles.workDescription}>{item.description}</Text>
    </View>
  );

  const renderCategoryItemModal = ({item}) => (
    <TouchableOpacity
      style={styles.categoryItemModal}
      onPress={() => {
        setCategoryModal(false);
        navigation.navigate('View Categories', {...item});
      }}>
      <Image source={{uri: item.image}} style={styles.categoryImage} />
      <Text
        style={styles.categoryText}
        numberOfLines={2}
        ellipsizeMode={'tail'}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={25} color="black" strokeWidth={3} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setWorkDataVisible(true)}>
          <BellIcon size={25} color={'black'} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isWorkDataVisible}
        onRequestClose={() => setWorkDataVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={worksData}
              renderItem={renderWorkItemModal}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.flatListContent}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setWorkDataVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModal}
        onRequestClose={() => setCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {width: '90%'}]}>
            <FlatList
              data={categories}
              numColumns={3}
              renderItem={renderCategoryItemModal}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.flatListContent}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setCategoryModal(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hey{'\t'}
          <Text style={styles.name}>Crunch!</Text>
        </Text>
        <Text style={styles.subtitle}>How can we help?</Text>
      </View>
      <FlatList
        data={options}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleOptionPress(item)}>
            <item.icon size={24} color="#333" />
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
    padding: 5,
    paddingTop: 30,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  name: {
    color: '#85C100',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  workTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 7,
  },
  workDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  flatListContent: {
    paddingHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#76B117',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryItemModal: {
    width: width * 0.25,
    alignItems: 'center',
    margin: 10,
  },
  categoryImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
});
