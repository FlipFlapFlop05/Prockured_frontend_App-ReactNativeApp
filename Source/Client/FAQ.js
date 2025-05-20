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
  ChevronUpIcon,
  ChevronDownIcon
} from "react-native-heroicons/outline";
import {useNavigation} from '@react-navigation/native';
import {faqData} from '../Constant/constant';

export default function ClientFAQ(){
  const navigation = useNavigation();
  const [expandedSections, setExpandedSections] = useState({});
  useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        headerTitle: 'FAQs',
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
          justifyContent: 'center'
          // color: 'white',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{paddingHorizontal: 13}}>
              <ChevronLeftIcon size={28} color="#333" />
          </TouchableOpacity>
        ),
      });
    }, [navigation]);

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };



  return (
    <ScrollView style={styles.container}>
      {faqData.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.questions.map((q) => (
            <View key={q.id}>
              <TouchableOpacity style={styles.question} onPress={() => toggleSection(q.id)}>
                <Text style={styles.questionText}>{q.question}</Text>
                {expandedSections[q.id] ? (
                  <ChevronUpIcon size={20} color="#4CAF50" strokeWidth={3} />
                ) : (
                  <ChevronDownIcon size={20} color="#4CAF50" strokeWidth={3} />
                )}
              </TouchableOpacity>
              {expandedSections[q.id] && <Text style={styles.answer}>{q.answer}</Text>}
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
