import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import {ChevronLeftIcon} from "react-native-heroicons/outline";
import {Ionicons} from "@expo/vector-icons";
import {ChevronRightIcon} from "react-native-heroicons/solid";

const { width: screenWidth } = Dimensions.get('window');

const ExistingPresets = () => {
  const data = [
    {
      "id": "drafts",
      "title": "Drafts",
      description: [
        { title: 'Wake Up to Saving! Get 15% off our best blends. Brew happiness every morning!', link: '/wake-up-saving' },
        { title: 'Creamy Delight at a Discount! Enjoy 20% off. Perfect for your next guacamole!', link: '/creamy-delight' },
      ]
    },
    {
      "id": "previousCampaigns",
      "title": "Previous Campaigns",
      description: [
        { title: 'Ocean to Plate! Dive into a 15% discount. Fresh, flavorful, and responsibly sourced.', link: '/ocean-to-plate' },
        { title: 'Sweet Deal Alert! Now 15% off. Picked at peak ripeness for maximum flavor.', link: '/sweet-deal' },
        { title: 'Fresh Stock Just In! Quench your thirst with nature\'s finest. Order now!', link: '/fresh-stock' },
        { title: 'Color Your Plate! Enjoy 10% off. Add a pop of flavor and color to your meals.', link: '/color-your-plate' },
        { title: 'Get the best organic carrots at unbeatable prices—10% off this week only!', link: '/organic-carrots' },
      ]
    }
  ]

  return (
    <ScrollView style={styles.container}>
      <View style = {{flexDirection: "row", padding: 15, paddingLeft: -25}}>
        <TouchableOpacity>
          <ChevronLeftIcon size={22} color = "black" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.header}>Existing Presets</Text>
      </View>
      {data.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.description.map((q) => (
            <View key={q.id}>
              <TouchableOpacity style={styles.question}>
                <Text style={styles.questionText}>{q.title}</Text>
                <ChevronRightIcon size={20} color={"black"} strokeWidth={5} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: '#fff', // Match background color
    padding: 20, // Add padding to match the image
  },
  header: { // Add top margin for status bar
    marginBottom: 20, // Add bottom margin for spacing
    alignItems: 'flex-start', // Align time to the left
    marginLeft: 20,
    fontWeight: "bold",
    fontStyle: "normal",
    fontSize: 18
  },
  headerText: {
    fontSize: 17, // Adjust font size as needed
    color: '#000', // Match time color
  },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16, // Adjust font size as needed
    fontWeight: 'bold',
    marginBottom: 10,// Add spacing below title
    color: "#76B117",
  },
  listItem: { // Match list item background color
    borderRadius: 8, // Match list item border radius
    padding: 15, // Add padding to list items
    marginBottom: 10, // Add spacing between list items
  },
  listItemText: {
    fontSize: 16, // Adjust font size as needed
    color: '#000', // Match text color
  },
  question: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  questionText: {
    fontSize: 16,
    color: "#333",
  },
});

export default ExistingPresets;
