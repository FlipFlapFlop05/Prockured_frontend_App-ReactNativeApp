import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from "react-native-heroicons/outline";
import {useNavigation} from '@react-navigation/native';
import {vendorExistingPresets} from '../Constant/constant';

export default function VendorExistingPresets(){
  const navigation = useNavigation();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };



  return (
    <ScrollView style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={20} color="black" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.header}>Existing Presets</Text>
      </View>
      {vendorExistingPresets.map(section => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.questions.map(q => (
            <View key={q.id} style={styles.question}>
              <View styles={styles.question}>
                <Text style={styles.questionText}>{q.taglineText}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Edit Preset', {data: q})}>
                <ChevronRightIcon size={20} color={'black'} strokeWidth={4} />
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
    backgroundColor: "#F9FAFC",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 22,
    color: "#222",
    marginTop: -5,
    marginLeft: 10
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
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
    fontWeight: 'bold'
  },
  answer: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
    paddingLeft: 10,
    fontWeight: 'bold'
  },
});
