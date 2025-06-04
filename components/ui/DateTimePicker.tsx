import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, View } from 'react-native';
import Button from './Button';

type DateTimePickerProps = {
  isVisible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  isVisible,
  date,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(date);

  // keep internal state in sync with prop
  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  // If this is rendered on web, we can rely on the browser's date picker
  if (Platform.OS === 'web') {
    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors[theme].card }
            ]}
          >
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              Select Date
            </Text>

            <View style={styles.datePickerWeb}>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setSelectedDate(newDate);
                }}
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 16,
                  padding: 8,
                  borderRadius: 8,
                  border: `1px solid ${Colors[theme].border}`,
                  backgroundColor: Colors[theme].inputBackground,
                  color: Colors[theme].text,
                  width: '100%',
                }}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={onCancel}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Confirm"
                onPress={() => onConfirm(selectedDate)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // For native platforms (iOS, Android)
  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={onCancel}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors[theme].card }
            ]}
          >
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              Select Date
            </Text>

            <RNDateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (date) setSelectedDate(date);
              }}
              style={styles.datePicker}
              textColor={Colors[theme].text}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={onCancel}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Confirm"
                onPress={() => onConfirm(selectedDate)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // For Android
  return isVisible ? (
    <RNDateTimePicker
      value={selectedDate}
      mode="date"
      display="default"
      onChange={(event, date) => {
        if (event.type === 'dismissed') {
          onCancel();
        } else if (date) {
          setSelectedDate(date);
          onConfirm(date);
        }
      }}
    />
  ) : null;
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 24,
    textAlign: 'center',
  },
  datePicker: {
    marginBottom: 24,
    width: '100%',
    height: 200,
  },
  datePickerWeb: {
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
});

export default DateTimePicker;
