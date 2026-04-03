import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { X } from 'lucide-react-native';

interface LogGearModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const LogGearModal: React.FC<LogGearModalProps> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleClose = () => {
    setName('');
    setPrice('');
    setQuantity('1');
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({ name, price, quantity });
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Log Gear Purchase</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#5B738B" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ITEM NAME</Text>
            <TextInput 
              style={styles.textInput}
              placeholder="e.g. Yonex AS-30 Shuttles"
              placeholderTextColor="#8A9BB3"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 16 }]}>
              <Text style={styles.label}>PRICE ($)</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="35.00"
                placeholderTextColor="#8A9BB3"
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>QUANTITY</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="1"
                placeholderTextColor="#8A9BB3"
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Purchase</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(138, 155, 179, 0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#13284B',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B738B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F0F2F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 16,
    color: '#13284B',
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#A2CBB6', // Light green
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
