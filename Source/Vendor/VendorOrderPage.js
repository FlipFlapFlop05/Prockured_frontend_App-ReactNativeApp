import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, FlatList, Alert, Image } from 'react-native';
import { CheckCircleIcon, PencilIcon, XCircleIcon } from 'react-native-heroicons/outline';
import {CheckCircleIcon as CheckCircleIconSolid} from 'react-native-heroicons/solid';

const tabs = ['Pending Order', 'Confirmed Order', 'Past Order'];

export default function VendorOrderPage() {
  const [activeTab, setActiveTab] = useState('Pending Order');
  const [pendingOrders, setPendingOrders] = useState([
    { id: '1', name: "Jade's Cafe" },
    { id: '2', name: 'Bite & Co.' },
    { id: '3', name: 'Savor' },
    { id: '4', name: "Jade's " },
    { id: '5', name: 'NBC' },
    { id: '6', name: 'Jockey' },
    { id: '7', name: "Jade's Casse" },
    { id: '8', name: 'Bite dssad Co.' },
    { id: '9', name: 'Savior' },
  ]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAcceptPress = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const confirmAccept = () => {
    if (activeTab === 'Pending Order') {
      const updated = pendingOrders.filter(o => o.id !== selectedOrder.id);
      setPendingOrders(updated);
      setConfirmedOrders([...confirmedOrders, selectedOrder]);
      showToast(`Confirmed \n The order from ${selectedOrder.name} is confirmed`);
    } else if (activeTab === 'Confirmed Order') {
      const updated = confirmedOrders.filter(o => o.id !== selectedOrder.id);
      setConfirmedOrders(updated);
      setPastOrders([...pastOrders, { ...selectedOrder, delivered: true }]);
      showToast(`Order from ${selectedOrder.name} has been dispatched`);
    }
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const confirmRejection = () => {
    if (activeTab === 'Pending Order') {
      const updated = pendingOrders.filter(o => o.id !== selectedOrder.id);
      setPendingOrders(updated);
      showToast(`You have rejected the order from ${selectedOrder.name}`);
    }
    setModalVisible(false);
    setSelectedOrder(null);
  };


  const renderOrder = (order) => (
    <View>
      <View style={styles.orderItem}>
        <View style = {{flexDirection: 'row', gap: 10, alignItems: 'center', marginLeft: -20}}>
          <Image 
            source={require('../Images/VendorProfileImage.png')} // Placeholder image
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
          <View>
            <Text style={styles.vendorName}>{order.name}</Text>
            {activeTab === 'Pending Order' && (
              <TouchableOpacity style = {{backgroundColor: '#76B117', justifyContent: 'center', alignContent: 'center', alignItems: 'center', borderRadius: 10, height: 26, width: 100}}>
                <Text style ={{color: 'white'}}>
                  View Chat
                </Text>
              </TouchableOpacity>
            )}
            {activeTab === 'Confirmed Order' && (
              <Text style ={{color: '#FBBC05', fontWeight: '500', fontSize: 14}}>
                Confirmed
              </Text>
            )}
            {activeTab === 'Past Order' && (
              <Text style ={{color: '#FBBC05', fontWeight: '500', fontSize: 14}}>
                Completed
              </Text>
            )}
          </View>
        </View>
        
        {activeTab === 'Pending Order' && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleAcceptPress(order)}>
              <CheckCircleIcon size={36} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmRejection}>
              <XCircleIcon size={36} color="red" />
            </TouchableOpacity>
          </View>
        )}
        {activeTab === 'Confirmed Order' && (
          <View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAcceptPress(order)}>
              <Text style={styles.actionText}>Dispatch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        )}
        {activeTab === 'Past Order' && (
          <View>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Download Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {activeTab === 'Pending Order' && (
        <View style = {{borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 16, flexDirection: 'row', alignItems: 'center'}}>
          <PencilIcon size={26} color="#76B117" strokeWidth={3} />
          <TextInput 
            placeholder='Add a Comment'
            style = {{width: '90%'}}
          />
        </View>
      )}
      
    </View>
  );

  const getCurrentOrders = () => {
    if (activeTab === 'Pending Order') return pendingOrders;
    if (activeTab === 'Confirmed Order') return confirmedOrders;
    return pastOrders;
  };

  return (
    <View style={styles.container}>
      <View style = {{ alignItems: 'center', marginBottom: 16 }}>
        <Text style={styles.heading}>Order</Text>
      </View>
      <TextInput style={styles.search} placeholder="Search Vendor or Order ID..." />
      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tab, activeTab === tab && styles.activeTab]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getCurrentOrders()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderOrder(item)}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Do you want to <Text style = {{color: '#76B117'}}>{activeTab === 'Pending Order' ? 'accept' : 'dispatch'}</Text> the order from <Text style = {{color: '#76B117'}}>{selectedOrder?.name}?</Text>
            </Text>
            <View style = {{flexDirection: 'row', gap: 60}}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmAccept}>
                <CheckCircleIcon size={36} color="green" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <XCircleIcon size={36} color="red" />
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </Modal>

      {toast !== '' && <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 16 
  },
  heading: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginVertical: 8,
    alignContent: 'center',
    fontFamily: 'Montserrat'
  },
  search: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    padding: 10, 
    marginBottom: 16 
  },
  tabs: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 16 
  },
  tab: { 
    fontSize: 16, 
    padding: 8, 
    color: '#76B117',
    fontWeight: '500'
  },
  activeTab: { 
    color: 'green', 
    fontWeight: 'bold', 
    borderBottomWidth: 2, 
    borderColor: 'green' 
  },
  orderItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    padding: 16, 
    backgroundColor: '#f9f9f9', 
    borderRadius: 12, 
    marginVertical: 6 
  },
  vendorName: { fontSize: 16, 
    fontWeight: '500' 
  },
  actions: { 
    flexDirection: 'row', 
    gap: 12
  },
  accept: { 
    fontSize: 24, 
    color: 'green' 
  },
  reject: { 
    fontSize: 24, 
    color: 'red' 
  },
  actionButton: { 
    borderColor: '#76B117', 
    padding: 8, 
    borderRadius: 20 ,
    borderWidth: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  actionText: { 
    color: 'green', 
    fontWeight: '600' 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalBox: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  modalText: { 
    fontSize: 18, 
    marginBottom: 12, 
    textAlign: 'center',
    fontFamily: 'Montserrat',
    fontWeight: 'bold'
  },
  modalButton: {
     backgroundColor: '#eefcf1', 
     padding: 10, 
     borderRadius: 20 
    },
  modalButtonText: { 
    fontSize: 24, 
    color: 'green' 
  },
  toast: { 
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20, 
    backgroundColor: '#00ED51', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastText: { 
    color: 'white' ,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    fontSize: 16
  },
});