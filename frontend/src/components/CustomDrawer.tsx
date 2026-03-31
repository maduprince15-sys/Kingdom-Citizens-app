import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { colors } from '../../src/components/ThemedComponents';

interface DrawerItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  isActive?: boolean;
  onPress: () => void;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ icon, label, route, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.drawerItem, isActive && styles.drawerItemActive]}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={22}
      color={isActive ? colors.primary : colors.textSecondary}
    />
    <Text style={[styles.drawerItemText, isActive && styles.drawerItemTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function CustomDrawer(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useUserStore();

  const isActive = (route: string) => pathname === route || pathname.startsWith(route + '/');

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const menuItems = [
    { icon: 'home', label: 'Home', route: '/(tabs)' },
    { icon: 'calendar', label: 'Sessions', route: '/(tabs)/sessions' },
    { icon: 'heart', label: 'Prayer Requests', route: '/(tabs)/prayers' },
    { icon: 'chatbubbles', label: 'Messages', route: '/(tabs)/messages' },
    { icon: 'book', label: 'Verse Discussions', route: '/verses' },
    { icon: 'play-circle', label: 'Media', route: '/media' },
    { icon: 'document-text', label: 'Study Notes', route: '/notes' },
    { icon: 'people', label: 'Members', route: '/members' },
    { icon: 'people-circle', label: 'Groups', route: '/groups' },
    { icon: 'megaphone', label: 'Announcements', route: '/announcements' },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Logo and User Info */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Kingdom Citizens</Text>
        
        {currentUser && (
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleText}>{currentUser.role}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <DrawerItem
            key={item.route}
            icon={item.icon as keyof typeof Ionicons.glyphMap}
            label={item.label}
            route={item.route}
            isActive={isActive(item.route)}
            onPress={() => router.push(item.route as any)}
          />
        ))}

        {/* Admin Panel - Only for admins/leaders */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'leader') && (
          <>
            <View style={styles.divider} />
            <DrawerItem
              icon="shield"
              label="Admin Panel"
              route="/admin"
              isActive={isActive('/admin')}
              onPress={() => router.push('/admin')}
            />
          </>
        )}

        {/* Profile & Settings */}
        <View style={styles.divider} />
        <DrawerItem
          icon="person"
          label="My Profile"
          route="/(tabs)/profile"
          isActive={isActive('/(tabs)/profile')}
          onPress={() => router.push('/(tabs)/profile')}
        />
        <DrawerItem
          icon="settings"
          label="Edit Profile"
          route="/edit-profile"
          isActive={isActive('/edit-profile')}
          onPress={() => router.push('/edit-profile')}
        />
      </ScrollView>

      {/* Footer with Logout */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        {/* YouTube Channel Link */}
        <TouchableOpacity 
          style={styles.channelLink}
          onPress={() => router.push('https://www.youtube.com/@Thecitizensmission' as any)}
        >
          <Ionicons name="logo-youtube" size={18} color="#FF0000" />
          <Text style={styles.channelText}>@Thecitizensmission</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  roleTag: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  drawerItemActive: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
  },
  drawerItemText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 14,
  },
  drawerItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
    marginHorizontal: 20,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 15,
    color: colors.error,
    marginLeft: 12,
  },
  channelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  channelText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});
