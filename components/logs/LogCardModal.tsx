import Button from '@/components/ui/Button';
import { Log } from '@/context/LogsContext';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { formatDate } from '@/utils/helpers';
import { Calendar, MapPin, Star, X } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type LogCardModalProps = {
  visible: boolean;
  log: Log;
  onClose: () => void;
  onViewDetails: () => void;
};

const LogCardModal: React.FC<LogCardModalProps> = ({
  visible,
  log,
  onClose,
  onViewDetails,
}) => {
  const { theme } = useTheme();

  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? Colors[theme].starFilled : Colors[theme].border}
            fill={star <= rating ? Colors[theme].starFilled : 'transparent'}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: Colors[theme].card }
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={20} color={Colors[theme].text} />
          </TouchableOpacity>

        <View style={styles.imageContainer}>
          {log.images && log.images.length > 0 ? (
            <Image
              source={{ uri: log.images[0] }}
              style={styles.image}
              accessibilityLabel={`${log.title} image`}
            />
          ) : (
            <View style={[
              styles.noImagePlaceholder,
              { backgroundColor: Colors[theme].border }
            ]}>
              <Text style={{ color: Colors[theme].textSecondary }}>No image</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: Colors[theme].text }]}>
          {log.title}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MapPin size={16} color={Colors[theme].primary} style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: Colors[theme].text }]}>
              {log.location}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Calendar size={16} color={Colors[theme].textSecondary} style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: Colors[theme].textSecondary }]}>
              {formatDate(log.date)}
            </Text>
          </View>
        </View>

        {renderRatingStars(log.rating)}

        <Text
          style={[styles.description, { color: Colors[theme].textSecondary }]}
          numberOfLines={3}
        >
          {log.description}
        </Text>

        <View style={styles.tagsContainer}>
          {log.tags && log.tags.slice(0, 3).map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tag,
                { backgroundColor: Colors[theme].primaryLight }
              ]}
            >
              <Text style={[styles.tagText, { color: Colors[theme].primary }]}>
                {tag}
              </Text>
            </View>
          ))}
          {log.tags && log.tags.length > 3 && (
            <View
              style={[
                styles.tag,
                { backgroundColor: Colors[theme].primaryLight }
              ]}
            >
              <Text style={[styles.tagText, { color: Colors[theme].primary }]}>
                +{log.tags.length - 3} more
              </Text>
            </View>
          )}
        </View>

        <Button
          title="View Full Details"
          onPress={onViewDetails}
          style={{ marginTop: 16 }}
        />
      </View>
    </View>
    </Modal >
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
  },
  metaContainer: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaIcon: {
    marginRight: 8,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});

export default LogCardModal;
