import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Star } from 'lucide-react-native';

interface LogSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { playType: string | null; level: string | null; rating: number; durationLabel: string | null }) => void;
}

export const LogSessionModal: React.FC<LogSessionModalProps> = ({ visible, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [playType, setPlayType] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [duration, setDuration] = useState<string | null>(null);

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };
  
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(1);
    setPlayType(null);
    setLevel(null);
    setRating(0);
    setDuration(null);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({ playType, level, rating, durationLabel: duration });
    handleClose();
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        const types = ['Singles', 'Doubles', 'Drills', 'Class'];
        return (
          <View>
            <Text style={styles.questionTitle}>What did you play?</Text>
            <View style={styles.buttonGrid}>
              {types.map((type) => (
                <TouchableOpacity 
                  key={type} 
                  style={[styles.optionButton, playType === type && styles.optionButtonActive]}
                  onPress={() => setPlayType(type)}
                >
                  <Text style={[styles.optionText, playType === type && styles.optionTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.footerSingle}>
              <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
                <Text style={styles.primaryButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 2:
        const levels = ['Beginner', 'Intermediate', 'Advanced', 'Competitive'];
        return (
          <View>
            <Text style={styles.questionTitle}>Your level of play?</Text>
            <View style={styles.buttonGrid}>
              {levels.map((lvl) => (
                <TouchableOpacity 
                  key={lvl} 
                  style={[styles.optionButton, level === lvl && styles.optionButtonActive]}
                  onPress={() => setLevel(lvl)}
                >
                  <Text style={[styles.optionText, level === lvl && styles.optionTextActive]}>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.footerDouble}>
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonHalf} onPress={nextStep}>
                <Text style={styles.primaryButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.questionTitle}>How'd you perform?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.starWrapper}>
                  <Star size={36} color="#5B738B" fill={s <= rating ? '#5B738B' : 'transparent'} strokeWidth={1.5} />
                  <Text style={styles.starSubText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.footerDouble}>
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonHalf} onPress={nextStep}>
                <Text style={styles.primaryButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 4:
        const durations = ['30 min', '60 min', '90 min', '120 min'];
        return (
          <View>
            <Text style={styles.questionTitle}>How long did you play?</Text>
            <View style={styles.buttonGrid}>
              {durations.map((dur) => (
                <TouchableOpacity 
                  key={dur} 
                  style={[styles.optionButton, duration === dur && styles.optionButtonActive]}
                  onPress={() => setDuration(dur)}
                >
                  <Text style={[styles.optionText, duration === dur && styles.optionTextActive]}>{dur}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.footerDouble}>
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonHalf} onPress={handleSubmit}>
                <Text style={styles.primaryButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Log Court Session</Text>
              <Text style={styles.questionStepText}>Question {step} of 4</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
          </View>

          {renderContent()}

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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#13284B',
    marginBottom: 4,
  },
  questionStepText: {
    fontSize: 14,
    color: '#5B738B',
  },
  cancelText: {
    fontSize: 16,
    color: '#5B738B',
  },
  progressBarWrapper: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginVertical: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#208B59',
    borderRadius: 2,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#13284B',
    marginBottom: 20,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  optionButton: {
    width: '48%',
    backgroundColor: '#F0F2F5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  optionButtonActive: {
    backgroundColor: '#208B59', // Active state generic
  },
  optionText: {
    fontSize: 16,
    color: '#13284B',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFF',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  starWrapper: {
    alignItems: 'center',
  },
  starSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#5B738B',
  },
  footerSingle: {
    alignItems: 'center',
  },
  footerDouble: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: '#A2CBB6', // Exact match light green from image
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonHalf: {
    backgroundColor: '#A2CBB6',
    width: '48%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#F0F2F5',
    width: '48%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#13284B',
    fontSize: 18,
    fontWeight: '600',
  },
});
