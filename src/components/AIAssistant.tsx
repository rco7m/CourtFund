import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react-native';

const PANEL_HEIGHT = 400;
const TAB_BAR_HEIGHT = 90;

const getMockResponse = (input: string): string => {
  const q = input.toLowerCase();
  if (q.includes('spend') || q.includes('month') || q.includes('cost'))
    return "💰 This month you've spent $283.50 total — $90.00 on court bookings and $193.50 on equipment & gear. You're 17% under your monthly average of $340.";
  if (q.includes('shuttle') || q.includes('order') || q.includes('stock'))
    return "📦 Based on your burn rate of 2 tubes/week, you have ~7 days of stock left. I recommend ordering 6 shuttle tubes by Thursday to avoid disruption.";
  if (q.includes('injury') || q.includes('risk') || q.includes('rest'))
    return "⚠️ You've logged ~5 sessions this week — above your average of 3. Your injury risk is Moderate. Consider taking tomorrow as a rest day.";
  if (q.includes('skill') || q.includes('level') || q.includes('progress'))
    return "📈 Your current skill level is A- based on 5 logged sessions. Strongest: Footwork (79%). Most room to improve: Defense (72%).";
  if (q.includes('session') || q.includes('play') || q.includes('rating'))
    return "🏸 You've logged 5 sessions this month with an avg rating of 4.0 ⭐. Best session: Singles on Mar 10 (5 stars). Keep it up!";
  if (q.includes('streak') || q.includes('days'))
    return "🔥 You're on a 6-day streak! You've played 6 hours this month. Consistency is your biggest strength!";
  if (q.includes('book') || q.includes('court'))
    return "📅 Your next booking is Court 2 on Monday at 6:00 PM (90 min). Court 1 is also available Saturday at 10:00 AM.";
  if (q.includes('saving') || q.includes('cheaper') || q.includes('price'))
    return "💡 BadmintonDirect offers AS-30 tubes at $28.50 vs your current $35.00 — saving $6.50/tube (~$42/month at your usage rate).";
  return "🤔 Great question! Based on your recent activity everything looks on track. Want me to dig into spending, equipment health, or performance?";
};

type Message = { role: 'user' | 'ai'; text: string };

const CHIPS = [
  { label: 'Spending?',      query: 'How much did I spend this month?' },
  { label: 'Order shuttles?',query: 'When should I order shuttles?' },
  { label: 'Injury risk?',   query: 'Am I at injury risk?' },
  { label: 'Skill level?',   query: 'What is my skill level?' },
  { label: 'Cost savings?',  query: 'Any cost savings found?' },
];

export const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm your CourtFund AI. Ask me about spending, performance, or equipment. 🏸" },
  ]);
  const [inputText, setInputText] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = (textOverride?: string) => {
    const msg = (textOverride ?? inputText).trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInputText('');
    setThinking(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: getMockResponse(msg) }]);
      setThinking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 900);
  };

  return (
    <>
      {/* FAB */}
      {!open && (
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setOpen(true)}>
          <MessageCircle color="#0D2B4A" size={26} />
        </TouchableOpacity>
      )}

      {/* Floating Panel */}
      {open && (
        <>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'position' : undefined}
            keyboardVerticalOffset={TAB_BAR_HEIGHT + 10}
            style={styles.kavWrapper}
          >
            <View style={styles.panel}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Sparkles color="#DEA54B" size={16} />
                  <Text style={styles.headerTitle}>AI Assistant</Text>
                </View>
                <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                  <X color="#8A9BB3" size={18} />
                </TouchableOpacity>
              </View>

              {/* Messages */}
              <ScrollView
                ref={scrollRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((m, i) => (
                  <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                    <Text style={[styles.bubbleText, m.role === 'user' && styles.userText]}>{m.text}</Text>
                  </View>
                ))}
                {thinking && (
                  <View style={[styles.bubble, styles.aiBubble, { flexDirection: 'row', alignItems: 'center' }]}>
                    <ActivityIndicator size="small" color="#5B738B" />
                    <Text style={{ color: '#5B738B', fontSize: 12, marginLeft: 8 }}>Thinking...</Text>
                  </View>
                )}
              </ScrollView>

              {/* Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
                style={styles.chipsScroll}
              >
                {CHIPS.map((c, i) => (
                  <TouchableOpacity key={i} style={styles.chip} onPress={() => send(c.query)}>
                    <Text style={styles.chipText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Input row */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask anything..."
                  placeholderTextColor="#8A9BB3"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => send()}
                  returnKeyType="send"
                  multiline={false}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !inputText.trim() && styles.sendBtnOff]}
                  onPress={() => send()}
                  disabled={!inputText.trim()}
                >
                  <Send color="#FFF" size={14} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 16, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#D4AF37',
    justifyContent: 'center', alignItems: 'center',
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 200,
  },
  kavWrapper: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + 10,
    left: 12, right: 12,
    zIndex: 300,
  },
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.12, shadowRadius: 12,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#13284B',
    paddingHorizontal: 18, paddingVertical: 14,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginLeft: 8 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  chatArea: { flex: 1 },
  chatContent: { padding: 12, paddingBottom: 4 },
  bubble: { maxWidth: '88%', padding: 11, borderRadius: 16, marginBottom: 6 },
  aiBubble: { backgroundColor: '#E8EBEF', alignSelf: 'flex-start', borderTopLeftRadius: 4 },
  userBubble: { backgroundColor: '#208B59', alignSelf: 'flex-end', borderTopRightRadius: 4 },
  bubbleText: { fontSize: 13, color: '#13284B', lineHeight: 19 },
  userText: { color: '#FFF' },
  chipsScroll: { maxHeight: 46, flexShrink: 0 },
  chipsRow: { paddingHorizontal: 12, alignItems: 'center', paddingVertical: 6 },
  chip: {
    backgroundColor: '#F0F2F5', paddingHorizontal: 12, height: 30,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipText: { color: '#13284B', fontSize: 11, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#F0F2F5',
  },
  input: {
    flex: 1, height: 40,
    backgroundColor: '#F0F2F5', borderRadius: 20,
    paddingHorizontal: 16, fontSize: 13, color: '#13284B',
    marginRight: 10,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#208B59', justifyContent: 'center', alignItems: 'center' },
  sendBtnOff: { backgroundColor: '#A2CBB6' },
});
