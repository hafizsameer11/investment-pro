import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, SectionTitle, Button, Input } from '../components/UI';
import { usd } from '../utils/format';
import { investmentService } from '../services/investmentService';
import { chainService, Chain } from '../services/chainService';
import Toast from 'react-native-toast-message';

const depositSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Amount must be greater than 0'),
  crypto: z.string().min(1, 'Please select a cryptocurrency'),
  transactionHash: z.string().min(1, 'Transaction hash is required'),
  notes: z.string().optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;

export default function DepositScreen() {
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [loadingChains, setLoadingChains] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: '',
      crypto: 'USDT',
      transactionHash: '',
      notes: '',
    },
  });

  // Load available chains on component mount
  useEffect(() => {
    loadChains();
  }, []);

  const loadChains = async () => {
    try {
      setLoadingChains(true);
      const chainsData = await chainService.getChains();
      console.log("🟢 Chains data: 456", chainsData);
      setChains(chainsData);
      if (chainsData?.length > 0) {
        setSelectedChain(chainsData[0]); // Set first chain as default
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Chains Error',
        text2: `Failed to load wallet addresses: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setLoadingChains(false);
    }
  };

  const handleChainSelect = (chain: Chain) => {
    setSelectedChain(chain);
    setSelectedCrypto(chain.type.split(' ')[0]); // Extract crypto name from type
  };

  const copyToClipboard = (text: string) => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Copied!', 'Address copied to clipboard');
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedImage(result.assets[0].uri);
        Toast.show({
          type: 'success',
          text1: 'Image Selected',
          text2: 'Transaction screenshot uploaded successfully',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'Failed to upload image. Please try again.',
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  const onSubmit = async (data: DepositFormData) => {
    if (!selectedChain) {
      Alert.alert('Error', 'Please select a cryptocurrency first.');
      return;
    }

    // Image upload is optional for now
    // if (!uploadedImage) {
    //   Alert.alert('Error', 'Please upload a transaction screenshot.');
    //   return;
    // }

    setIsSubmitting(true);
    try {
      const depositData = {
        amount: parseFloat(data.amount),
        transaction_hash: data.transactionHash,
        crypto_type: data.crypto,
        chain_id: selectedChain.id,
        notes: data.notes,
        deposit_picture: uploadedImage || null, // Include the uploaded image or null
      };
      
      await investmentService.createDeposit(depositData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Your deposit request has been submitted successfully!',
        position: 'top',
        visibilityTime: 4000,
      });
      reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Deposit Error',
        text2: `Failed to submit deposit request: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cryptoOptions = [
    { value: 'USDT', label: 'USDT - Tether USD' },
    { value: 'BTC', label: 'BTC - Bitcoin' },
    { value: 'ETH', label: 'ETH - Ethereum' },
    { value: 'DOGE', label: 'DOGE - Dogecoin' },
  ];

  const planOptions = [
    { value: 'starter', label: 'Starter Plan (15% Weekly)' },
    { value: 'growth', label: 'Growth Plan (15% Weekly)' },
    { value: 'premium', label: 'Premium Plan (30% Weekly)' },
  ];
console.log("Chains",chains)
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crypto Deposit</Text>
          <Text style={styles.subtitle}>
            Make a secure deposit using cryptocurrency. We support USDT, Bitcoin, Dogecoin, and Ethereum.
          </Text>
        </View>

        {/* Deposit Details */}
        <Card>
          <SectionTitle 
            title="Deposit Details" 
            subtitle="Complete the form below to submit your deposit request."
          />

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Deposit Amount (USD)"
                placeholder="Enter amount in USD"
                value={value}
                onChangeText={onChange}
                error={errors.amount?.message}
              />
            )}
          />

          {/* Cryptocurrency Selection */}
          <View style={styles.cryptoSelection}>
            <Text style={styles.cryptoLabel}>Select Cryptocurrency:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cryptoScroll}>
              {chains?.map((chain) => (
                <TouchableOpacity
                  key={chain.id}
                  style={[
                    styles.cryptoOption,
                    selectedChain?.id === chain.id && styles.selectedCryptoOption
                  ]}
                  onPress={() => {
                    handleChainSelect(chain);
                    // Update form value
                    const formValue = chain.type.split(' ')[0]; // Extract crypto name
                    setValue('crypto', formValue);
                  }}
                >
                  <Text style={[
                    styles.cryptoOptionText,
                    selectedChain?.id === chain.id && styles.selectedCryptoOptionText
                  ]}>
                    {chain.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.crypto && <Text style={styles.errorText}>{errors.crypto.message}</Text>}
          </View>

          <Controller
            control={control}
            name="transactionHash"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Transaction Hash"
                placeholder="Enter your transaction hash from wallet"
                value={value}
                onChangeText={onChange}
                error={errors.transactionHash?.message}
              />
            )}
          />

          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>Upload Transaction Screenshot</Text>
            {uploadedImage ? (
              <View style={styles.uploadedImageContainer}>
                <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} />
                <View style={styles.imageActions}>
                  <Button 
                    title="Change Image" 
                    onPress={pickImage} 
                    variant="secondary" 
                    style={styles.changeImageButton}
                  />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setUploadedImage(null)}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                <Ionicons name="cloud-upload" size={32} color="#6B7280" />
                <Text style={styles.uploadText}>Tap to upload screenshot of your crypto transaction</Text>
                <Text style={styles.uploadHint}>Supports JPG, PNG up to 5MB</Text>
              </TouchableOpacity>
            )}
          </View>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Additional Notes (Optional)"
                placeholder="Any additional information....."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                error={errors.notes?.message}
              />
            )}
          />

          <Button
            title={isSubmitting ? "Submitting..." : "Submit Deposit"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
        </Card>

        {/* Available Wallet Addresses */}
        <Card>
          <SectionTitle 
            title="Available Wallet Addresses" 
            subtitle="Select a cryptocurrency and copy the wallet address to send funds."
          />

          {loadingChains ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading wallet addresses...</Text>
            </View>
          ) : (
            <>
              {/* Chain Selection */}
              <View style={styles.chainSelection}>
                <Text style={styles.chainLabel}>Select Cryptocurrency:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainScroll}>
                  {chains?.map((chain) => (
                    <TouchableOpacity
                      key={chain.id}
                      style={[
                        styles.chainOption,
                        selectedChain?.id === chain.id && styles.selectedChainOption
                      ]}
                      onPress={() => handleChainSelect(chain)}
                    >
                      <Text style={[
                        styles.chainOptionText,
                        selectedChain?.id === chain.id && styles.selectedChainOptionText
                      ]}>
                        {chain.type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Selected Chain Wallet Address */}
              {selectedChain && (
                <View style={styles.walletSection}>
                  <Text style={styles.walletLabel}>{selectedChain.type} Wallet Address</Text>
                  <View style={styles.warningBanner}>
                    <Ionicons name="warning" size={20} color="#92400E" />
                    <Text style={styles.warningText}>
                      Only send {selectedChain.type} to this address. Sending other cryptocurrencies will result in permanent loss.
                    </Text>
                  </View>
                  <View style={styles.walletAddressContainer}>
                    <Text style={styles.walletAddress}>
                      {selectedChain.address}
                    </Text>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => copyToClipboard(selectedChain.address)}
                    >
                      <Ionicons name="copy" size={16} color="#0EA5E9" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </Card>

        {/* Deposit Instructions */}
        <Card>
          <SectionTitle 
            title="Deposit Instructions" 
            subtitle="Follow these steps to complete your deposit."
          />

          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>Deposit Instructions:</Text>
            <View style={styles.instructionSteps}>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>1.</Text>
                <Text style={styles.stepText}>Send your USDT to the wallet address above</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>2.</Text>
                <Text style={styles.stepText}>Wait for blockchain confirmation (usually 3-6 confirmations)</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>3.</Text>
                <Text style={styles.stepText}>Copy the transaction hash from your wallet</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>4.</Text>
                <Text style={styles.stepText}>Upload a screenshot of the transaction</Text>
              </View>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>5.</Text>
                <Text style={styles.stepText}>Fill out the form and submit</Text>
              </View>
            </View>
          </View>

          <View style={styles.processingNote}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.processingText}>
              Fast Processing: Crypto deposits are usually processed within 2-4 hours after blockchain confirmation. 
              You'll receive an email notification once complete.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
  },
  uploadHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  uploadedImageContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeImageButton: {
    flex: 1,
    marginRight: 8,
  },
  removeImageButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  submitButton: {
    marginTop: 8,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  walletSection: {
    marginBottom: 20,
  },
  walletLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  walletAddress: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1F2937',
  },
  copyButton: {
    padding: 8,
  },
  instructionsSection: {
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  instructionSteps: {
    marginLeft: 8,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0EA5E9',
    marginRight: 8,
    minWidth: 20,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  processingNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
  },
  processingText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  chainSelection: {
    marginBottom: 20,
  },
  chainLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  chainScroll: {
    flexDirection: 'row',
  },
  chainOption: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedChainOption: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  chainOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedChainOptionText: {
    color: '#FFFFFF',
  },
  cryptoSelection: {
    marginBottom: 20,
  },
  cryptoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  cryptoScroll: {
    flexDirection: 'row',
  },
  cryptoOption: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCryptoOption: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  cryptoOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedCryptoOptionText: {
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});
