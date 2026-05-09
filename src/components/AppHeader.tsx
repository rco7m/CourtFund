// Shared header component used across all main screens
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { Bell, X, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const NOTIFICATIONS = [
  { id: 1, icon: '🏸', title: 'Session Reminder', desc: 'Badminton tonight at 6 PM, Court 1.', time: '2h ago' },
  { id: 2, icon: '💰', title: 'Cost Split Request', desc: 'Mike sent you a split request for $10.', time: '5h ago' },
  { id: 3, icon: '📦', title: 'Shuttle Alert', desc: 'Stock running low — order within 7 days.', time: '1d ago' },
];

export const AppHeader = () => {
  const navigation = useNavigation<any>();
  const [showNotif, setShowNotif] = useState(false);

  return (
    <>
      <View style={s.header}>
        <View style={s.logoRow}>
          <Image source={require('../assets/logo.png')} style={s.logoImg} resizeMode="contain" />
          <View style={{ marginLeft: 10 }}>
            <Text style={s.headerTitle}>CourtFund</Text>
            <Text style={s.headerSub}>Personal Tracker</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={s.iconBtn} onPress={() => setShowNotif(true)}>
          <Bell size={18} color={C.neutral} />
          <View style={s.notifDot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.iconBtn, s.iconBtnAccent, { marginLeft: 10 }]}
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
            {NOTIFICATIONS.map(n => (
              <View key={n.id} style={s.notifItem}>
                <Text style={s.notifIcon}>{n.icon}</Text>
                <View style={{ flex: 1 }}>
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
  headerTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  headerSub: { color: C.neutral, fontSize: 11, marginTop: 1 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  iconBtnAccent: { backgroundColor: C.accent, borderColor: C.accent },
  notifDot: { position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: C.accent, borderWidth: 1.5, borderColor: C.card },
  notifOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 100, paddingHorizontal: 16 },
  notifPanel: { backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  notifHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  notifTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border },
  notifIcon: { fontSize: 22, marginRight: 12 },
  notifItemTitle: { color: C.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  notifItemDesc: { color: C.neutral, fontSize: 12, lineHeight: 17 },
  notifTime: { color: C.neutral, fontSize: 11, marginLeft: 8 },
});
