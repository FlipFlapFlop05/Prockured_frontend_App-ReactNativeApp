import {useRef, useEffect} from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';

const OutletDropdown = ({outlets, onSelect, onClose}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    // For web
    if (document) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (document) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [onClose]);

  return (
    <View ref={dropdownRef} style={styles.outletDropdown}>
      <FlatList
        data={outlets}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.outletItem}
            onPress={() => {
              onSelect(item);
              onClose();
            }}>
            {/* Your outlet item rendering */}
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default OutletDropdown;
