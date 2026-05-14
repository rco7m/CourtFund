import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ExternalLink, CheckCircle, Plus,
  User, Flag, MapPin, Calendar, Clock, ChevronDown, X, Check,
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { createScheduleEvent } from '../data/schedule';
import { minutesFromDurationLabel, parseLocalDateTime } from '../lib/datetime';

const C = {
  bg: '#0A0F1E', card: '#1A2235', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.3)',
};

const NEARBY_COURTS = [
  'CourtHive Arena — 0.3 km',
  'Smash Palace — 0.8 km',
  'Elite Padel Club — 1.2 km',
  'Urban Sports Hub — 1.5 km',
  'Ace Badminton Centre — 2.1 km',
];

const SPORTS = ['Badminton', 'Padel', 'Tennis', 'Squash', 'Pickleball'];
const DURATIONS = ['1 Hour', '1.5 Hours', '2 Hours', '2.5 Hours', '3 Hours'];

const OrganizeModal = ({ visible, onClose }: any) => {
  const insets = useSafeAreaInsets();
  const [sport, setSport] = useState('Badminton');
  const [court, setCourt] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('1.5 Hours');
  const [showCourts, setShowCourts] = useState(false);
  const [showSports, setShowSports] = useState(false);
  const [showDurations, setShowDurations] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorText(null);
    try {
      setSaving(true);
      const start = parseLocalDateTime(date, time);
      const durationMinutes = minutesFromDurationLabel(duration);
      const startDate = start ?? new Date();
      const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

      await createScheduleEvent({
        title: `${sport} Session`,
        tag: 'session',
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        details: court ? `Court: ${court}` : null,
      });
      onClose();
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[om.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={om.backBtn} onPress={onClose}>
            <X size={18} color={C.neutral} />
          </TouchableOpacity>
          <Text style={om.title}>Organize Session</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={om.sectionLabel}>SELECT SPORT</Text>
          <TouchableOpacity style={om.picker} onPress={() => setShowSports(!showSports)}>
            <Flag size={15} color={C.accent} style={{ marginRight: 10 }} />
            <Text style={om.pickerText}>{sport}</Text>
            <ChevronDown size={15} color={C.neutral} />
          </TouchableOpacity>
          {showSports && (
            <View style={om.dropdown}>
              {SPORTS.map(s => (
                <TouchableOpacity key={s} style={om.dropdownItem} onPress={() => { setSport(s); setShowSports(false); }}>
                  <Text style={[om.dropdownText, sport === s && { color: C.accent }]}>{s}</Text>
                  {sport === s && <Check size={14} color={C.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={om.sectionLabel}>COURT LOCATION</Text>
          <TouchableOpacity style={om.picker} onPress={() => setShowCourts(!showCourts)}>
            <MapPin size={15} color={C.accent} style={{ marginRight: 10 }} />
            <Text style={[om.pickerText, !court && { color: C.neutral }]}>
              {court || 'Select nearby court...'}
            </Text>
            <ChevronDown size={15} color={C.neutral} />
          </TouchableOpacity>
          {showCourts && (
            <View style={om.dropdown}>
              {NEARBY_COURTS.map(c => (
                <TouchableOpacity key={c} style={om.dropdownItem} onPress={() => { setCourt(c); setShowCourts(false); }}>
                  <MapPin size={13} color={C.neutral} style={{ marginRight: 8 }} />
                  <Text style={[om.dropdownText, court === c && { color: C.accent }]}>{c}</Text>
                  {court === c && <Check size={14} color={C.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={om.sectionLabel}>DATE</Text>
          <View style={om.picker}>
            <Calendar size={15} color={C.accent} style={{ marginRight: 10 }} />
            <TextInput
              style={om.pickerInput}
              placeholder="e.g. Saturday, May 17"
              placeholderTextColor={C.neutral}
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={om.sectionLabel}>START TIME</Text>
              <View style={om.picker}>
                <Clock size={15} color={C.accent} style={{ marginRight: 10 }} />
                <TextInput
                  style={om.pickerInput}
                  placeholder="e.g. 18:00"
                  placeholderTextColor={C.neutral}
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={om.sectionLabel}>DURATION</Text>
              <TouchableOpacity style={om.picker} onPress={() => setShowDurations(!showDurations)}>
                <Text style={om.pickerText}>{duration}</Text>
                <ChevronDown size={15} color={C.neutral} />
              </TouchableOpacity>
            </View>
          </View>
          {showDurations && (
            <View style={[om.dropdown, { marginHorizontal: 20 }]}>
              {DURATIONS.map(d => (
                <TouchableOpacity key={d} style={om.dropdownItem} onPress={() => { setDuration(d); setShowDurations(false); }}>
                  <Text style={[om.dropdownText, duration === d && { color: C.accent }]}>{d}</Text>
                  {duration === d && <Check size={14} color={C.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {court && date && (
            <View style={om.previewCard}>
              <Text style={om.previewLabel}>SESSION PREVIEW</Text>
              <Text style={om.previewSport}>{sport}</Text>
              <Text style={om.previewDetail}><MapPin size={12} color={C.neutral} /> {court}</Text>
              <Text style={om.previewDetail}><Calendar size={12} color={C.neutral} /> {date}{time ? ` • ${time}` : ''} • {duration}</Text>
            </View>
          )}

          {errorText ? <Text style={om.errorText}>{errorText}</Text> : null}

          <TouchableOpacity style={om.saveBtn} onPress={handleSave}>
            <CheckCircle size={16} color={C.accentBg} style={{ marginRight: 8 }} />
            <Text style={om.saveBtnText}>{saving ? 'SAVING…' : 'CONFIRM SESSION'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const BookScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [showOrganize, setShowOrganize] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ paddingTop: insets.top + 10 }}>
        <AppHeader />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.heroSection}>
          <Text style={s.heroTitle}>{`{Sport} Match\nOrganizer`}</Text>
          <Text style={s.heroSub}>Configure your session and split expenses seamlessly.</Text>
        </View>

        {/* Selected Venue */}
        <View style={s.card}>
          <View style={s.cardLabelRow}>
            <Text style={s.cardLabel}>SELECTED VENUE</Text>
            <TouchableOpacity><ExternalLink size={14} color={C.accent} /></TouchableOpacity>
          </View>
          <Text style={s.venueTitle}>{`{Venue Name}`}</Text>
          <View style={s.courtImageBox}>
            <Text style={s.courtImageLabel}>🏸</Text>
          </View>
          <View style={s.venueMetaRow}>
            <View style={s.venueMeta}>
              <Text style={s.venueMetaLabel}>DATE & TIME</Text>
              <Text style={s.venueMetaValue}>{`{Day},\n{Month}\n{Date} • {Time}`}</Text>
            </View>
            <View style={s.venueMetaDivider} />
            <View style={s.venueMeta}>
              <Text style={s.venueMetaLabel}>DURATION</Text>
              <Text style={s.venueMetaValue}>{`{Hours}\nSession`}</Text>
            </View>
          </View>
        </View>

        {/* External Booking */}
        <View style={s.card}>
          <View style={s.portalRow}>
            <View style={s.portalIcon}><ExternalLink size={18} color={C.accent} /></View>
            <Text style={s.portalTitle}>External Booking{'\n'}Portal</Text>
          </View>
          <Text style={s.portalDesc}>
            Complete your payment and finalize court reservation via{' '}
            <Text style={{ color: C.accent, fontWeight: '600' }}>{`{Booking Engine Name}`}</Text>{' '}
            before inviting players.
          </Text>
          <TouchableOpacity style={s.portalBtn}>
            <Text style={s.portalBtnText}>{`Open {Booking Engine Name}`}</Text>
            <ExternalLink size={13} color={C.bg} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Invite Players */}
        <View style={s.card}>
          <View style={s.inviteHeaderRow}>
            <Text style={s.inviteTitle}>Invite{'\n'}Players</Text>
            <View style={s.slotsBadge}><Text style={s.slotsBadgeText}>{`{Filled}/{Total}\nSlots`}</Text></View>
          </View>
          <View style={s.playerRow}>
            <View style={s.playerAvatar}><Text style={s.playerAvatarText}>Y</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.playerName}>You</Text>
              <View style={s.hostBadge}><Text style={s.hostBadgeText}>HOST</Text></View>
            </View>
            <CheckCircle size={18} color={C.accent} />
          </View>
          <View style={s.divider} />
          <TouchableOpacity style={s.inviteRow}>
            <View style={s.addCircle}><Plus size={16} color={C.neutral} /></View>
            <Text style={s.inviteRowText}>Invite Teammate</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          <View style={s.inviteRow}>
            <View style={[s.addCircle, { borderStyle: 'dashed' }]}><User size={14} color={C.neutral} /></View>
            <Text style={s.inviteRowText}>Open Slot</Text>
          </View>
        </View>

        {/* Cost Split */}
        <View style={s.card}>
          <Text style={s.costTitle}>Cost Split Preview</Text>
          {[['Total Session Cost','${Total Cost}'],['Court Fee','${Fee}'],['Platform Handling','${Admin}']].map(([l,v]) => (
            <View key={l} style={s.costRow}>
              <Text style={s.costLabel}>{l}</Text>
              <Text style={s.costValue}>{v}</Text>
            </View>
          ))}
          <View style={s.divider} />
          <Text style={s.shareLabel}>YOUR INDIVIDUAL{'\n'}SHARE</Text>
          <View style={s.shareRow}>
            <Text style={s.shareAmount}>{`$\{Share\}`}<Text style={s.shareCursor}>_</Text></Text>
            <Text style={s.shareSplit}>Split between{'\n'}{`{Players}`} ppl</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={s.ctaBtn} onPress={() => setShowOrganize(true)}>
          <Flag size={16} color={C.bg} style={{ marginRight: 10 }} />
          <Text style={s.ctaBtnText}>{`Organize {Sport} Session`}</Text>
        </TouchableOpacity>
      </ScrollView>

      <OrganizeModal visible={showOrganize} onClose={() => setShowOrganize(false)} />
    </View>
  );
};

const s = StyleSheet.create({
  heroSection:{paddingHorizontal:20,paddingTop:12,paddingBottom:24},
  heroTitle:{color:C.accent,fontSize:34,fontWeight:'800',lineHeight:40,letterSpacing:-0.5},
  heroSub:{color:C.neutral,fontSize:13,marginTop:10,lineHeight:20},
  card:{backgroundColor:C.card,marginHorizontal:20,marginBottom:14,borderRadius:18,padding:20,borderWidth:1,borderColor:C.border},
  cardLabelRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:6},
  cardLabel:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1.5},
  venueTitle:{color:C.text,fontSize:20,fontWeight:'700',marginBottom:14},
  courtImageBox:{height:130,borderRadius:12,backgroundColor:'#0D1A2D',justifyContent:'center',alignItems:'center',marginBottom:16,borderWidth:1,borderColor:C.border},
  courtImageLabel:{fontSize:40},
  venueMetaRow:{flexDirection:'row'},
  venueMeta:{flex:1},
  venueMetaDivider:{width:1,backgroundColor:C.border,marginHorizontal:20},
  venueMetaLabel:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1,marginBottom:6},
  venueMetaValue:{color:C.text,fontSize:13,lineHeight:20},
  portalRow:{flexDirection:'row',alignItems:'center',marginBottom:10},
  portalIcon:{width:38,height:38,borderRadius:10,backgroundColor:C.accentMuted,borderWidth:1,borderColor:C.accentBorder,justifyContent:'center',alignItems:'center',marginRight:14},
  portalTitle:{color:C.text,fontSize:18,fontWeight:'700',lineHeight:24},
  portalDesc:{color:C.neutral,fontSize:13,lineHeight:20,marginBottom:16},
  portalBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:C.accent,borderRadius:30,paddingVertical:13},
  portalBtnText:{color:C.bg,fontWeight:'700',fontSize:14},
  inviteHeaderRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16},
  inviteTitle:{color:C.text,fontSize:20,fontWeight:'700',lineHeight:26},
  slotsBadge:{backgroundColor:C.accentMuted,borderRadius:20,paddingHorizontal:14,paddingVertical:8,borderWidth:1,borderColor:C.accentBorder},
  slotsBadgeText:{color:C.accent,fontSize:12,fontWeight:'700',textAlign:'center'},
  playerRow:{flexDirection:'row',alignItems:'center',paddingVertical:10},
  playerAvatar:{width:38,height:38,borderRadius:19,backgroundColor:C.accentMuted,borderWidth:1,borderColor:C.accentBorder,justifyContent:'center',alignItems:'center',marginRight:14},
  playerAvatarText:{color:C.accent,fontWeight:'700',fontSize:14},
  playerName:{color:C.text,fontWeight:'600',fontSize:15},
  hostBadge:{backgroundColor:'rgba(204,255,0,0.15)',alignSelf:'flex-start',paddingHorizontal:8,paddingVertical:2,borderRadius:6,marginTop:3},
  hostBadgeText:{color:C.accent,fontSize:10,fontWeight:'700',letterSpacing:0.5},
  divider:{height:1,backgroundColor:C.border,marginVertical:4},
  inviteRow:{flexDirection:'row',alignItems:'center',paddingVertical:12},
  addCircle:{width:34,height:34,borderRadius:17,borderWidth:1.5,borderColor:C.neutral,justifyContent:'center',alignItems:'center',marginRight:14},
  inviteRowText:{color:C.neutral,fontSize:14,fontWeight:'500'},
  costTitle:{color:C.text,fontSize:18,fontWeight:'700',marginBottom:16},
  costRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:10},
  costLabel:{color:C.neutral,fontSize:13},
  costValue:{color:C.text,fontSize:13,fontWeight:'600'},
  shareLabel:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1.5,marginTop:10,marginBottom:8},
  shareRow:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between'},
  shareAmount:{color:C.accent,fontSize:40,fontWeight:'800',letterSpacing:-1},
  shareCursor:{color:C.accent,fontWeight:'300'},
  shareSplit:{color:C.neutral,fontSize:12,textAlign:'right',lineHeight:18},
  ctaBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:C.accent,marginHorizontal:20,marginTop:8,borderRadius:30,paddingVertical:16},
  ctaBtnText:{color:C.bg,fontWeight:'800',fontSize:15,letterSpacing:0.5},
});

const om = StyleSheet.create({
  header:{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingBottom:16,borderBottomWidth:1,borderBottomColor:'rgba(148,163,184,0.12)'},
  backBtn:{width:36,height:36,borderRadius:10,backgroundColor:'#1E293B',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'rgba(148,163,184,0.12)',marginRight:14},
  title:{color:'#E2E8F0',fontSize:17,fontWeight:'700',flex:1,textAlign:'center'},
  sectionLabel:{fontSize:10,color:'#94A3B8',fontWeight:'700',letterSpacing:1.5,marginHorizontal:20,marginTop:20,marginBottom:8},
  picker:{flexDirection:'row',alignItems:'center',backgroundColor:'#1E293B',marginHorizontal:20,borderRadius:14,paddingHorizontal:16,height:50,borderWidth:1,borderColor:'rgba(148,163,184,0.12)',marginBottom:4},
  pickerText:{flex:1,color:'#E2E8F0',fontSize:14,fontWeight:'500'},
  pickerInput:{flex:1,color:'#E2E8F0',fontSize:14},
  dropdown:{backgroundColor:'#1A2235',marginHorizontal:20,borderRadius:14,borderWidth:1,borderColor:'rgba(148,163,184,0.12)',marginBottom:8,overflow:'hidden'},
  dropdownItem:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:13,borderBottomWidth:1,borderBottomColor:'rgba(148,163,184,0.08)'},
  dropdownText:{flex:1,color:'#94A3B8',fontSize:14},
  previewCard:{backgroundColor:'rgba(204,255,0,0.05)',marginHorizontal:20,borderRadius:14,padding:16,marginTop:16,borderWidth:1,borderColor:'rgba(204,255,0,0.2)'},
  previewLabel:{color:'#94A3B8',fontSize:10,fontWeight:'700',letterSpacing:1.5,marginBottom:8},
  previewSport:{color:'#CCFF00',fontSize:20,fontWeight:'800',marginBottom:8},
  previewDetail:{color:'#94A3B8',fontSize:13,marginBottom:4},
  saveBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#CCFF00',marginHorizontal:20,marginTop:24,borderRadius:30,paddingVertical:15},
  saveBtnText:{color:'#0A0F1E',fontSize:15,fontWeight:'800',letterSpacing:1},
  errorText:{color:'#F87171',fontWeight:'700',fontSize:13,textAlign:'center',marginHorizontal:20,marginTop:10},
});
