import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { API_BASE_URL } from '../services/apiConfig';
import { apiClient } from '../services/apiConfig';
import { useColors } from '../utils/colors';
import { useTheme } from '../stores/themeStore';

export default function DebugInfo() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  useEffect(() => {
    loadNetworkInfo();
  }, []);

  const loadNetworkInfo = async () => {
    try {
      const info = {
        platform: Platform.OS,
        apiBaseUrl: API_BASE_URL,
        timestamp: new Date().toISOString(),
      };
      setNetworkInfo(info);
    } catch (error) {
      console.error('Error loading network info:', error);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult('Testing connection...\n');
    
    try {
      // Test 1: Basic connectivity
      setTestResult(prev => prev + `[1] Testing connection to: ${API_BASE_URL}\n`);
      
      // Test 2: Health check endpoint
      try {
        const healthResponse = await apiClient.get('/');
        setTestResult(prev => prev + `[2] Health check: SUCCESS\n`);
        setTestResult(prev => prev + `    Response: ${JSON.stringify(healthResponse.data)}\n`);
      } catch (error: any) {
        setTestResult(prev => prev + `[2] Health check: FAILED\n`);
        setTestResult(prev => prev + `    Error: ${error.message}\n`);
        setTestResult(prev => prev + `    Status: ${error.response?.status || 'No response'}\n`);
        setTestResult(prev => prev + `    Data: ${JSON.stringify(error.response?.data || {})}\n`);
      }

      // Test 3: Login endpoint (without credentials)
      try {
        setTestResult(prev => prev + `[3] Testing login endpoint...\n`);
        await apiClient.post('/auth/login', { name: 'test', password: 'test' });
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 422) {
          setTestResult(prev => prev + `[3] Login endpoint: REACHABLE (401/422 expected)\n`);
        } else if (error.response) {
          setTestResult(prev => prev + `[3] Login endpoint: REACHABLE (Status: ${error.response.status})\n`);
        } else {
          setTestResult(prev => prev + `[3] Login endpoint: NOT REACHABLE\n`);
          setTestResult(prev => prev + `    Error: ${error.message}\n`);
          setTestResult(prev => prev + `    This is likely a network/connection issue\n`);
        }
      }

      setTestResult(prev => prev + `\n=== Test Complete ===\n`);
    } catch (error: any) {
      setTestResult(prev => prev + `\nFatal Error: ${error.message}\n`);
    } finally {
      setIsTesting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors['bg-surface'],
    },
    section: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: colors['bg-card'],
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors['border-default'],
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors['text-primary'],
      marginBottom: 12,
    },
    infoText: {
      fontSize: 14,
      color: colors['text-secondary'],
      fontFamily: 'monospace',
      marginBottom: 4,
    },
    button: {
      backgroundColor: colors['bg-primary'],
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    resultContainer: {
      marginTop: 16,
      padding: 12,
      backgroundColor: colors['bg-secondary'],
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors['border-default'],
      minHeight: 200,
    },
    resultText: {
      fontSize: 12,
      color: colors['text-primary'],
      fontFamily: 'monospace',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Network Configuration</Text>
        <Text style={styles.infoText}>Platform: {Platform.OS}</Text>
        <Text style={styles.infoText}>API Base URL: {API_BASE_URL}</Text>
        {networkInfo && (
          <>
            <Text style={styles.infoText}>Timestamp: {networkInfo.timestamp}</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Connection Test</Text>
        <Text style={styles.infoText}>
          Click the button below to test connectivity to the backend server.
        </Text>
        <TouchableOpacity
          style={[styles.button, isTesting && { opacity: 0.6 }]}
          onPress={testConnection}
          disabled={isTesting}
        >
          <Text style={styles.buttonText}>
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>

        {testResult ? (
          <View style={styles.resultContainer}>
            <ScrollView>
              <Text style={styles.resultText}>{testResult}</Text>
            </ScrollView>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Common Issues</Text>
        <Text style={styles.infoText}>
          • Android 9+ blocks HTTP by default{'\n'}
          • Check if backend is running at: {API_BASE_URL}{'\n'}
          • Ensure device has internet connection{'\n'}
          • Check console logs for detailed errors
        </Text>
      </View>
    </ScrollView>
  );
}

