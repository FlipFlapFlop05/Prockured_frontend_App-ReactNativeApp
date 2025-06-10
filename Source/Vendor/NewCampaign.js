import React, {useEffect, useLayoutEffect, useState, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChevronLeftIcon, MagnifyingGlassIcon} from 'react-native-heroicons/outline';
import {tags, tagColors} from '../Constant/constant';
import axios from 'axios';
import {CheckBox} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api-v7quhc5aza-uc.a.run.app';

export default function NewCampaign() {
    const navigation = useNavigation();

    // Use States
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [formData, setFormData] = useState({
        date: '',
        month: '',
        year: '',
        timeHour: '',
        timeMinute: '',
        taglineText: ''
    });
    const [selectedProductData, setSelectedProductData] = useState([]);
    const [selected, setSelected] = useState('AM');
    const [gstNumber, setGSTNumber] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gstLoading, setGstLoading] = useState(true);

    // Handle input changes for form fields
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    // Effect to fetch GST number from AsyncStorage once on component mount
    useEffect(() => {
        const loadSupplierGST = async () => {
            console.log("Attempting to load supplierGST from AsyncStorage...");
            setGstLoading(true);
            try {
                const gst = await AsyncStorage.getItem('supplierGST');
                if (gst) {
                    setGSTNumber(gst);
                    console.log('✅ Supplier GST loaded successfully:', gst);
                } else {
                    console.warn('⚠️ No supplierGST found in AsyncStorage.');
                    Alert.alert("Information", "No GST number found. Please ensure you are logged in correctly.");
                }
            } catch (error) {
                console.error('❌ Error fetching supplierGST from AsyncStorage:', error);
                Alert.alert("Error", "Could not retrieve GST number. Please try again or log in again.");
            } finally {
                setGstLoading(false);
            }
        };

        loadSupplierGST();
    }, []);

    // Layout effect for header configuration
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitle: 'New Campaign',
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
                    onPress={() => {
                        navigation.goBack();
                    }}
                    style={{paddingHorizontal: 13}}>
                    <ChevronLeftIcon size={28} color="#333"/>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    // Handle form submission
    const handleSubmit = () => {
        const {date, month, year, timeHour, timeMinute, taglineText} = formData;

        // Basic validation for form fields
        if (!date || !month || !year || !timeHour || !timeMinute || !taglineText) {
            Alert.alert("Missing Information", "Please fill all date, time, and tagline fields.");
            return;
        }

        // Validate selected products
        console.log('Attempting to submit. Selected products count:', selectedProductData.length);
        if (selectedProductData.length === 0) {
            Alert.alert("Selection Required", "Please select at least one product for your campaign.");
            return;
        }

        const campaignData = {
            date,
            month,
            year,
            timeHour,
            timeMinute,
            period: selected,
            taglineText,
            selectedProducts: selectedProductData,
        };

        console.log('Campaign Data prepared:', JSON.stringify(campaignData, null, 2));

        navigation.navigate("Campaign Overview", {campaignData});
        Alert.alert('Campaign Created', `Campaign scheduled for ${date}/${month}/${year} at ${timeHour}:${timeMinute} ${selected} with ${selectedProductData.length} products.`);
    };

    // Toggles the selection state of a product and updates selectedProductData
    const toggleSelection = useCallback((id) => {
        if (!id) {
            console.warn("⚠️ Attempted to toggle selection with an invalid product ID:", id);
            return; // Exit if ID is invalid
        }

        setSelectedItems((prev) => {
            const isCurrentlySelected = !!prev[id];
            const newState = {...prev, [id]: !isCurrentlySelected};

            // Filter `items` (all products) based on the new `newState`
            // Ensure `item.productId` is always used for filtering
            const currentlySelectedIds = Object.keys(newState).filter(key => newState[key]);
            const productsToUpdate = items.filter(item => {
                if (item && item.productId !== undefined && item.productId !== null) {
                    return currentlySelectedIds.includes(item.productId.toString()); // Convert to string for consistent comparison
                }
                console.warn("Product in items array is missing productId:", item);
                return false;
            });

            setSelectedProductData(productsToUpdate);
            console.log(`Product ID ${id} toggled. New selected items count: ${productsToUpdate.length}`);
            console.log('Currently selected products (names):', productsToUpdate.map(p => p.prodName));
            return newState;
        });
    }, [items]); // Depend on `items` because we filter it here

    // Effect to fetch product catalogue when gstNumber is available
    useEffect(() => {
        if (gstLoading || !gstNumber) {
            if (!gstLoading && !gstNumber) {
                console.log('🚫 Skipping product fetch: GST number is not available after loading.');
            } else {
                console.log('⏳ Waiting for GST number to finish loading or be available...');
            }
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            console.log(`🚀 Fetching catalogue for GST: ${gstNumber}`);
            try {
                const response = await axios.get(`${BASE_URL}/getCatalogue/${gstNumber}`);
                // Ensure the data is always an array of objects
                let fetchedData = [];
                if (response.data && typeof response.data === 'object') {
                    fetchedData = Object.values(response.data);
                }

                // IMPORTANT: Validate each item for productId
                const validItems = fetchedData.filter(item => {
                    if (item && item.productId !== undefined && item.productId !== null) {
                        return true;
                    }
                    console.warn('⚠️ Found an item without a valid productId:', item);
                    return false;
                });

                setItems(validItems);
                setFilteredData(validItems);
                console.log(`✅ Fetched and validated ${validItems.length} products.`);

                if (validItems.length === 0) {
                    Alert.alert("No Products Found", "No valid products were found for your GST number. Please add products to your catalogue or check their data structure.");
                }
            } catch (error) {
                console.error('❌ Error fetching catalogue:', error.response?.data || error.message);
                Alert.alert("Error", `Failed to fetch product data: ${error.message}. Please check your internet connection or the API endpoint.`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [gstNumber, gstLoading]);

    // Effect for handling search term changes
    useEffect(() => {
        if (searchTerm) {
            const results = items.filter(item =>
                item.prodName && item.prodName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredData(results);
            console.log(`🔍 Filtered products for "${searchTerm}": ${results.length} results.`);
        } else {
            setFilteredData(items);
            console.log('🔍 Showing all products (search term is empty).');
        }
    }, [searchTerm, items]);

    // Render individual product item in FlatList
    const renderProductItem = ({item}) => {
        // Log the item structure here for deep inspection
        // console.log("Rendering item:", item);
        if (!item || item.productId === undefined || item.productId === null) {
            console.warn("❌ Cannot render product item: Invalid item or missing productId.", item);
            return null; // Don't render invalid items
        }

        return (
            <TouchableOpacity
                style={styles.dataTouchableOpacity}
                onPress={() => toggleSelection(item.productId.toString())} // Ensure ID is string for consistency
            >
                <CheckBox
                    checked={!!selectedItems[item.productId.toString()]} // Convert to string
                    onPress={() => toggleSelection(item.productId.toString())} // Convert to string
                    containerStyle={styles.checkBoxContainerStyle}
                    checkedColor={'green'}
                />

                <View style={styles.supplierDataView}>
                    <Text style={styles.productNameStyle} numberOfLines={1}>
                        {item.prodName || 'N/A'}
                    </Text>
                    <Text style={styles.productCategoryStyle} numberOfLines={1}>
                        {item.CategoryName || 'N/A'}
                    </Text>
                    <Text style={styles.productPriceStyle} numberOfLines={1}>
                        ₹{item.myPrice !== undefined ? item.myPrice : 'N/A'}
                    </Text>
                    <Text style={styles.productDiscountStyle} numberOfLines={1}>
                        10% off
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView style={styles.container}>

            {/* Date Bar */}
            <View style={styles.dateView}>
                <Text style={styles.dateText}>Date</Text>
                <View style={styles.dateEntryView}>
                    <View style={styles.dateEntryDateView}>
                        <TextInput
                            style={styles.dateEntryDateText}
                            placeholder={'DD'}
                            placeholderTextColor={'gray'}
                            keyboardType={'numeric'}
                            maxLength={2}
                            value={formData.date}
                            onChangeText={(text) => handleInputChange('date', text)}
                        />
                    </View>
                    <View style={styles.dateEntryMonthView}>
                        <TextInput
                            style={styles.dateEntryMonthText}
                            placeholder={'MM'}
                            placeholderTextColor={'gray'}
                            keyboardType={'numeric'}
                            maxLength={2}
                            value={formData.month}
                            onChangeText={(text) => handleInputChange('month', text)}
                        />
                    </View>
                    <View style={styles.dateEntryYearView}>
                        <TextInput
                            style={styles.dateEntryYearText}
                            placeholder={'YYYY'}
                            placeholderTextColor={'gray'}
                            keyboardType={'numeric'}
                            maxLength={4}
                            value={formData.year}
                            onChangeText={(text) => handleInputChange('year', text)}
                        />
                    </View>
                </View>
            </View>

            {/* Time View */}
            <View style={styles.timeView}>
                <Text style={styles.timeText}>Time</Text>
                <View style={styles.timeEntryView}>
                    <View style={styles.timeEntryHourView}>
                        <TextInput
                            style={styles.timeEntryHourText}
                            placeholder={'HH'}
                            placeholderTextColor={'gray'}
                            keyboardType={'numeric'}
                            maxLength={2}
                            value={formData.timeHour}
                            onChangeText={(text) => handleInputChange('timeHour', text)}
                        />
                    </View>
                    <View style={styles.timeEntryColonView}>
                        <Text style={styles.timeEntryColonText}>:</Text>
                    </View>
                    <View style={styles.timeEntryMinuteView}>
                        <TextInput
                            style={styles.timeEntryMinuteText}
                            placeholder={'MM'}
                            placeholderTextColor={'gray'}
                            keyboardType={'numeric'}
                            maxLength={2}
                            value={formData.timeMinute}
                            onChangeText={(text) => handleInputChange('timeMinute', text)}
                        />
                    </View>
                    <View style={styles.pickerContainer}>
                        <TouchableOpacity
                            style={[styles.option, selected === 'AM' && styles.selected]}
                            onPress={() => setSelected('AM')}
                        >
                            <Text style={[styles.text, selected === 'AM' && styles.selectedText]}>AM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.option, selected === 'PM' && styles.selected]}
                            onPress={() => setSelected('PM')}
                        >
                            <Text style={[styles.text, selected === 'PM' && styles.selectedText]}>PM</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Choose Audience - Currently hardcoded with tags */}
            <View style={styles.chooseAudienceView}>
                <Text style={styles.chooseAudienceText}>Choose Audience</Text>
                <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                        <Text key={index} style={[styles.tag, {backgroundColor: tagColors[tag] || "#ccc"}]}>
                            {tag} x
                        </Text>
                    ))}
                </View>
            </View>

            {/* Product Selection Section */}
            <View style={styles.dataView}>
                {/* Search Bar */}
                <View style={styles.searchContainerView}>
                    <MagnifyingGlassIcon size={20} color={'black'} strokeWidth={2} style={styles.searchIcon}/>
                    <TextInput
                        placeholderTextColor={'gray'}
                        placeholder={'Search any Product'}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        keyboardType={'default'}
                        style={styles.searchBarInput}
                    />
                </View>

                {/* Loading Indicator or Product List */}
                {loading || gstLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#76B117"/>
                        <Text style={styles.loadingText}>
                            {gstLoading ? "Loading GST..." : "Loading products..."}
                        </Text>
                    </View>
                ) : (
                    <View style={{maxHeight: 250}}> {/* Use maxHeight for scrollable content */}
                        <FlatList
                            data={searchTerm ? filteredData : items}
                            keyExtractor={(item) => item.productId?.toString() || item.id?.toString() || Math.random().toString()}
                            renderItem={renderProductItem}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyListContainer}>
                                    <Text style={styles.emptyListText}>
                                        {searchTerm ? "No products found matching your search." : "No products available to select."}
                                    </Text>
                                </View>
                            )}
                            contentContainerStyle={styles.flatListContent}
                        />
                    </View>
                )}
            </View>

            {/* Choose Product Image */}
            <View style={styles.productImageView}>
                <Text style={styles.productImageText}>Choose Product Image*</Text>
                <TouchableOpacity onPress={() => Alert.alert("Feature", "Image selection not yet implemented!")}>
                    <Image
                        source={require('../Images/AddProduct.png')}
                        style={styles.productImage}
                    />
                </TouchableOpacity>
            </View>

            {/* Write Tagline Text */}
            <View style={styles.taglineView}>
                <Text style={styles.writeTaglineText}>Write Tagline Text*</Text>
                <View style={styles.taglineTextView}>
                    <TextInput
                        style={styles.taglineTextStyle}
                        placeholder={'Enter the tagline text'}
                        placeholderTextColor={'gray'}
                        keyboardType={'default'}
                        value={formData.taglineText}
                        onChangeText={(text) => handleInputChange('taglineText', text)}
                        multiline={true}
                        numberOfLines={3}
                    />
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsView}>
                <TouchableOpacity style={styles.cancelButtonTouchableOpacity} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButtonTouchableOpacity} onPress={handleSubmit}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: 20,
    },
    dateView: {
        flexDirection: 'column',
        paddingTop: 20,
    },
    dateText: {
        fontWeight: '700',
        fontSize: 18,
        fontStyle: 'normal',
        fontFamily: 'Montserrat',
        lineHeight: 20,
        letterSpacing: 0.4,
        color: '#333',
    },
    dateEntryView: {
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'flex-start',
        gap: 10,
    },
    dateEntryDateView: {
        backgroundColor: '#EEEEEE',
        width: 60,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    dateEntryDateText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
    },
    dateEntryMonthView: {
        backgroundColor: '#EEEEEE',
        width: 60,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    dateEntryMonthText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
    },
    dateEntryYearView: {
        backgroundColor: '#EEEEEE',
        width: 75,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    dateEntryYearText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
    },
    timeView: {
        paddingTop: 30,
    },
    timeText: {
        fontWeight: '700',
        fontSize: 18,
        fontStyle: 'normal',
        fontFamily: 'Montserrat',
        lineHeight: 20,
        letterSpacing: 0.4,
        color: '#333',
    },
    timeEntryView: {
        flexDirection: 'row',
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 5,
    },
    timeEntryHourView: {
        backgroundColor: '#EEEEEE',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    timeEntryHourText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
    },
    timeEntryColonView: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeEntryColonText: {
        fontStyle: 'normal',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    timeEntryMinuteView: {
        backgroundColor: '#EEEEEE',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    timeEntryMinuteText: {
        fontStyle: 'normal',
        fontFamily: 'Open Sans',
        fontWeight: '600',
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
    },
    pickerContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
        width: 100,
        marginLeft: 20,
    },
    option: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selected: {
        backgroundColor: '#69B946',
    },
    text: {
        color: '#333',
        fontWeight: '500',
    },
    selectedText: {
        color: '#fff',
    },
    chooseAudienceView: {
        paddingTop: 30,
    },
    chooseAudienceText: {
        fontWeight: '700',
        fontSize: 18,
        fontStyle: 'normal',
        fontFamily: 'Montserrat',
        lineHeight: 20,
        letterSpacing: 0.4,
        color: '#333',
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 8,
    },
    tag: {
        color: "white",
        fontSize: 14,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    dataView: {
        marginTop: 20,
    },
    searchContainerView: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchBarInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    flatListContent: {
        paddingBottom: 20,
    },
    dataTouchableOpacity: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginTop: 10,
        padding: 12,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 2,
        borderColor: '#eee',
        borderWidth: 1,
    },
    checkBoxContainerStyle: {
        padding: 0,
        margin: 0,
        marginRight: 10,
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    supplierDataView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productNameStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flexShrink: 1,
        marginRight: 5,
    },
    productCategoryStyle: {
        fontSize: 14,
        color: 'gray',
        flexShrink: 1,
        marginRight: 5,
    },
    productPriceStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 5,
    },
    productDiscountStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'green',
    },
    emptyListContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    emptyListText: {
        fontSize: 16,
        color: '#757575',
    },
    productImageView: {
        paddingTop: 30,
    },
    productImageText: {
        fontWeight: '700',
        fontSize: 18,
        fontStyle: 'normal',
        fontFamily: 'Montserrat',
        lineHeight: 20,
        letterSpacing: 0.4,
        color: '#333',
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    taglineView: {
        paddingTop: 30,
    },
    writeTaglineText: {
        fontWeight: '700',
        fontSize: 18,
        fontStyle: 'normal',
        fontFamily: 'Montserrat',
        lineHeight: 20,
        letterSpacing: 0.4,
        color: '#333',
    },
    taglineTextView: {
        borderWidth: 1,
        borderColor: 'lightgray',
        marginTop: 10,
        borderRadius: 10,
    },
    taglineTextStyle: {
        color: '#323232',
        fontStyle: 'normal',
        fontFamily: 'OpenSans',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
        letterSpacing: 0.4,
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    buttonsView: {
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 30,
        gap: 30,
    },
    cancelButtonTouchableOpacity: {
        backgroundColor: '#ECF0F1',
        width: 120,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60,
    },
    cancelButtonText: {
        fontStyle: 'normal',
        fontFamily: 'Montserrat',
        fontWeight: '800',
        fontSize: 16,
        lineHeight: 20,
        letterSpacing: 0.4,
        color: '#76B117',
    },
    saveButtonTouchableOpacity: {
        backgroundColor: '#76B117',
        width: 150,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 60,
    },
    saveButtonText: {
        fontStyle: 'normal',
        fontFamily: 'Montserrat',
        fontWeight: '800',
        fontSize: 16,
        lineHeight: 20,
        letterSpacing: 0.4,
        color: '#ECF0F1',
    },
});