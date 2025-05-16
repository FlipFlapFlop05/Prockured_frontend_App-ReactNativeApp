import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { ChevronLeftIcon, PencilIcon} from 'react-native-heroicons/outline';
import { BellIcon} from 'react-native-heroicons/solid';

const { width: screenWidth } = Dimensions.get('window');

const SpecificOrderScreen = () => {
    const navigation = useNavigation();
    const orderData = {
        vendor: 'Frugreen',
        customerName: 'Mr. Karan Rao',
        customerPhone: '+91 9876543210',
        deliveryDate: '24 June 2024',
        orderDate: 'Fri 21 June',
        items: [
            { name: 'Potatoes', quantity: '50 Pounds' },
            { name: 'Carrots', quantity: '30 Pounds' },
            { name: 'Onions', quantity: '20 Pounds' },
            { name: 'Tomatoes', quantity: '15 Pounds' },
        ],
        totalItems: '04',
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeftIcon size={22} color={'black'} strokeWidth={3} />
                </TouchableOpacity>
                <Text style={styles.vendorName}>{orderData.vendor}</Text>
            </View>

            {/* Customer Info */}
            <View style={styles.vendorData}>
                <View style={styles.dataFlexDirection}>
                    <Text style={styles.customerName}>{orderData.customerName}</Text>
                    <Text style={styles.customerPhone}>{orderData.customerPhone}</Text>
                </View>
                <View style={styles.dataFlexDirection}>
                    <Text style={styles.deliveryDateText}>Delivery Date</Text>
                    <Text style={styles.deliveryDateEntry}>{orderData.deliveryDate}</Text>
                </View>
            </View>

            {/* Comment Box */}
            <View style={styles.commentSection}>
                <Text style={styles.commentLabel}>Comment *</Text>
                <View style = {{flexDirection: 'row'}}>
                    <View style={styles.commentBoxWrapper}>
                        <TextInput
                            style={styles.commentBox}
                            placeholder="Enter your comment"
                            placeholderTextColor={'gray'}
                            multiline
                        />
                    </View>
                    <View style={styles.iconRow}>
                        <TouchableOpacity>
                            <PencilIcon size={25} color={'#6B7280'} strokeWidth={2} />
                            <Text>
                                Edit
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <BellIcon size={25} color={'#6B7280'} strokeWidth={2} />
                            <Text>
                                Notify
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Order Card */}
            <View style={styles.orderCard}>
                <Text style={styles.orderText}>Order</Text>
                <Text style={styles.orderDateEntry}>{orderData?.orderDate}</Text>
                <View style={styles.firstHorizontalLine} />
                <View style={styles.entriesView}>
                    <Text style={styles.itemText}>Item</Text>
                    <Text style={styles.quantityText}>Quantity</Text>
                </View>
                {orderData.items.map((item, idx) => (
                    <View key={idx} style={styles.allEntries}>
                        <Text>{item.name}</Text>
                        <Text>{item.quantity}</Text>
                    </View>
                ))}
                <View style={styles.horizontalLine} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Ordered products</Text>
                    <Text style={styles.summaryValue}>{orderData.totalItems}</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.viewDetails}>VIEW DETAILS</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: screenWidth * 0.08,
        paddingLeft: screenWidth * 0.04,
    },
    vendorName: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#0F1828',
        marginLeft: screenWidth * 0.02,
    },
    vendorData: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: screenWidth * 0.04,
        marginTop: screenWidth * 0.06,
    },
    dataFlexDirection: {
        flexDirection: 'column',
    },
    customerName: {
        fontWeight: '800',
        fontSize: 18,
        color: '#76B117',
    },
    customerPhone: {
        fontWeight: '500',
        fontSize: 15,
        color: '#000',
    },
    deliveryDateText: {
        fontWeight: '800',
        fontSize: 18,
        color: '#76B117',
    },
    deliveryDateEntry: {
        fontWeight: '500',
        fontSize: 15,
        color: '#000',
    },
    commentSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    commentLabel: {
        color: '#76B117',
        fontWeight: '500',
        marginBottom: 6,
    },
    commentBoxWrapper: {
        borderWidth: 1.5,
        borderColor: 'lightgray',
        borderRadius: 8,
        padding: 10,
        minHeight: 60,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        width: screenWidth * 0.7
    },
    commentBox: {
        fontSize: 15,
        padding: 0,
        color: '#000',
    },
    iconRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 20,
        alignItems: 'flex-start',
        alignContent: 'space-between',
        marginLeft: 10
    },
    orderCard: {
        borderWidth: 3,
        borderColor: '#76B117',
        borderRadius: 16,
        padding: 20,
        marginTop: 30,
        marginLeft: screenWidth * 0.03,
        width: '70%',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    orderText: {
        fontWeight: '700',
        fontSize: 18,
    },
    orderDateEntry: {
        fontSize: 15,
        fontWeight: '400',
        color: '#000',
    },
    firstHorizontalLine: {
        borderBottomWidth: 1,
        borderColor: 'lightgray',
        marginVertical: 10,
    },
    entriesView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    itemText: {
        fontWeight: '600',
        color: '#000',
    },
    quantityText: {
        fontWeight: '600',
        color: '#000',
    },
    allEntries: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    horizontalLine: {
        borderBottomWidth: 0.5,
        borderColor: 'lightgray',
        marginVertical: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        color: '#6B7280',
    },
    summaryValue: {
        fontWeight: 'bold',
        color: '#000',
    },
    viewDetails: {
        color: '#76B117',
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 12,
        textDecorationLine: 'underline',
    },
});

export default SpecificOrderScreen;