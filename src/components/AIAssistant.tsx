import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react-native';
import { getGeminiResponse } from '../services/geminiService';

const PANEL_HEIGHT = 400;
const TAB_BAR_HEIGHT = 90;

// Removed getMockResponse since we use actual Gemini API now

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
    { role: 'ai', text: "Hi! I'm your SportFund AI. Ask me about spending, performance, or equipment. 🏸" },
  ]);
  const [inputText, setInputText] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (textOverride?: string) => {
    const msg = (textOverride ?? inputText).trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInputText('');
    setThinking(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    
    const responseText = await getGeminiResponse(msg);
    
    setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    setThinking(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <>
      {/* FAB */}
      {!open && (
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setOpen(true)}>
          <MessageCircle color="#165281" size={26} />
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
                  <Sparkles color="#b7ff00" size={16} />
                  <Text style={styles.headerTitle}>AI Assistant</Text>
                </View>
                <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                  <X color="#f3ead7" size={18} />
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
                    <ActivityIndicator size="small" color="#f3ead7" />
                    <Text style={{ color: '#f3ead7', fontSize: 12, marginLeft: 8 }}>Thinking...</Text>
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
                  placeholderTextColor="rgba(243,234,215,0.5)"
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
                  <Send color="#165281" size={14} />
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
    backgroundColor: '#b7ff00',
    justifyContent: 'center', alignItems: 'center',
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    backgroundColor: 'rgba(10,61,98,0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.12, shadowRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#f3ead7', fontSize: 15, fontWeight: '700', marginLeft: 8 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  chatArea: { flex: 1 },
  chatContent: { padding: 12, paddingBottom: 4 },
  bubble: { maxWidth: '88%', padding: 11, borderRadius: 16, marginBottom: 6 },
  aiBubble: { backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', borderTopLeftRadius: 4 },
  userBubble: { backgroundColor: '#b7ff00', alignSelf: 'flex-end', borderTopRightRadius: 4 },
  bubbleText: { fontSize: 13, color: '#f3ead7', lineHeight: 19 },
  userText: { color: '#165281' },
  chipsScroll: { maxHeight: 46, flexShrink: 0 },
  chipsRow: { paddingHorizontal: 12, alignItems: 'center', paddingVertical: 6 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, height: 30,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  chipText: { color: '#f3ead7', fontSize: 11, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1, height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20,
    paddingHorizontal: 16, fontSize: 13, color: '#f3ead7',
    marginRight: 10,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#b7ff00', justifyContent: 'center', alignItems: 'center' },
  sendBtnOff: { backgroundColor: 'rgba(183,255,0,0.3)' },
});
