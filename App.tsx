import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

type EditAction = 'rotate' | 'flip' | 'square';

export default function App() {
  const [originalUri, setOriginalUri] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Allow photo access to choose an image to edit.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1
    });
    if (!result.canceled && result.assets[0]) {
      setOriginalUri(result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    }
  };

  const editImage = async (action: EditAction) => {
    if (!imageUri || busy) return;
    setBusy(true);
    try {
      let actions: ImageManipulator.Action[] = [];
      if (action === 'rotate') actions = [{ rotate: 90 }];
      if (action === 'flip') actions = [{ flip: ImageManipulator.FlipType.Horizontal }];
      if (action === 'square') {
        const size = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          Image.getSize(imageUri, (width, height) => resolve({ width, height }), reject);
        });
        const edge = Math.min(size.width, size.height);
        actions = [{ crop: {
          originX: Math.floor((size.width - edge) / 2),
          originY: Math.floor((size.height - edge) / 2),
          width: edge, height: edge
        }}];
      }
      const edited = await ImageManipulator.manipulateAsync(imageUri, actions, {
        compress: 0.94, format: ImageManipulator.SaveFormat.JPEG
      });
      setImageUri(edited.uri);
    } catch (error) {
      Alert.alert('Could not edit image', error instanceof Error ? error.message : 'Please try another image.');
    } finally {
      setBusy(false);
    }
  };

  const resetImage = () => { if (originalUri) setImageUri(originalUri); };

  const saveImage = async () => {
    if (!imageUri || busy) return;
    setBusy(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Gallery permission needed', 'Allow permission to save your edited photo.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert('Saved', 'Your edited photo was saved to your gallery.');
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const shareImage = async () => {
    if (!imageUri) return;
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing unavailable', 'Sharing is not supported on this device.');
      return;
    }
    await Sharing.shareAsync(imageUri, { mimeType: 'image/jpeg', dialogTitle: 'Share your Piscart edit' });
  };

  const Tool = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity accessibilityRole="button" style={styles.tool} onPress={onPress} disabled={busy}>
      <Text style={styles.toolText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7fb" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Piscart</Text>
            <Text style={styles.subtitle}>Your photos, your creativity.</Text>
          </View>
          <View style={styles.mark}><Text style={styles.markText}>P</Text></View>
        </View>

        <View style={styles.canvas}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="contain" />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.photoIcon}>✦</Text>
              <Text style={styles.emptyTitle}>Make something wonderful</Text>
              <Text style={styles.emptyText}>Choose a photo to start editing.</Text>
              <TouchableOpacity style={styles.primary} onPress={choosePhoto}>
                <Text style={styles.primaryText}>Choose a photo</Text>
              </TouchableOpacity>
            </View>
          )}
          {busy && <View style={styles.loading}><ActivityIndicator size="large" color="#ffffff" /></View>}
        </View>

        <TouchableOpacity style={styles.primary} onPress={choosePhoto}>
          <Text style={styles.primaryText}>{imageUri ? 'Choose another photo' : 'Open gallery'}</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Quick edits</Text>
        <View style={styles.tools}>
          <Tool label="↻  Rotate" onPress={() => editImage('rotate')} />
          <Tool label="⇋  Flip" onPress={() => editImage('flip')} />
          <Tool label="□  Square crop" onPress={() => editImage('square')} />
          <Tool label="↺  Reset" onPress={resetImage} />
        </View>

        <Text style={styles.sectionTitle}>Export</Text>
        <View style={styles.exportRow}>
          <TouchableOpacity style={[styles.exportButton, !imageUri && styles.disabled]} onPress={saveImage} disabled={!imageUri || busy}>
            <Text style={styles.exportText}>Save to gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.shareButton, !imageUri && styles.disabled]} onPress={shareImage} disabled={!imageUri || busy}>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footer}>Piscart 0.1.0 · Starter editor · Your edits stay on your device</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7fb' },
  page: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  brand: { fontSize: 30, fontWeight: '900', color: '#24203b', letterSpacing: -1 },
  subtitle: { fontSize: 13, color: '#77758a', marginTop: 3 },
  mark: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#7657f6', alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#fff', fontSize: 25, fontWeight: '900' },
  canvas: { height: 330, borderRadius: 24, overflow: 'hidden', backgroundColor: '#e8e5f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  photo: { width: '100%', height: '100%' },
  empty: { alignItems: 'center', padding: 20 },
  photoIcon: { fontSize: 42, color: '#7657f6', marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#302b49' },
  emptyText: { color: '#77758a', marginTop: 7, marginBottom: 18 },
  primary: { minHeight: 50, backgroundColor: '#7657f6', borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sectionTitle: { color: '#28243e', fontWeight: '800', fontSize: 17, marginTop: 24, marginBottom: 12 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tool: { width: '48%', flexGrow: 1, minHeight: 50, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#eceaf4', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  toolText: { color: '#39334f', fontWeight: '700', fontSize: 13 },
  exportRow: { flexDirection: 'row', gap: 10 },
  exportButton: { flex: 1, minHeight: 50, borderRadius: 15, backgroundColor: '#24203b', alignItems: 'center', justifyContent: 'center' },
  exportText: { color: '#fff', fontWeight: '800' },
  shareButton: { width: 100, minHeight: 50, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6e2f1', alignItems: 'center', justifyContent: 'center' },
  shareText: { color: '#39334f', fontWeight: '800' },
  disabled: { opacity: 0.45 },
  loading: { ...StyleSheet.absoluteFillObject, backgroundColor: '#29223f88', alignItems: 'center', justifyContent: 'center' },
  footer: { textAlign: 'center', fontSize: 11, color: '#8b879b', marginTop: 28, lineHeight: 17 }
});
