import { useState } from 'react';
import { Dimensions, Modal, StyleSheet } from 'react-native';

export function ItemsModal({ visible, onClose, items, onSelectItem }) {
  const [orientation, setOrientation] = useState('portrait');

  // Lock to portrait when modal opens to prevent layout breaking on tablets
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isPortrait = screenHeight >= screenWidth;

  if (!isPortrait && visible) {
    return (
      <Modal visible={visible} onRequestClose={onClose}>
        <Text>Please rotate your device to portrait mode to view items.</Text>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} onRequestClose={onClose} supportedOrientations={['portrait']}>
      {items.map(item => (
        <TouchableOpacity key={item.id} onPress={() => onSelectItem(item)}>
          <Text>{item.name} - {item.price}</Text>
        </TouchableOpacity>
      ))}
    </Modal>
  );
}
