import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    Alert,
    ScrollView, // Added ScrollView for better layout flexibility
} from 'react-native';
import {ChevronLeftIcon} from 'react-native-heroicons/outline';
import {useNavigation, useRoute} from '@react-navigation/native';
import {PlusIcon, PaperAirplaneIcon} from 'react-native-heroicons/outline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://api-v7quhc5aza-uc.a.run.app'; // Define your base URL

export default function CampaignOverview() {
    const route = useRoute();
    const {campaignData} = route.params;
    const navigation = useNavigation();

    const [gstNumber, setGSTNumber] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [supplierDetails, setSupplierDetails] = useState({}); // Renamed 'data' to 'supplierDetails' for clarity

    // Destructure campaignData for easier access
    const {
        date,
        month,
        year,
        timeHour,
        timeMinute,
        period,
        taglineText,
        selectedProducts,
        selectedAudienceTags, // This is the new part we're interested in!
    } = campaignData;

    // Helper to get the first product or a default empty product
    const firstProduct = selectedProducts?.[0] || {};

    // Initial state for completeData, using destructured values
    const [completeData, setCompleteData] = useState({
        gstNumber: '', // This will be filled by useEffect
        day: date,
        month: month,
        year: year,
        hour: timeHour,
        minute: timeMinute,
        dayFormat: period,
        audienceTag: selectedAudienceTags || [], // Initialize with selectedAudienceTags
        prodName: firstProduct.prodName || '',
        prodCategory: firstProduct.CategoryName || '', // Assuming CategoryName from API
        prodPrice: firstProduct.myPrice?.toString() || '',
        tagLine: taglineText,
        live: 'false',
    });

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: 'Preview',
            headerStyle: {
                backgroundColor: '#f8f8f8',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
                justifyContent: 'center',
                alignItems: 'center',
            },
            headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 20,
                fontFamily: 'Montserrat',
                justifyContent: 'center',
            },
            headerLeft: () => (
                <TouchableOpacity
                    onPress={goBack} // goBack now also sends data
                    style={{paddingHorizontal: 13}}>
                    <ChevronLeftIcon size={28} color="#333"/>
                </TouchableOpacity>
            ),
        });
    }, [navigation, goBack]); // Add goBack to dependencies

    // Fetch phone number
    useEffect(() => {
        const fetchPhoneNumber = async () => {
            try {
                const storedPhoneNumber = await AsyncStorage.getItem('supplierPhoneNumber');
                if (storedPhoneNumber) {
                    setPhoneNumber(storedPhoneNumber);
                }
            } catch (error) {
                console.log('Error Fetching Supplier Phone: ', error);
            }
        };
        fetchPhoneNumber();
    }, []);

    // Fetch GST number
    useEffect(() => {
        const fetchGSTNumber = async () => {
            try {
                const storedGSTNumber = await AsyncStorage.getItem('supplierGST');
                if (storedGSTNumber) {
                    setGSTNumber(storedGSTNumber);
                }
            } catch (error) {
                console.log('Error Fetching Supplier GST: ', error);
            }
        };
        fetchGSTNumber();
    }, []);

    // Fetch supplier details when GST number is available
    useEffect(() => {
        const fetchSupplierDetails = async () => {
            if (gstNumber) { // Depend on gstNumber, not phoneNumber for supplier details
                try {
                    const response = await axios.get(
                        `${BASE_URL}/getSupplierDetails/${gstNumber}`,
                    );
                    setSupplierDetails(response.data);
                } catch (error) {
                    console.log('Error fetching supplier details:', error);
                    Alert.alert('Error', 'Could not fetch supplier details.');
                }
            }
        };

        if (gstNumber) {
            fetchSupplierDetails();
        }
    }, [gstNumber]); // Only run when gstNumber changes

    // Unified function to send campaign data
    const sendCampaignData = async (isLive) => {
        if (!gstNumber || !selectedProducts || selectedProducts.length === 0) {
            Alert.alert('Error', 'Missing GST or Products data.');
            return;
        }

        // --- Important: Preparing the payload for the API ---
        // The API endpoint 'createCampaign' seems to expect a single product.
        // If your API can handle multiple products, you'll need to adjust the payload structure accordingly.
        // For now, we'll send the first selected product as before.
        const productForPayload = selectedProducts[0];

        // Format selectedAudienceTags for the API if it expects a comma-separated string
        // If your API expects an array of strings, then just pass selectedAudienceTags directly.
        const audienceTagString = Array.isArray(selectedAudienceTags)
            ? selectedAudienceTags.join(',')
            : selectedAudienceTags || ''; // Fallback for single string or empty

        const payload = {
            gstNumber: gstNumber,
            day: date,
            month: month,
            year: year,
            hour: timeHour,
            minute: timeMinute,
            dayFormat: period,
            audienceTag: audienceTagString, // Dynamically set the selected tags
            prodName: productForPayload?.prodName || '',
            prodCategory: productForPayload?.CategoryName || '',
            prodPrice: productForPayload?.myPrice?.toString() || '',
            tagLine: taglineText,
            live: isLive ? 'true' : 'false', // 'true' for handleSubmit, 'false' for goBack (save as draft)
        };

        try {
            console.log('Sending payload:', JSON.stringify(payload, null, 2));
            const response = await axios.post(`${BASE_URL}/createCampaign`, payload);
            console.log('API response:', response.data);

            if (response.data.success) { // Assuming your API returns a 'success' field
                Alert.alert('Success', `Campaign ${isLive ? 'sent' : 'saved'} successfully!`);
                navigation.navigate('Vendor App', {screen: 'Chat'});
            } else {
                // Handle API-specific errors
                Alert.alert('Success', response.data.message || 'Failed to create campaign.');
                navigation.navigate('Vendor App', {screen: 'Chat'});
            }
        } catch (error) {
            console.error('Submission error:', error.response?.data || error.message);
            Alert.alert('Error', `Something went wrong: ${error.response?.data?.message || error.message}. Please try again.`);
        }
    };

    const handleSubmit = () => {
        sendCampaignData(true); // Campaign goes live
    };

    const goBack = () => {
        // Option to save as draft when going back
        Alert.alert(
            "Save Draft?",
            "Do you want to save this campaign as a draft before going back?",
            [
                {
                    text: "Don't Save",
                    onPress: () => navigation.goBack(),
                    style: "cancel"
                },
                {
                    text: "Save Draft",
                    onPress: () => sendCampaignData(false) // Save as draft
                }
            ],
            {cancelable: true}
        );
    };


    return (
        <ScrollView style={styles.container}>
            {/* Dotted Chat Container */}
            <View style={styles.dottedBox}>
                {/* Cafe Header */}
                <View style={styles.header}>
                    <Image
                        source={require('../Images/ClientSettingImage.png')} // Replace with your image path
                        style={styles.avatar}
                    />
                    <Text style={styles.cafeName}>{supplierDetails.BusinessName || 'Your Business Name'}</Text>
                </View>

                {/* Product Message Card */}
                <View style={styles.productCard}>
                    <View style={{backgroundColor: 'white', borderRadius: 10, padding: 10}}>
                        {/* Display all selected product names if applicable, or just the first one */}
                        {selectedProducts && selectedProducts.length > 0 ? (
                            selectedProducts.map((product, index) => (
                                <Text key={index} style={styles.productTitle} numberOfLines={1}>
                                    {product?.prodName ?? 'Unnamed Product'}
                                </Text>
                            ))
                        ) : (
                            <Text style={styles.productTitle}>No product selected</Text>
                        )}
                        <Image
                            source={require('../Images/AddProduct.png')} // Replace with actual image path or dynamic product image
                            style={styles.productImage}
                        />
                        <Text style={styles.productDescription}>
                            {taglineText || 'No tagline provided.'}
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        {/* Display prices for all selected products */}
                        {selectedProducts && selectedProducts.length > 0 ? (
                            selectedProducts.map((product, index) => {
                                const price = product?.myPrice;
                                const finalPrice = price ? price - 0.1 * price : null; // 10% discount calculation
                                return (
                                    <View key={index} style={{flexDirection: 'row', marginRight: 10}}>
                                        <Text style={styles.strikePrice}>
                                            ₹ {price !== undefined ? price : 'N/A'}
                                        </Text>
                                        <Text style={styles.finalPrice}>
                                            ₹ {finalPrice !== null ? finalPrice.toFixed(2) : 'N/A'}
                                        </Text>
                                    </View>
                                );
                            })
                        ) : (
                            <>
                                <Text style={styles.strikePrice}>₹ N/A</Text>
                                <Text style={styles.finalPrice}>₹ N/A</Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Audience Tags Display */}
                <View style={styles.audienceTagsContainer}>
                    <Text style={styles.audienceTagsLabel}>Target Audience:</Text>
                    {selectedAudienceTags && selectedAudienceTags.length > 0 ? (
                        <View style={styles.audienceTagList}>
                            {selectedAudienceTags.map((tag, index) => (
                                <Text key={index} style={styles.audienceTagItem}>
                                    {tag}
                                </Text>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.audienceTagItem}>No specific audience selected.</Text>
                    )}
                </View>

                {/* Message Input Row */}
                <View style={styles.inputRow}>
                    <TextInput
                        placeholder="Type a message"
                        placeholderTextColor="#bbb"
                        style={styles.textInput}
                    />
                    <TouchableOpacity>
                        <PlusIcon size={22} color="#4CAF50"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sendButton}>
                        <PaperAirplaneIcon size={18} color="white"/>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity onPress={handleSubmit}>
                <View style={styles.addSupplierButtonView}>
                    <Text style={styles.addSupplierButtonText}>Approve and Send</Text>
                </View>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        paddingVertical: 20, // Added padding for scrollable content
    },
    dottedBox: {
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 12,
        padding: 12,
        width: '90%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: 'white', // Ensure it has a background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#ECF0F1',
        padding: 10,
        borderRadius: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 15,
        marginRight: 8,
    },
    cafeName: {
        fontWeight: '600',
        fontSize: 16,
        color: '#222',
    },
    productCard: {
        backgroundColor: '#76B117',
        borderWidth: 4,
        borderColor: '#8BC34A',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 10,
        marginBottom: 12,
        width: '60%',
        alignSelf: 'flex-end',
    },
    productTitle: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 6,
    },
    productImage: {
        width: '100%', // Make image responsive to card width
        height: 160,
        resizeMode: 'cover',
        marginBottom: 8,
        borderRadius: 8, // Added for better aesthetics
    },
    productDescription: {
        fontSize: 13,
        color: '#444',
        marginBottom: 6,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        justifyContent: 'flex-start', // Align prices to the start
        flexWrap: 'wrap', // Allow prices to wrap if many products
    },
    strikePrice: {
        textDecorationLine: 'line-through',
        color: 'lightgray',
        marginRight: 8,
        fontSize: 13,
        fontWeight: '400',
    },
    finalPrice: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    audienceTagsContainer: {
        marginTop: 10,
        marginBottom: 15,
    },
    audienceTagsLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    audienceTagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    audienceTagItem: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginRight: 5,
        marginBottom: 5,
        fontSize: 13,
        color: '#555',
    },
    inputRow: {
        backgroundColor: '#f2f2f2',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 10, // Added margin top
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: '#ECF0F1',
        borderRadius: 20,
        color: '#333', // Ensure text color is visible
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        padding: 8,
        marginLeft: 6,
    },
    addSupplierButtonView: {
        backgroundColor: '#76B117',
        padding: 15,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 30, // Adjusted margin top
        marginBottom: 30,
        width: '90%',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    addSupplierButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});