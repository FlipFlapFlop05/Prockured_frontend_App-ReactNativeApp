// components/GenericVectorIcon.js
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';

const IconPacks = {
  MaterialCommunityIcons,
  FontAwesome,
  Ionicons,
  Feather,
  Entypo,
  AntDesign,
};

export default function GenericVectorIcon({
  type,
  name,
  size = 24,
  color = '#000',
  style = {},
}) {
  const IconComponent = IconPacks[type];

  if (!IconComponent) {
    console.warn(`Icon type "${type}" not found in available icon packs`);
    return null;
  }

  return <IconComponent name={name} size={size} color={color} style={style} />;
}
