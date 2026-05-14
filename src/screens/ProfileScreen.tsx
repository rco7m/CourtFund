import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ChevronLeft, Check, Star, AlertTriangle, Award, Activity } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../providers/AuthProvider';
import { getMyProfile, getMyStats, recomputeMyStats } from '../data/profiles';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
  warn: '#F59E0B', warnMuted: 'rgba(245,158,11,0.1)',
};

// Mini schedule embedded in profile
const MiniSchedule = () => {
  const DAYS = [
    {day:'Mon',date:15,hasEvent:false},
    {day:'Tue',date:16,hasEvent:true},
    {day:'Wed',date:17,hasEvent:true},
    {day:'Thu',date:18,hasEvent:true},
    {day:'Fri',date:19,hasEvent:false},
    {day:'Sat',date:20,hasEvent:true},
    {day:'Sun',date:21,hasEvent:false},
  ];
  const [active, setActive] = useState(15);
  const events: {[k:number]:string[]} = {
    16:['Badminton Class — 5PM'],
    17:['Open Play — 6PM'],
    18:['Doubles Session — 6PM'],
    20:['Weekend Match — 10AM','Coaching — 2PM'],
  };

  return (
    <View style={ms.container}>
      <View style={ms.dayRow}>
        {DAYS.map(d=>{
          const a = active===d.date;
          return (
            <TouchableOpacity key={d.date} style={[ms.dayChip,a&&ms.dayChipActive]} onPress={()=>setActive(d.date)}>
              <Text style={[ms.dayLabel,a&&ms.dayLabelActive]}>{d.day}</Text>
              <Text style={[ms.dateNum,a&&ms.dayLabelActive]}>{d.date}</Text>
              {d.hasEvent&&<View style={[ms.dot,a&&{backgroundColor:C.accentBg}]}/>}
            </TouchableOpacity>
          );
        })}
      </View>
      {(events[active]||[]).length>0 ? (
        (events[active]||[]).map((e,i)=>(
          <View key={i} style={ms.eventRow}>
            <View style={ms.eventDot}/>
            <Text style={ms.eventText}>{e}</Text>
          </View>
        ))
      ) : (
        <Text style={ms.noEvent}>No events this day</Text>
      )}
    </View>
  );
};

const ProgressBar = ({ label, percentage }: any) => (
  <View style={s.skillBar}>
    <View style={s.skillBarTop}>
      <Text style={s.skillLabel}>{label}</Text>
      <Text style={s.skillPct}>{percentage}</Text>
    </View>
    <View style={s.skillTrack}>
      <View style={[s.skillFill, { width: percentage }]} />
    </View>
  </View>
);

