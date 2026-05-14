import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../components/AppHeader';
import { listScheduleForRange, setScheduleStatus } from '../data/schedule';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const WEEKS = [
  [{ day:'Mon',date:15,hasEvent:false},{day:'Tue',date:16,hasEvent:true},{day:'Wed',date:17,hasEvent:true},{day:'Thu',date:18,hasEvent:true},{day:'Fri',date:19,hasEvent:false},{day:'Sat',date:20,hasEvent:true},{day:'Sun',date:21,hasEvent:false}],
  [{ day:'Mon',date:22,hasEvent:true},{day:'Tue',date:23,hasEvent:false},{day:'Wed',date:24,hasEvent:true},{day:'Thu',date:25,hasEvent:false},{day:'Fri',date:26,hasEvent:true},{day:'Sat',date:27,hasEvent:true},{day:'Sun',date:28,hasEvent:false}],
];
const MONTH_LABELS = ['Mar 15–21','Mar 22–28'];

type Status = 'confirmed'|'declined'|'pending';

const EventCard = ({ title, tag, isClass, details, status, onConfirm, onDecline }: any) => (
  <View style={s.eventCardWrapper}>
    <View style={s.accentBorder} />
    <View style={s.eventCard}>
      <View style={s.eventCardTop}>
        <View style={s.tagRow}>
          <View style={[s.tag, isClass ? s.tagClass : s.tagSession]}>
            <Text style={[s.tagText, isClass ? s.tagTextClass : s.tagTextSession]}>{tag}</Text>
          </View>
          {status==='confirmed' && <View style={s.confirmedRow}><Check size={12} color={C.accent} style={{marginRight:4}}/><Text style={s.confirmedText}>Confirmed</Text></View>}
          {status==='declined' && <View style={s.declinedRow}><X size={12} color="#F87171" style={{marginRight:4}}/><Text style={s.declinedText}>Declined</Text></View>}
        </View>
        {status==='pending' && (
          <View style={s.actionButtonsRow}>
            <TouchableOpacity style={s.actionAccept} onPress={onConfirm}><Check size={15} color={C.accent}/></TouchableOpacity>
            <TouchableOpacity style={s.actionDecline} onPress={onDecline}><X size={15} color="#F87171"/></TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={s.eventTitle}>{title}</Text>
      <Text style={s.eventDetails}>{details}</Text>
    </View>
  </View>
);

export const ScheduleScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [weekIdx, setWeekIdx] = useState(0);
  const [activeDate, setActiveDate] = useState(15);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const days = WEEKS[weekIdx];
  const goBack = () => { if(weekIdx>0){setWeekIdx(w=>w-1);setActiveDate(WEEKS[weekIdx-1][0].date);}};
  const goForward = () => { if(weekIdx<WEEKS.length-1){setWeekIdx(w=>w+1);setActiveDate(WEEKS[weekIdx+1][0].date);}};

  const activeDayDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), activeDate, 0, 0, 0, 0);
  }, [activeDate]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErrorText(null);
        setLoading(true);
        const start = new Date(activeDayDate);
        const end = new Date(activeDayDate);
        end.setDate(end.getDate() + 1);
        const rows = await listScheduleForRange(start.toISOString(), end.toISOString());
        if (!mounted) return;
        setEvents(rows);
      } catch (e: any) {
        if (!mounted) return;
        setErrorText(e?.message ?? 'Failed to load schedule.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeDayDate]);

  return (
    <View style={s.container}>
      <View style={{ paddingTop: insets.top + 10 }}>
        <AppHeader />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:110}}>
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>Schedule</Text>
          <Text style={s.pageDateText}>{MONTH_LABELS[weekIdx]}</Text>
        </View>

        <View style={s.dateSelectorRow}>
          <TouchableOpacity onPress={goBack} style={[s.arrowBtn,weekIdx===0&&{opacity:0.3}]}>
            <ChevronLeft size={20} color={C.neutral}/>
          </TouchableOpacity>
          {days.map(item=>{
            const isActive=activeDate===item.date;
            return (
              <TouchableOpacity key={item.date} style={[s.dateChip,isActive&&s.dateChipActive]} onPress={()=>setActiveDate(item.date)}>
                <Text style={[s.dayText,isActive&&s.textActive]}>{item.day}</Text>
                <Text style={[s.dateText,isActive&&s.textActive]}>{item.date}</Text>
                {item.hasEvent&&<View style={[s.eventDot,isActive&&{backgroundColor:C.accentBg}]}/>}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={goForward} style={[s.arrowBtn,weekIdx===WEEKS.length-1&&{opacity:0.3}]}>
            <ChevronRight size={20} color={C.neutral}/>
          </TouchableOpacity>
        </View>

        {events.length>0 ? (
          <>
            <View style={s.summaryCard}>
              <View>
                <Text style={s.summaryDate}>
                  {activeDayDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </Text>
                <Text style={s.summaryCount}>{events.length} event{events.length>1?'s':''}</Text>
              </View>
              <View style={s.durationChip}>
                <Clock size={13} color={C.accent} style={{marginRight:6}}/>
                <Text style={s.durationText}>
                  {(events as any[]).reduce((acc, e) => {
                    const a = new Date(e.start_time).getTime();
                    const b = new Date(e.end_time).getTime();
                    if (!isFinite(a) || !isFinite(b) || b <= a) return acc;
                    return acc + Math.round((b - a) / 60000);
                  }, 0)} min
                </Text>
              </View>
            </View>
            {events.map((ev: any) => {
              const start = new Date(ev.start_time);
              const end = new Date(ev.end_time);
              const details = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${Math.round(
                (end.getTime() - start.getTime()) / 60000
              )} min${ev.details ? ` • ${ev.details}` : ''}`;
              const status: Status = ev.status === 'confirmed' ? 'confirmed' : ev.status === 'declined' ? 'declined' : 'pending';
              return (
                <EventCard
                  key={ev.id}
                  title={ev.title}
                  tag={(ev.tag || 'SESSION').toUpperCase()}
                  isClass={(ev.tag || '').toLowerCase() === 'class'}
                  details={details}
                  status={status}
                  onConfirm={async () => {
                    await setScheduleStatus(ev.id, 'confirmed');
                    setEvents((prev: any[]) => prev.map(p => (p.id === ev.id ? { ...p, status: 'confirmed' } : p)));
                  }}
                  onDecline={async () => {
                    await setScheduleStatus(ev.id, 'declined');
                    setEvents((prev: any[]) => prev.map(p => (p.id === ev.id ? { ...p, status: 'declined' } : p)));
                  }}
                />
              );
            })}
          </>
        ) : loading ? (
          <View style={s.emptyState}>
            <Text style={s.emptyTitle}>Loading…</Text>
          </View>
        ) : errorText ? (
          <View style={s.emptyState}>
            <Text style={s.emptyTitle}>Error</Text>
            <Text style={s.emptyDesc}>{errorText}</Text>
          </View>
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📅</Text>
            <Text style={s.emptyTitle}>No events</Text>
            <Text style={s.emptyDesc}>No sessions scheduled for this day.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  pageHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',marginHorizontal:20,marginBottom:20},
  pageTitle:{fontSize:24,fontWeight:'800',color:C.text},
  pageDateText:{fontSize:13,color:C.neutral},
  dateSelectorRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:10,marginBottom:24},
  arrowBtn:{width:32,height:32,borderRadius:16,backgroundColor:C.card,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:C.border},
  dateChip:{width:38,paddingVertical:10,backgroundColor:C.card,borderRadius:12,alignItems:'center',borderWidth:1,borderColor:C.border},
  dateChipActive:{backgroundColor:C.accent,borderColor:C.accent},
  dayText:{fontSize:10,color:C.neutral,marginBottom:3},
  dateText:{fontSize:14,fontWeight:'700',color:C.text},
  textActive:{color:C.accentBg},
  eventDot:{width:5,height:5,borderRadius:3,backgroundColor:C.accent,marginTop:3},
  summaryCard:{marginHorizontal:20,backgroundColor:C.card,borderRadius:14,paddingHorizontal:18,paddingVertical:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:14,borderWidth:1,borderColor:C.border},
  summaryDate:{fontSize:15,fontWeight:'700',color:C.text,marginBottom:3},
  summaryCount:{fontSize:12,color:C.neutral},
  durationChip:{flexDirection:'row',alignItems:'center',backgroundColor:C.accentMuted,paddingHorizontal:12,paddingVertical:6,borderRadius:20,borderWidth:1,borderColor:C.accentBorder},
  durationText:{color:C.accent,fontWeight:'700',fontSize:13},
  eventCardWrapper:{flexDirection:'row',marginHorizontal:20,marginBottom:14,backgroundColor:C.card,borderRadius:16,overflow:'hidden',borderWidth:1,borderColor:C.border},
  accentBorder:{width:4,backgroundColor:C.accent},
  eventCard:{flex:1,padding:16},
  eventCardTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,minHeight:28},
  tagRow:{flexDirection:'row',alignItems:'center'},
  tag:{paddingHorizontal:8,paddingVertical:4,borderRadius:6,marginRight:10},
  tagSession:{backgroundColor:C.accentMuted,borderWidth:1,borderColor:C.accentBorder},
  tagClass:{backgroundColor:'rgba(148,163,184,0.1)',borderWidth:1,borderColor:C.border},
  tagText:{fontSize:10,fontWeight:'700',letterSpacing:1},
  tagTextSession:{color:C.accent},
  tagTextClass:{color:C.neutral},
  confirmedRow:{flexDirection:'row',alignItems:'center'},
  confirmedText:{fontSize:12,color:C.accent,fontWeight:'600'},
  declinedRow:{flexDirection:'row',alignItems:'center'},
  declinedText:{fontSize:12,color:'#F87171',fontWeight:'600'},
  actionButtonsRow:{flexDirection:'row',alignItems:'center'},
  actionAccept:{width:30,height:30,borderRadius:15,backgroundColor:C.accentMuted,justifyContent:'center',alignItems:'center',marginLeft:8,borderWidth:1,borderColor:C.accentBorder},
  actionDecline:{width:30,height:30,borderRadius:15,backgroundColor:'rgba(248,113,113,0.1)',justifyContent:'center',alignItems:'center',marginLeft:8,borderWidth:1,borderColor:'rgba(248,113,113,0.3)'},
  eventTitle:{fontSize:15,fontWeight:'700',color:C.text,marginBottom:5},
  eventDetails:{fontSize:12,color:C.neutral},
  emptyState:{alignItems:'center',paddingVertical:60},
  emptyIcon:{fontSize:40,marginBottom:16},
  emptyTitle:{fontSize:18,fontWeight:'700',color:C.text,marginBottom:8},
  emptyDesc:{fontSize:14,color:C.neutral},
});
