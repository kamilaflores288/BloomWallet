import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/colors';
import { useAppData, bloomyStage } from '@/context/AppDataContext';
import { Sheet } from '@/types';

import { HeroCard }          from '@/components/parent/HeroCard';
import { WeeklyProgress }    from '@/components/parent/WeeklyProgress';
import { PendingAlert }      from '@/components/parent/PendingAlert';
import { QuickActionsGrid }  from '@/components/parent/QuickActionsGrid';
import { ActiveGoals }       from '@/components/parent/ActiveGoals';
import { HistoryList }       from '@/components/parent/HistoryList';

import { ApproveTasksSheet }   from '@/components/parent/sheets/ApproveTasksSheet';
import { ManageTasksSheet }    from '@/components/parent/sheets/ManageTasksSheet';
import { StatsSheet }          from '@/components/parent/sheets/StatsSheet';
import { EconomicConfigSheet } from '@/components/parent/sheets/EconomicConfigSheet';
import { SettingsSheet }       from '@/components/shared/SettingsSheet';

type ParentTab = 'home' | 'profile' | 'about';

export default function ParentHome() {
  const router = useRouter();
  const { data, approveTask, rejectTask, addTask, deleteTask, updateTask, updateConfig } = useAppData();
  const [tab,          setTab]          = useState<ParentTab>('home');
  const [sheet,        setSheet]        = useState<Sheet>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { config, child, pendingTasks, tasks, goals, history } = data;
  const profileColor = config.profileColor || '#F0447A';
  const softColor    = profileColor + '18';

  const actions = [
    { id: 'aprobar',   emoji: '📋', name: 'Aprobar tareas',    desc: 'Valida el trabajo',  bg: C.pinkLight,   badge: pendingTasks.length },
    { id: 'gestionar', emoji: '⚙️', name: 'Gestionar tareas',  desc: 'Crea y edita',       bg: C.greenLight },
    { id: 'stats',     emoji: '📊', name: 'Estadísticas',      desc: `Hábitos de ${config.childName || 'tu hijo/a'}`, bg: C.yellowLight },
    { id: 'config',    emoji: '💱', name: 'Config. económica', desc: 'Bloom y límites',    bg: C.blueLight },
  ];

  const NAV: { id: ParentTab; label: string; emoji: string }[] = [
    { id: 'home',    label: 'Inicio',          emoji: '🏠' },
    { id: 'profile', label: 'Perfil',          emoji: '👤' },
    { id: 'about',   label: 'Sobre nosotros',  emoji: '···' },
  ];

  // Parent profile tab data
  const stage        = bloomyStage(child.weeklyEarned, config.weekLimit);
  const activeGoals  = goals.filter(g => !g.redeemed);
  const savingsRate  = child.totalEarned > 0 ? Math.round((child.blooms / child.totalEarned) * 100) : 0;
  const completedGoals = goals.filter(g => g.redeemed).length;

  return (
    <SafeAreaView style={s.container}>

      {/* ── PILL HEADER ── */}
      <View style={s.headerRow}>
        <View style={s.headerSide} />
        <View style={[s.pill, { backgroundColor: softColor }]}>
          <Text style={[s.pillText, { color: profileColor }]}>
            {tab === 'home' ? 'BloomWallet Parents' : tab === 'profile' ? 'Perfil' : 'Sobre nosotros'}
          </Text>
        </View>
        <Pressable onPress={() => setShowSettings(true)} style={s.headerSide}>
          <Text style={s.gearIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* ── HOME TAB ── */}
      {tab === 'home' && (
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <HeroCard
            blooms={child.blooms}
            bloomValue={config.bloomValue}
            childName={config.childName || 'tu hijo/a'}
            parentName={config.parentName || 'Papá/Mamá'}
            earned={child.totalEarned}
            spent={child.totalSpent}
          />

          <WeeklyProgress
            current={child.weeklyEarned}
            limit={config.weekLimit}
            childName={config.childName || 'tu hijo/a'}
          />

          <PendingAlert count={pendingTasks.length} onPress={() => setSheet('aprobar')} />

          <QuickActionsGrid actions={actions} onPress={id => setSheet(id as Sheet)} />

          <ActiveGoals goals={goals} />

          <HistoryList entries={history} />
        </ScrollView>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Child overview card */}
          <View style={[s.childOverviewCard, { backgroundColor: softColor }]}>
            <View style={s.overviewTop}>
              <View>
                <Text style={s.overviewName}>{config.childName || 'Tu hijo/a'}</Text>
                <View style={[s.stageChip, { backgroundColor: profileColor + '22' }]}>
                  <Image source={stage.image} style={s.stageImage} resizeMode="contain" />
                  <Text style={[s.stageName, { color: profileColor }]}>{stage.name}</Text>
                </View>
              </View>
              <View style={s.overviewBlooms}>
                <Text style={[s.overviewBloomNum, { color: profileColor }]}>{child.blooms}</Text>
                <Text style={s.overviewBloomLabel}>Blooms</Text>
                <Text style={s.overviewMxn}>${(child.blooms * config.bloomValue).toFixed(2)} MXN</Text>
              </View>
            </View>

            {/* Quick insight row */}
            <View style={s.insightRow}>
              <View style={[s.insightItem, { backgroundColor: C.bg }]}>
                <Text style={s.insightVal}>{child.weeklyEarned}</Text>
                <Text style={s.insightLabel}>Esta semana</Text>
              </View>
              <View style={[s.insightItem, { backgroundColor: C.bg }]}>
                <Text style={s.insightVal}>{child.streak > 0 ? `${child.streak}🔥` : '–'}</Text>
                <Text style={s.insightLabel}>Racha</Text>
              </View>
              <View style={[s.insightItem, { backgroundColor: C.bg }]}>
                <Text style={s.insightVal}>{savingsRate}%</Text>
                <Text style={s.insightLabel}>Ahorro</Text>
              </View>
            </View>
          </View>

          {/* Weekly progress */}
          <WeeklyProgress
            current={child.weeklyEarned}
            limit={config.weekLimit}
            childName={config.childName || 'tu hijo/a'}
          />

          {/* Goals summary */}
          <View style={s.sectionCard}>
            <View style={s.sectionCardHeader}>
              <Text style={s.sectionCardTitle}>Metas de {config.childName || 'tu hijo/a'}</Text>
              <View style={s.goalCountRow}>
                <View style={[s.goalCountBadge, { backgroundColor: profileColor + '22' }]}>
                  <Text style={[s.goalCountText, { color: profileColor }]}>{activeGoals.length} activas</Text>
                </View>
                {completedGoals > 0 && (
                  <View style={[s.goalCountBadge, { backgroundColor: C.yellowLight }]}>
                    <Text style={[s.goalCountText, { color: C.yellow }]}>{completedGoals} logradas ✅</Text>
                  </View>
                )}
              </View>
            </View>

            {activeGoals.length === 0 ? (
              <Text style={s.emptySmall}>No hay metas activas por ahora.</Text>
            ) : (
              activeGoals.slice(0, 3).map(g => {
                const pct      = Math.min(Math.round((child.blooms / g.bloomCost) * 100), 100);
                const barColor = g.type === 'wish' ? C.purple : C.green;
                return (
                  <View key={g.id} style={s.miniGoalRow}>
                    <Text style={{ fontSize: 18, width: 28 }}>{g.emoji}</Text>
                    <View style={s.miniGoalInfo}>
                      <Text style={s.miniGoalName}>{g.name}</Text>
                      <View style={s.miniGoalBar}>
                        <View style={[s.miniGoalFill, { backgroundColor: barColor, width: `${pct}%` }]} />
                      </View>
                    </View>
                    <Text style={[s.miniGoalPct, { color: barColor }]}>{pct}%</Text>
                  </View>
                );
              })
            )}
            {activeGoals.length > 3 && (
              <Text style={s.moreGoals}>+{activeGoals.length - 3} metas más</Text>
            )}
          </View>

          {/* Stats card */}
          <View style={s.sectionCard}>
            <Text style={s.sectionCardTitle}>Resumen general</Text>
            <View style={s.statRow4}>
              {[
                { label: 'Total ganado',   val: child.totalEarned, color: C.green   },
                { label: 'Total canjeado', val: child.totalSpent,  color: profileColor },
              ].map(item => (
                <View key={item.label} style={[s.stat2Box, { backgroundColor: item.color + '11' }]}>
                  <Text style={[s.stat2Val, { color: item.color }]}>{item.val}</Text>
                  <Text style={s.stat2Label}>{item.label}</Text>
                </View>
              ))}
            </View>
            {/* Savings rate bar */}
            <View style={s.savingsRow}>
              <Text style={s.savingsLabel}>Tasa de ahorro</Text>
              <Text style={[s.savingsVal, { color: profileColor }]}>{savingsRate}%</Text>
            </View>
            <View style={s.savingsTrack}>
              <View style={[s.savingsFill, { backgroundColor: profileColor, width: `${savingsRate}%` }]} />
            </View>
            <Text style={s.savingsSub}>Del total ganado, {savingsRate}% sigue en la billetera.</Text>
          </View>

          {/* Configuración — lightweight, at the bottom */}
          <Pressable style={s.configRow} onPress={() => setShowSettings(true)}>
            <Text style={s.configRowIcon}>⚙️</Text>
            <Text style={s.configRowText}>Configuración</Text>
            <Text style={s.configRowArrow}>›</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* ── ABOUT TAB ── */}
      {tab === 'about' && (
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={[s.aboutSection, { backgroundColor: softColor }]}>
            <View style={[s.aboutIconBox, { backgroundColor: profileColor + '22' }]}>
              <Text style={{ fontSize: 22 }}>💡</Text>
            </View>
            <View style={s.aboutTextBlock}>
              <Text style={s.aboutCardTitle}>Sobre el proyecto</Text>
              <View style={[s.aboutTag, { backgroundColor: profileColor + '22' }]}>
                <Text style={[s.aboutTagText, { color: profileColor }]}>Bloom Wallet</Text>
              </View>
              <Text style={s.aboutCardText}>BloomWallet es una aplicación educativa que te ayuda a aprender sobre dinero, ahorro y metas.</Text>
            </View>
          </View>

          <View style={s.aboutSection}>
            <View style={[s.aboutIconBox, { backgroundColor: C.blueLight }]}>
              <Text style={{ fontSize: 22 }}>💡</Text>
            </View>
            <View style={s.aboutTextBlock}>
              <Text style={s.aboutCardTitle}>Equipo de desarrollo</Text>
              <View style={[s.aboutTag, { backgroundColor: C.blueLight }]}>
                <Text style={[s.aboutTagText, { color: '#4A90E2' }]}>Tech Team</Text>
              </View>
              <Text style={s.aboutCardText}>Creado con ❤️ por un equipo de estudiantes apasionadas por la tecnología, programación y educación financiera.</Text>
              {['🧑‍💻 Sheva Mariscal', '💻 Kami Flores', '🌟 Sam Mayo'].map(name => (
                <Text key={name} style={s.teamName}>{name}</Text>
              ))}
            </View>
          </View>

          <View style={s.aboutSection}>
            <View style={[s.aboutIconBox, { backgroundColor: C.purpleLight }]}>
              <Text style={{ fontSize: 22 }}>📱</Text>
            </View>
            <View style={s.aboutTextBlock}>
              <Text style={s.aboutCardTitle}>Technovation Girls</Text>
              <View style={[s.aboutTag, { backgroundColor: C.purpleLight }]}>
                <Text style={[s.aboutTagText, { color: C.purple }]}>Technovation 2026</Text>
              </View>
              <Text style={s.aboutCardText}>Programa educativo internacional que empodera a niñas y jóvenes para convertirse en líderes tecnológicas y emprendedoras. Este proyecto es parte de nuestra participación en el desafío Technovation 2026.</Text>
            </View>
          </View>

          <Text style={s.versionText}>BloomWallet v1.0</Text>
        </ScrollView>
      )}

      {/* ── BOTTOM NAV ── */}
      <View style={s.nav}>
        {NAV.map(n => {
          const active = tab === n.id;
          return (
            <Pressable key={n.id} style={s.navItem} onPress={() => setTab(n.id)}>
              <View style={[s.navIconWrap, active && { backgroundColor: profileColor + '22' }]}>
                <Text style={s.navEmojiIcon}>{n.emoji}</Text>
              </View>
              <Text style={[s.navLabel, active && { color: profileColor, fontWeight: '700' }]}>{n.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── SHEETS ── */}
      <ApproveTasksSheet
        visible={sheet === 'aprobar'}
        onClose={() => setSheet(null)}
        tasks={pendingTasks}
        onApprove={approveTask}
        onReject={rejectTask}
      />
      <ManageTasksSheet
        visible={sheet === 'gestionar'}
        onClose={() => setSheet(null)}
        tasks={tasks}
        onAdd={addTask}
        onDelete={deleteTask}
        onUpdate={updateTask}
      />
      <StatsSheet
        visible={sheet === 'stats'}
        onClose={() => setSheet(null)}
        earned={child.totalEarned}
        spent={child.totalSpent}
        saved={child.blooms}
        history={history}
        goals={goals}
      />
      <EconomicConfigSheet
        visible={sheet === 'config'}
        onClose={() => setSheet(null)}
        config={config}
        onSave={updateConfig}
      />
      <SettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onSave={updateConfig}
        onManagePin={() => router.push('/(parent)/settings')}
        onSwitchProfile={() => router.replace('/profile-select')}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  headerSide: { width: 44, alignItems: 'center', justifyContent: 'center' },
  gearIcon: { fontSize: 20 },
  pill: { flex: 1, marginHorizontal: 8, paddingVertical: 10, borderRadius: 50, alignItems: 'center' },
  pillText: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  scroll:  { flex: 1 },
  content: { paddingBottom: 24 },

  // Parent profile tab
  childOverviewCard: { marginHorizontal: 16, marginBottom: 14, borderRadius: C.rxl, padding: 18, gap: 14 },
  overviewTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  overviewName: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 6 },
  stageChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  stageImage: { width: 24, height: 24, backgroundColor: 'transparent' },
  stageName: { fontSize: 12, fontWeight: '700' },
  overviewBlooms: { alignItems: 'flex-end' },
  overviewBloomNum: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  overviewBloomLabel: { fontSize: 13, fontWeight: '600', color: C.muted },
  overviewMxn: { fontSize: 12, fontWeight: '500', color: C.muted },
  insightRow: { flexDirection: 'row', gap: 8 },
  insightItem: { flex: 1, borderRadius: C.rmd, padding: 12, alignItems: 'center', gap: 2 },
  insightVal: { fontSize: 18, fontWeight: '900', color: C.text },
  insightLabel: { fontSize: 10, fontWeight: '600', color: C.muted, textAlign: 'center' },

  sectionCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: C.cardBg, borderRadius: C.rlg, padding: 16, gap: 10 },
  sectionCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  sectionCardTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  goalCountRow: { flexDirection: 'row', gap: 6 },
  goalCountBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  goalCountText: { fontSize: 11, fontWeight: '700' },
  emptySmall: { fontSize: 13, fontWeight: '500', color: C.muted, textAlign: 'center', paddingVertical: 8 },
  miniGoalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniGoalInfo: { flex: 1, gap: 4 },
  miniGoalName: { fontSize: 13, fontWeight: '700', color: C.text },
  miniGoalBar: { height: 6, backgroundColor: '#E0D8D8', borderRadius: 6, overflow: 'hidden' },
  miniGoalFill: { height: '100%', borderRadius: 6 },
  miniGoalPct: { fontSize: 12, fontWeight: '800', minWidth: 32, textAlign: 'right' },
  moreGoals: { fontSize: 12, fontWeight: '600', color: C.muted, textAlign: 'center' },

  statRow4: { flexDirection: 'row', gap: 10 },
  stat2Box: { flex: 1, borderRadius: C.rmd, padding: 14, alignItems: 'center', gap: 3 },
  stat2Val: { fontSize: 22, fontWeight: '900' },
  stat2Label: { fontSize: 11, fontWeight: '600', color: C.muted, textAlign: 'center' },
  savingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savingsLabel: { fontSize: 13, fontWeight: '700', color: C.text },
  savingsVal: { fontSize: 14, fontWeight: '800' },
  savingsTrack: { height: 8, backgroundColor: '#E0D8D8', borderRadius: 8, overflow: 'hidden' },
  savingsFill: { height: '100%', borderRadius: 8 },
  savingsSub: { fontSize: 12, fontWeight: '500', color: C.muted },

  configRow: {
    marginHorizontal: 16, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 16,
  },
  configRowIcon: { fontSize: 18 },
  configRowText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  configRowArrow: { fontSize: 20, color: C.muted },

  // About tab
  aboutSection: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: C.cardBg, borderRadius: C.rlg, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  aboutIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  aboutTextBlock: { flex: 1, gap: 6 },
  aboutCardTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  aboutTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  aboutTagText: { fontSize: 11, fontWeight: '700' },
  aboutCardText: { fontSize: 13, fontWeight: '500', color: C.textMid, lineHeight: 20 },
  teamName: { fontSize: 13, fontWeight: '700', color: C.text, marginTop: 2 },
  versionText: { textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 8, marginBottom: 16 },

  // Nav
  nav: { flexDirection: 'row', backgroundColor: C.bg, borderTopWidth: 1.5, borderTopColor: C.border, paddingTop: 8, paddingBottom: 20 },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIconWrap: { width: 40, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  navEmojiIcon: { fontSize: 18, opacity: 0.7 },
  navLabel: { fontSize: 10, fontWeight: '600', color: C.muted },
});
