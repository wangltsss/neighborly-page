import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, FontSize, Spacing } from '@/constants/Theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idCounter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = idCounter.current++;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

function ToastContainer({ toasts }: ToastContainerProps) {
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top + Spacing.md }]}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} message={toast.message} type={toast.type} />
      ))}
    </View>
  );
}

interface ToastItemProps {
  message: string;
  type: ToastType;
}

function ToastItem({ message, type }: ToastItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity]);

  const backgroundColor = {
    success: '#16A34A',
    error: '#DC2626',
    info: '#2563EB',
  }[type];

  return (
    <Animated.View style={[styles.toast, { backgroundColor, opacity }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
});
