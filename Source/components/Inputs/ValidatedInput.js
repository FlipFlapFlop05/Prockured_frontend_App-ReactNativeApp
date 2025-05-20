import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

export default function ValidatedInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  validationFunc,
  errorMessage,
  labelStyle,
  isRequired,
}) {
  const [touched, setTouched] = useState(false);
  const isValid = validationFunc ? validationFunc(value) : true;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        <Text style={StyleSheet.flatten([styles.label, labelStyle])}>
          {label}
        </Text>
        {isRequired && <Text style={styles.asterisk}> *</Text>}
        {/* <Text style={styles.asterisk}> *</Text> */}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="gray"
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        onBlur={() => setTouched(true)}
      />
      {!isValid && touched && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
  },
  asterisk: {
    color: 'red',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: 'black',
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 13,
  },
});
