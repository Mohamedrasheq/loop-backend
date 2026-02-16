# Expo Integration Guide: AI Assistant

This guide explains how to fetch and display the AI Assistant's conversational guidance in your Expo/React Native app.

## Endpoint
**Method**: `GET`  
**URL**: `http://localhost:3000/api/assistant?userId=CLERK_USER_ID`

---

## Integration Strategy

### 1. Requirements
- Your Expo app should have `@clerk/clerk-expo` installed and configured.
- You must have a Clerk `userId` to pass to the API.

### 2. Expo Component Example

Here is a clean implementation using `fetch` and Clerk's `useUser` hook.

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useUser } from '@clerk/clerk-expo';

export const AIAssistant = () => {
  const { user, isLoaded } = useUser();
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchGuidance = async () => {
    if (!isLoaded || !user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/assistant?userId=${user.id}`);
      const data = await response.json();
      
      if (data.message) {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch assistant guidance:", error);
      setMessage("I'm having trouble connecting right now. Let's try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidance();
  }, [isLoaded, user?.id]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#008080" />;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.header}>AI Assistant</Text>
      <Text style={styles.message}>{message}</Text>
      
      <TouchableOpacity onPress={fetchGuidance} style={styles.button}>
        <Text style={styles.buttonText}>Refresh Analysis</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glassmorphism style
    borderRadius: 16,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008080',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  button: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#008080',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  }
});
```

---

## Technical Details

### Performance Optimization
The backend is optimized for the mobile experience:
- **Fast Responses**: If the user has no tasks, the API returns a default "all caught up" message instantly without calling OpenAI (0ms LLM latency).
- **Single Pass**: Task prioritization and conversational tone are handled in one LLM request to reduce multi-step latency over mobile networks.

### Security
Ensure your backend environment (or middleware) allows requests from your Expo development environment (usually `localhost:19000` or the specific IP displayed in your terminal).
