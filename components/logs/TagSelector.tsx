import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { getTravelCategories } from '@/utils/helpers';
import Button from '@/components/ui/Button';
import { X, Plus } from 'lucide-react-native';

type TagSelectorProps = {
  isVisible: boolean;
  selectedTags: string[];
  onSelectTags: (tags: string[]) => void;
  onClose: () => void;
};

const TagSelector: React.FC<TagSelectorProps> = ({
  isVisible,
  selectedTags,
  onSelectTags,
  onClose,
}) => {
  const { theme } = useTheme();
  const [tags, setTags] = useState<string[]>(selectedTags);
  const [customTag, setCustomTag] = useState('');

  const predefinedTags = getTravelCategories();

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleConfirm = () => {
    onSelectTags(tags);
  };

  return (
    <Modal
      visible={isVisible}
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
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              Select Tags
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors[theme].text} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.customTagInput,
              {
                backgroundColor: Colors[theme].inputBackground,
                borderColor: Colors[theme].border,
              }
            ]}
          >
            <TextInput
              style={[styles.input, { color: Colors[theme].text }]}
              placeholder="Add custom tag..."
              placeholderTextColor={Colors[theme].textSecondary}
              value={customTag}
              onChangeText={setCustomTag}
              onSubmitEditing={addCustomTag}
            />
            <TouchableOpacity onPress={addCustomTag} disabled={!customTag.trim()}>
              <Plus
                size={20}
                color={customTag.trim() ? Colors[theme].primary : Colors[theme].textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.tagList} contentContainerStyle={styles.tagListContent}>
            <View style={styles.selectedTagsContainer}>
              {tags.length > 0 ? (
                <View style={styles.tagsGroup}>
                  <Text style={[styles.tagGroupTitle, { color: Colors[theme].textSecondary }]}>
                    Selected Tags
                  </Text>
                  <View style={styles.tagContainer}>
                    {tags.map(tag => (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.tag,
                          styles.selectedTag,
                          { backgroundColor: Colors[theme].primary }
                        ]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text style={styles.selectedTagText}>
                          {tag}
                        </Text>
                        <X size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <Text style={[styles.noTagsText, { color: Colors[theme].textSecondary }]}>
                  No tags selected yet
                </Text>
              )}
            </View>

            <View style={styles.tagsGroup}>
              <Text style={[styles.tagGroupTitle, { color: Colors[theme].textSecondary }]}>
                Suggested Tags
              </Text>
              <View style={styles.tagContainer}>
                {predefinedTags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tag,
                      tags.includes(tag)
                        ? { backgroundColor: Colors[theme].primary }
                        : {
                            backgroundColor: Colors[theme].primaryLight,
                            borderColor: Colors[theme].primary,
                            borderWidth: 1,
                          }
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text
                      style={[
                        tags.includes(tag)
                          ? styles.selectedTagText
                          : {
                              color: Colors[theme].primary,
                              fontFamily: 'Poppins-Medium',
                            }
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              title="Confirm"
              onPress={handleConfirm}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  customTagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins-Regular',
  },
  tagList: {
    maxHeight: 300,
  },
  tagListContent: {
    paddingBottom: 16,
  },
  selectedTagsContainer: {
    marginBottom: 20,
  },
  tagsGroup: {
    marginBottom: 16,
  },
  tagGroupTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    paddingRight: 8,
  },
  selectedTagText: {
    color: '#FFFFFF',
    marginRight: 4,
    fontFamily: 'Poppins-Medium',
  },
  noTagsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
});

export default TagSelector;