const RecentSession = ({ title, date, stars, isLast }: any) => (
  <View style={[s.recentRow, isLast && { borderBottomWidth: 0 }]}>
    <View>
      <Text style={s.recentTitle}>{title}</Text>
      <Text style={s.recentDate}>{date}</Text>
    </View>
    <View style={s.starsRow}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={13} color={C.accent} fill={n <= stars ? C.accent : 'transparent'} style={{ marginLeft: 2 }} />
      ))}
    </View>
  </View>
);

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string>('Player Profile');
  const [stats, setStats] = useState<{ sessions: number; hours: string; avgRating: string; streak: string }>({
    sessions: 0,
    hours: '0h',
    avgRating: '-',
    streak: '0d',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await recomputeMyStats();
        const profile = await getMyProfile();
        const s = await getMyStats();
        if (!mounted) return;
        setDisplayName(profile.display_name || profile.email || 'Player Profile');
        setStats({
          sessions: s.sessions_count ?? 0,
          hours: `${Math.round((s.hours_total ?? 0) * 10) / 10}h`,
          avgRating: s.avg_rating ? String(s.avg_rating) : '-',
          streak: `${s.streak_days ?? 0}d`,
        });
      } catch {
        // keep defaults
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={s.container}>
      <View style={{ paddingTop: insets.top + 12 }}>
        <AppHeader />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Profile Hero */}
        <View style={s.profileCard}>
          <View style={s.avatarLarge}>
            <Image source={require('../assets/logo.png')} style={{width:36,height:36,borderRadius:8}} resizeMode="contain"/>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{displayName}</Text>
            <Text style={s.profileDesc}>Based on {stats.sessions} logged sessions</Text>
          </View>
          <TouchableOpacity
            style={s.signOutBtn}
            onPress={async () => {
              await signOut();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }}
          >
            <Text style={s.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid — no grade/level */}
        <View style={s.statsGrid}>
          {[
            {value:String(stats.sessions),label:'SESSIONS'},
            {value:stats.hours,label:'HOURS'},
            {value:stats.avgRating,label:'AVG RATING'},
            {value:stats.streak,label:'STREAK'},
          ].map(c=>(
            <View key={c.label} style={s.statCard}>
              <Text style={s.statValue}>{c.value}</Text>
              <Text style={s.statLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* Sessions Bar Chart */}
        <View style={s.card}>
          <Text style={s.cardTitle}>SESSIONS PER MONTH</Text>
          <View style={s.chartContainer}>
            {[
              {month:'Oct',h:30},{month:'Nov',h:50},
              {month:'Dec',h:40},{month:'Jan',h:70},
              {month:'Feb',h:50},{month:'Mar',h:90,active:true},
            ].map(b=>(
              <View key={b.month} style={s.barWrapper}>
                <View style={[s.barFill,{height:b.h,backgroundColor:b.active?C.accent:'rgba(204,255,0,0.2)'}]}/>
                <Text style={s.barLabel}>{b.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Injury Risk */}
        <View style={s.injuryCard}>
          <View style={s.injuryStripe}/>
          <View style={s.injuryInner}>
            <View style={s.injuryIcon}><Activity size={18} color={C.warn}/></View>
            <View style={{flex:1}}>
              <Text style={s.injuryTitle}>Injury Risk: Moderate</Text>
              <Text style={s.injuryDesc}>~5 sessions this week. Consider a rest day.</Text>
            </View>
          </View>
        </View>

        {/* Mini Schedule */}
        <Text style={s.sectionTitle}>MY SCHEDULE</Text>
        <View style={[s.card,{padding:0,overflow:'hidden'}]}>
          <MiniSchedule/>
        </View>

        {/* Recent Sessions — no grade/level */}
        <Text style={s.sectionTitle}>RECENT SESSIONS</Text>
        <View style={s.listCard}>
          <RecentSession title="Doubles" date="Today • 60 min" stars={4}/>
          <RecentSession title="Doubles" date="Mar 14 • 90 min" stars={4}/>
          <RecentSession title="Class" date="Mar 12 • 60 min" stars={3}/>
          <RecentSession title="Singles" date="Mar 10 • 90 min" stars={5} isLast/>
        </View>

        {/* Spending */}
        <Text style={s.sectionTitle}>SPENDING THIS MONTH</Text>
        <View style={s.spendCard}>
          <View style={{flex:1}}>
            {[
              {color:C.accent,label:'Court Bookings',amount:'$90.00'},
              {color:'rgba(204,255,0,0.4)',label:'Equipment & Gear',amount:'$193.50'},
            ].map(r=>(
              <View key={r.label} style={s.spendRow}>
                <View style={[s.spendDot,{backgroundColor:r.color}]}/>
                <Text style={s.spendLabel}>{r.label}</Text>
                <Text style={s.spendAmount}>{r.amount}</Text>
              </View>
            ))}
          </View>
          <View style={s.totalBox}>
            <Text style={s.totalValue}>$283.50</Text>
            <Text style={s.totalLabel}>Total</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const ms = StyleSheet.create({
  container:{padding:16},
  dayRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:14},
  dayChip:{width:40,paddingVertical:8,backgroundColor:'rgba(148,163,184,0.08)',borderRadius:12,alignItems:'center',borderWidth:1,borderColor:'rgba(148,163,184,0.12)'},
  dayChipActive:{backgroundColor:'#CCFF00',borderColor:'#CCFF00'},
  dayLabel:{fontSize:10,color:'#94A3B8',marginBottom:3},
  dateNum:{fontSize:14,fontWeight:'700',color:'#E2E8F0'},
  dayLabelActive:{color:'#0A0F1E'},
  dot:{width:4,height:4,borderRadius:2,backgroundColor:'#CCFF00',marginTop:3},
  eventRow:{flexDirection:'row',alignItems:'center',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'rgba(148,163,184,0.08)'},
  eventDot:{width:6,height:6,borderRadius:3,backgroundColor:'#CCFF00',marginRight:10},
  eventText:{color:'#E2E8F0',fontSize:13},
  noEvent:{color:'#94A3B8',fontSize:13,paddingTop:8,paddingBottom:4},
});

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  profileCard:{backgroundColor:C.card,marginHorizontal:20,marginBottom:16,borderRadius:20,padding:20,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:C.border},
  avatarLarge:{width:60,height:60,borderRadius:30,backgroundColor:C.accent,justifyContent:'center',alignItems:'center',marginRight:18},
  profileInfo:{flex:1},
  profileName:{color:C.text,fontSize:20,fontWeight:'700',marginBottom:4},
  profileDesc:{color:C.neutral,fontSize:12},
  signOutBtn:{paddingHorizontal:12,paddingVertical:8,borderRadius:12,backgroundColor:'rgba(148,163,184,0.1)',borderWidth:1,borderColor:C.border},
  signOutText:{color:C.text,fontSize:12,fontWeight:'700'},
  statsGrid:{flexDirection:'row',flexWrap:'wrap',paddingHorizontal:14,justifyContent:'space-between',marginBottom:8},
  statCard:{width:'47%',backgroundColor:C.card,padding:16,borderRadius:16,marginBottom:10,marginHorizontal:2,borderWidth:1,borderColor:C.border},
  statValue:{fontSize:24,fontWeight:'800',color:C.accent,marginBottom:4},
  statLabel:{fontSize:10,fontWeight:'700',color:C.neutral,letterSpacing:1},
  card:{backgroundColor:C.card,marginHorizontal:20,marginBottom:12,borderRadius:18,padding:20,borderWidth:1,borderColor:C.border},
  cardTitle:{fontSize:11,color:C.neutral,fontWeight:'700',letterSpacing:1.5,marginBottom:16},
  chartContainer:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',height:100},
  barWrapper:{alignItems:'center',flex:1},
  barFill:{width:'70%',borderRadius:6,minHeight:10},
  barLabel:{fontSize:10,color:C.neutral,marginTop:8},
  injuryCard:{flexDirection:'row',backgroundColor:C.card,marginHorizontal:20,marginBottom:12,borderRadius:16,overflow:'hidden',borderWidth:1,borderColor:C.border},
  injuryStripe:{width:4,backgroundColor:C.warn},
  injuryInner:{flex:1,padding:16,flexDirection:'row',alignItems:'center'},
  injuryIcon:{width:36,height:36,borderRadius:10,backgroundColor:'rgba(245,158,11,0.1)',justifyContent:'center',alignItems:'center',marginRight:14},
  injuryTitle:{fontSize:14,fontWeight:'700',color:C.text,marginBottom:3},
  injuryDesc:{fontSize:12,color:C.neutral,lineHeight:17},
  skillBar:{marginBottom:14},
  skillBarTop:{flexDirection:'row',justifyContent:'space-between',marginBottom:7},
  skillLabel:{fontSize:13,fontWeight:'600',color:C.text},
  skillPct:{fontSize:12,color:C.neutral},
  skillTrack:{height:5,backgroundColor:'rgba(148,163,184,0.15)',borderRadius:3},
  skillFill:{height:'100%',backgroundColor:C.accent,borderRadius:3},
  sectionTitle:{fontSize:11,color:C.neutral,fontWeight:'700',letterSpacing:1.5,marginHorizontal:20,marginTop:8,marginBottom:12},
  listCard:{backgroundColor:C.card,marginHorizontal:20,borderRadius:16,borderWidth:1,borderColor:C.border,overflow:'hidden',marginBottom:8},
  recentRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:15,borderBottomWidth:1,borderBottomColor:C.border},
  recentTitle:{fontSize:14,fontWeight:'600',color:C.text,marginBottom:3},
  recentDate:{fontSize:12,color:C.neutral},
  starsRow:{flexDirection:'row'},
  spendCard:{flexDirection:'row',alignItems:'center',backgroundColor:C.card,marginHorizontal:20,borderRadius:16,padding:18,borderWidth:1,borderColor:C.border,marginBottom:20},
  spendRow:{flexDirection:'row',alignItems:'center',marginBottom:10},
  spendDot:{width:8,height:8,borderRadius:4,marginRight:10},
  spendLabel:{flex:1,fontSize:13,color:C.neutral},
  spendAmount:{fontSize:13,fontWeight:'600',color:C.text},
  totalBox:{alignItems:'flex-end',marginLeft:20},
  totalValue:{fontSize:22,fontWeight:'800',color:C.accent,marginBottom:2},
  totalLabel:{fontSize:11,color:C.neutral},
});
