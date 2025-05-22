import React, {useState, useEffect} from 'react';
import {View, Text, TextInput} from 'react-native';

export default function ValidatedInput({
  label,
  placeholder,
  value,
  onChangeText,
  validationFunc,
  errorMessage,
  labelStyle,
  inputStyle,
  isRequired = true,
  ...rest
}) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  // Validate whenever value changes *after* touched
  useEffect(() => {
    if (touched && validationFunc) {
      const isValid = validationFunc(value);
      setError(isValid ? '' : errorMessage);
    }
  }, [value, touched]);

  const handleBlur = () => {
    setTouched(true);

    if (validationFunc) {
      const isValid = validationFunc(value);
      setError(isValid ? '' : errorMessage);
    }
  };

  return (
    <View style={{marginBottom: 16}}>
      {label && <Text style={[{marginBottom: 6}, labelStyle]}>{label}</Text>}

      <TextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        onBlur={handleBlur}
        style={[
          {
            borderWidth: 1,
            borderColor: error ? 'red' : '#ccc',
            padding: 10,
            borderRadius: 8,
          },
          inputStyle,
        ]}
        {...rest}
      />

      {touched && error !== '' && (
        <Text style={{color: 'red', marginTop: 4}}>{error}</Text>
      )}
    </View>
  );
}
