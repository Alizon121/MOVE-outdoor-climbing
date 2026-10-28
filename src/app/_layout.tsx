import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import migrations from '../../drizzle/migrations';
import { db } from '@/db/client';
import '@/i18n';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    migrate(db, migrations)
      .catch((e) => console.error('Database migration failed', e))
      .finally(() => {
        setReady(true);
        void SplashScreen.hideAsync();
      });
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Tabs screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" options={{ title: t('tabs.explore') }} />
          <Tabs.Screen name="map" options={{ title: t('tabs.map') }} />
          <Tabs.Screen name="logbook" options={{ title: t('tabs.logbook') }} />
          <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
        </Tabs>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
