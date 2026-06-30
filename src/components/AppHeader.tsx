// Shared header component used across all main screens
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { Bell, X, User } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listMyNotifications } from '../data/notifications';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

export const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = () => {
    let mounted = true;
    listMyNotifications(5)
      .then(rows => {
        if (mounted) setNotifications(rows);
      })
      .catch(() => {
        if (mounted) setNotifications([]);
      });
    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    return loadNotifications();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return loadNotifications();
    }, [])
  );

  return (
    <>
      <View style={[s.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={s.logoRow}>
          <Image source={require('../assets/logo.png')} style={s.logoImg} resizeMode="contain" />
          <View style={s.logoTextWrap}>
            <Text style={s.headerTitle}>SportFund</Text>
            <Text style={s.headerSub}>Personal Tracker</Text>
          </View>
        </View>
        <View style={s.flexSpacer} />
        <TouchableOpacity style={s.iconBtn} onPress={() => setShowNotif(true)}>
          <Bell size={18} color={C.neutral} />
          {notifications.length > 0 ? <View style={s.notifDot} /> : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={s.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <User size={18} color={C.accentBg} />
        </TouchableOpacity>
      </View>

      <Modal visible={showNotif} transparent animationType="fade">
        <TouchableOpacity style={s.notifOverlay} activeOpacity={1} onPress={() => setShowNotif(false)}>
          <View style={s.notifPanel}>
            <View style={s.notifHeaderRow}>
              <Text style={s.notifTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotif(false)}>
                <X size={18} color={C.neutral} />
              </TouchableOpacity>
            </View>
            {notifications.length === 0 ? (
              <Text style={s.notifEmpty}>No notifications yet.</Text>
            ) : notifications.map(n => (
              <View key={n.id} style={s.notifItem}>
                <Text style={s.notifIcon}>{n.icon}</Text>
                <View style={s.notifBody}>
                  <Text style={s.notifItemTitle}>{n.title}</Text>
                  <Text style={s.notifItemDesc}>{n.desc}</Text>
                </View>
                <Text style={s.notifTime}>{n.time}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoImg: { width: 36, height: 36, borderRadius: 8 },
  logoTextWrap: { marginLeft: 10 },
  flexSpacer: { flex: 1 },
  headerTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  headerSub: { color: C.neutral, fontSize: 11, marginTop: 1 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  iconBtnAccent: { backgroundColor: C.accent, borderColor: C.accent },
  profileBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.accent, marginLeft: 10 },
  notifDot: { position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent, borderWidth: 1.5, borderColor: C.card },
  notifOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 100, paddingHorizontal: 16 },
  notifPanel: { backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  notifHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  notifTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border },
  notifIcon: { fontSize: 22, marginRight: 12 },
  notifBody: { flex: 1 },
  notifItemTitle: { color: C.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  notifItemDesc: { color: C.neutral, fontSize: 12, lineHeight: 17 },
  notifTime: { color: C.neutral, fontSize: 11, marginLeft: 8 },
  notifEmpty: { color: C.neutral, fontSize: 13, paddingVertical: 8 },
});
