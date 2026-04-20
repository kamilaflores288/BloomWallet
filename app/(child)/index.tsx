import React, { useState } from 'react';
import {
  ScrollView, View, Text, Pressable, StyleSheet,
  SafeAreaView, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/colors';
import { useAppData, bloomyStage } from '@/context/AppDataContext';
import { Goal } from '@/types';
import { TaskCard, TaskState } from '@/components/child/TaskCard';
import { BloomyCompanion }   from '@/components/child/BloomyCompanion';
import { ChildHistoryList }  from '@/components/child/ChildHistoryList';
import { SettingsSheet }     from '@/components/shared/SettingsSheet';

type Tab      = 'home' | 'profile' | 'about';
type HomeView = 'main' | 'tasks' | 'goals';

const TASK_CARD_COLORS = ['#EAF4FF', '#FFFBE8', '#EDFAF3', '#FFE8F3', '#F2ECFF', '#FFF4EA'];
const GOAL_EMOJIS      = ['🎮','🎒','🎨','🛹','📱','🎸','🚲','⚽','📚','🎠','🍕','✈️','🐶','🎪'];

export default function ChildHome() {
  const router = useRouter();
  const { data, completeTask, redeemGoal, addGoal, updateGoal, updateConfig } = useAppData();

  const [tab,      setTab]      = useState<Tab>('home');
  const [homeView, setHomeView] = useState<HomeView>('main');
  const [showSettings, setShowSettings] = useState(false);

  // Goal creation
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName,  setGoalName]  = useState('');
  const [goalEmoji, setGoalEmoji] = useState('🎮');
  const [goalCost,  setGoalCost]  = useState('');
  const [goalType,  setGoalType]  = useState<'need' | 'wish'>('wish');
  const [goalReason, setGoalReason] = useState('');

  // Goal reason editing
  const [editingReason, setEditingReason] = useState<string | null>(null);
  const [reasonDraft,   setReasonDraft]   = useState('');

  const { config, child, tasks, pendingTasks, goals, history } = data;
  const profileColor = config.profileColor || '#F0447A';
  const softColor    = profileColor + '18';

  const today          = new Date().toISOString().split('T')[0];
  const pendingTaskIds = new Set(pendingTasks.map(p => p.taskId));
  const blockedIds     = new Set(
    tasks.filter(t => {
      const last = data.lastCompletedDates?.[t.id];
      if (!last) return false;
      if (t.frequency === 'daily')  return last === today;
      if (t.frequency === 'weekly') return (Date.now() - new Date(last).getTime()) / 86400000 < 7;
      return false;
    }).map(t => t.id)
  );

  const getTaskState = (taskId: string): TaskState => {
    if (pendingTaskIds.has(taskId)) return 'pending';
    if (blockedIds.has(taskId))     return 'completed';
    return 'idle';
  };

  const stage       = bloomyStage(child.weeklyEarned, config.weekLimit);
  const activeGoals = goals.filter(g => !g.redeemed);

  // Badge earned states (Insignias placeholder)
  const badge1Earned = history.some(h => h.type === 'earned');
  const badge2Earned = child.streak >= 5;
  const weekStart    = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay()); weekStart.setHours(0,0,0,0);
  const weeklySpent  = history.filter(h => (h.type === 'spent' || h.type === 'redeemed') && new Date(h.date) >= weekStart).reduce((sum, h) => sum + h.amount, 0);
  const badge3Earned = child.weeklyEarned > 0 && weeklySpent <= child.weeklyEarned * 0.2;

  const handleAddGoal = () => {
    if (!goalName.trim()) { Alert.alert('Falta el nombre'); return; }
    if (!goalCost.trim() || parseInt(goalCost) <= 0) { Alert.alert('Ingresa un costo válido'); return; }
    addGoal({
      id: `g${Date.now()}`,
      name:         goalName.trim(),
      emoji:        goalEmoji,
      type:         goalType,
      bloomCost:    parseInt(goalCost),
      currentBlooms: 0,
      redeemed:     false,
      reason:       goalReason.trim() || undefined,
    });
    setShowGoalForm(false);
    setGoalName(''); setGoalCost(''); setGoalType('wish'); setGoalReason('');
  };

  const handleRedeemGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    if (child.blooms < goal.bloomCost) {
      Alert.alert('Blooms insuficientes', `Necesitas ${goal.bloomCost - child.blooms} Blooms más.`);
      return;
    }
    Alert.alert('¿Canjear meta?', `Gastarás ${goal.bloomCost} Blooms en "${goal.name}"`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: '¡Canjear!', onPress: () => redeemGoal(goalId) },
    ]);
  };

  const NAV: { id: Tab; label: string }[] = [
    { id: 'home',    label: 'Inicio'           },
    { id: 'profile', label: 'Mi perfil'        },
    { id: 'about',   label: 'Sobre nosotros'   },
  ];
  const NAV_ICONS: Record<Tab, string> = { home: '🏠', profile: '👤', about: '···' };

  // Pill header text
  const pillText =
    tab === 'about'                     ? 'Sobre nosotros' :
    tab === 'profile'                   ? 'Mi perfil'      :
    homeView === 'tasks'                ? 'Mis Tareas'     :
    homeView === 'goals'                ? 'Mis Metas'      :
                                          'BloomWallet';

  const showBackArrow = tab === 'home' && homeView !== 'main';

  return (
    <SafeAreaView style={s.container}>

      {/* ── PILL HEADER ── */}
      <View style={s.headerRow}>
        {showBackArrow ? (
          <Pressable onPress={() => setHomeView('main')} style={s.headerSide}>
            <Text style={[s.backArrow, { color: profileColor }]}>←</Text>
          </Pressable>
        ) : (
          <View style={s.headerSide} />
        )}

        <View style={[s.pill, { backgroundColor: softColor }]}>
          <Text style={[s.pillText, { color: profileColor }]}>{pillText}</Text>
        </View>

        <Pressable onPress={() => setShowSettings(true)} style={s.headerSide}>
          <Text style={s.gearIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* ── HOME: MAIN ── */}
      {tab === 'home' && homeView === 'main' && (
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Balance card with greeting + Bloomy placeholder */}
          <View style={[s.balanceCard, { backgroundColor: softColor }]}>
            <View style={s.balanceTop}>
              <View style={s.balanceLeft}>
                <Text style={s.balanceGreeting}>Hola, {config.childName || 'tú'}! 👋</Text>
                <Text style={[s.balanceBlooms, { color: profileColor }]}>{child.blooms} Blooms</Text>
                <View style={s.balanceMxnRow}>
                  <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinSmall} resizeMode="contain" />
                  <Text style={s.balanceMxn}>= ${(child.blooms * config.bloomValue).toFixed(2)} MXN</Text>
                </View>
              </View>
              {/* Bloomy */}
              <View style={[s.bloomyPlaceholder, { backgroundColor: profileColor + '22', borderColor: profileColor + '44' }]}>
                <Image source={stage.image} style={s.bloomyImage} resizeMode="contain" />
              </View>
            </View>
            <View style={s.balanceStats}>
              <View style={[s.statBox, { backgroundColor: C.bg }]}>
                <Text style={s.statBoxLabel}>💰 Ganados</Text>
                <Text style={[s.statBoxVal, { color: C.green }]}>{child.totalEarned}</Text>
              </View>
              <View style={[s.statBox, { backgroundColor: C.bg }]}>
                <Text style={s.statBoxLabel}>🎁 Gastados</Text>
                <Text style={[s.statBoxVal, { color: profileColor }]}>{child.totalSpent}</Text>
              </View>
            </View>
          </View>

          {/* Badge row — Insignias */}
          <View style={s.badgeRow}>
            {[
              { image: require('@/placeholders/badge1_Mi_primera_tarea.PNG'), label: 'Mi primera\ntarea', earned: badge1Earned },
              { image: require('@/placeholders/badge2_Racha.PNG'),            label: `Racha\n${child.streak} días`,  earned: badge2Earned },
              { image: require('@/placeholders/badge3_AhorradordelaSemana.PNG'), label: 'Ahorrador\nde la semana', earned: badge3Earned },
            ].map((b, i) => (
              <View key={i} style={[s.badgeItem, b.earned && { opacity: 1 }]}>
                <View style={[
                  s.badgeCircle,
                  b.earned ? { backgroundColor: profileColor + '22', borderColor: profileColor, borderWidth: 2 } :
                  { backgroundColor: C.cardBg, borderColor: C.border, borderWidth: 1.5 },
                ]}>
                  <Image source={b.image} style={[s.badgeImg, !b.earned && { opacity: 0.4 }]} resizeMode="contain" />
                </View>
                <Text style={[s.badgeLabel, b.earned ? { color: profileColor } : { color: C.muted }]}>{b.label}</Text>
              </View>
            ))}
          </View>

          {/* Large circular action buttons */}
          <View style={s.actionRow}>
            <Pressable
              style={({ pressed }) => [s.circleAction, { backgroundColor: profileColor }, pressed && { transform: [{ scale: 0.94 }] }]}
              onPress={() => setHomeView('tasks')}
            >
              <Text style={s.circleActionIcon}>📋</Text>
              <Text style={s.circleActionLabel}>Mis{'\n'}Tareas</Text>
              {tasks.length > 0 && (
                <View style={s.circleActionBadge}>
                  <Text style={s.circleActionBadgeText}>{tasks.length}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.circleAction, { backgroundColor: profileColor }, pressed && { transform: [{ scale: 0.94 }] }]}
              onPress={() => setHomeView('goals')}
            >
              <Text style={s.circleActionIcon}>🎯</Text>
              <Text style={s.circleActionLabel}>Mis{'\n'}Metas</Text>
              {activeGoals.length > 0 && (
                <View style={s.circleActionBadge}>
                  <Text style={s.circleActionBadgeText}>{activeGoals.length}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {history.length > 0 && (
            <>
              <Text style={s.sectionLabel}>Historial</Text>
              <ChildHistoryList entries={history} />
            </>
          )}
        </ScrollView>
      )}

      {/* ── HOME: TASKS ── */}
      {tab === 'home' && homeView === 'tasks' && (
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Mini balance + weekly progress */}
          <View style={[s.miniBalanceCard, { backgroundColor: softColor }]}>
            <View style={s.miniBalanceRow}>
              <Text style={s.miniBalanceLeft}>Mis Tareas</Text>
              <View style={s.miniBalanceRight}>
                <Text style={[s.miniBloomsNum, { color: profileColor }]}>{child.blooms}</Text>
                <Text style={s.miniBloomsLabel}> Blooms · ${(child.blooms * config.bloomValue).toFixed(0)} MXN</Text>
              </View>
            </View>
            {/* Weekly progress */}
            <View style={s.weeklyBlock}>
              <View style={s.weeklyTop}>
                <Text style={s.weeklyTitle}>Progreso semanal</Text>
                <Text style={s.weeklyCount}>{child.weeklyEarned}/{config.weekLimit}</Text>
              </View>
              <View style={s.weeklyTrack}>
                <View style={[s.weeklyFill, {
                  backgroundColor: profileColor,
                  width: `${Math.min((child.weeklyEarned / Math.max(config.weekLimit, 1)) * 100, 100)}%`,
                }]} />
              </View>
              <Text style={[s.weeklySub, { color: profileColor }]}>
                {child.weeklyEarned >= config.weekLimit
                  ? '¡Meta completada! 🌸'
                  : `${config.weekLimit - child.weeklyEarned} Blooms para la meta semanal`}
              </Text>
            </View>
          </View>

          {tasks.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyTitle}>Sin tareas por ahora</Text>
              <Text style={s.emptyDesc}>Pídele a tu padre/madre que{'\n'}cree tareas para ti.</Text>
            </View>
          ) : (
            tasks.map((t, i) => (
              <TaskCard
                key={t.id}
                task={t}
                taskState={getTaskState(t.id)}
                cardColor={TASK_CARD_COLORS[i % TASK_CARD_COLORS.length]}
                profileColor={profileColor}
                onComplete={completeTask}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* ── HOME: GOALS ── */}
      {tab === 'home' && homeView === 'goals' && (
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {goals.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>🌱</Text>
              <Text style={s.emptyTitle}>Aún no tienes metas</Text>
              <Text style={s.emptyDesc}>Crea tu primera meta y empieza{'\n'}a ahorrar Blooms.</Text>
            </View>
          ) : (
            goals.map(g => {
              const pct       = g.redeemed ? 100 : Math.min(Math.round((child.blooms / g.bloomCost) * 100), 100);
              const borderCol = g.redeemed ? C.yellow : g.type === 'wish' ? C.purple : C.green;
              const tagBg     = g.redeemed ? C.yellowLight : g.type === 'wish' ? C.purpleLight : C.greenLight;
              const tagText   = g.redeemed ? '🌟 Completada' : g.type === 'wish' ? '✨ Deseo' : '🌱 Necesidad';
              const canRedeem = !g.redeemed && child.blooms >= g.bloomCost;

              return (
                <View key={g.id} style={[s.goalCard, { borderLeftColor: borderCol }]}>
                  <View style={s.goalCardTop}>
                    <View style={[s.goalIconBox, { backgroundColor: tagBg }]}>
                      <Text style={{ fontSize: 24 }}>{g.emoji}</Text>
                    </View>
                    <View style={s.goalCardInfo}>
                      <Text style={s.goalCardName}>{g.name}</Text>
                      <View style={[s.goalTypeTag, { backgroundColor: tagBg }]}>
                        <Text style={[s.goalTypeText, { color: borderCol }]}>{tagText}</Text>
                      </View>
                    </View>
                    <View style={s.goalCardRight}>
                      <Text style={s.goalBloomNum}>{g.bloomCost}</Text>
                      <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinSmall} resizeMode="contain" />
                      <Text style={s.goalMxn}>= ${(g.bloomCost * config.bloomValue).toFixed(0)} mxn</Text>
                    </View>
                  </View>

                  <View style={s.goalBarRow}>
                    <View style={s.goalTrack}>
                      <View style={[s.goalFill, { backgroundColor: borderCol, width: `${pct}%` }]} />
                    </View>
                    <Text style={[s.goalPct, { color: borderCol }]}>{pct}%</Text>
                  </View>
                  <Text style={s.goalBloomMeta}>
                    {g.redeemed ? `${g.bloomCost} / ${g.bloomCost}` : `${Math.min(child.blooms, g.bloomCost)} / ${g.bloomCost}`} Blooms
                  </Text>

                  {/* Reason field */}
                  <Pressable
                    style={s.reasonField}
                    onPress={() => { setEditingReason(g.id); setReasonDraft(g.reason || ''); }}
                  >
                    <Text style={[s.reasonText, !g.reason && { color: C.muted, fontStyle: 'italic' }]}>
                      {g.reason || (g.type === 'wish' ? 'Lo quiero porque...' : 'Lo necesito porque...')}
                    </Text>
                    {!g.redeemed && <Text style={[s.reasonEdit, { color: profileColor }]}>✏️</Text>}
                  </Pressable>

                  {canRedeem && (
                    <Pressable
                      style={[s.redeemBtn, { backgroundColor: profileColor }]}
                      onPress={() => handleRedeemGoal(g.id)}
                    >
                      <Text style={s.redeemBtnText}>¡Canjear! 🎉</Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}

          {/* Create goal card */}
          <Pressable
            style={[s.createGoalCard, { borderColor: profileColor }]}
            onPress={() => setShowGoalForm(true)}
          >
            <Text style={s.createGoalEmoji}>🎯</Text>
            <View style={[s.createGoalBtn, { backgroundColor: profileColor }]}>
              <Text style={s.createGoalBtnText}>+ Crear nueva meta</Text>
            </View>
          </Pressable>
        </ScrollView>
      )}

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={[s.profileHeroCard, { backgroundColor: softColor }]}>
            <BloomyCompanion
              weeklyEarned={child.weeklyEarned}
              weekLimit={config.weekLimit}
              streak={child.streak}
              profileColor={profileColor}
            />
          </View>

          <View style={s.statsGrid}>
            {[
              { label: '🌸 Blooms totales', val: child.totalEarned },
              { label: '🎁 Canjeados',      val: child.totalSpent  },
              { label: '💰 Disponibles',    val: child.blooms      },
              { label: '🔥 Racha actual',   val: `${child.streak}d` },
            ].map(stat => (
              <View key={stat.label} style={s.statCard}>
                <Text style={s.statCardVal}>{stat.val}</Text>
                <Text style={s.statCardLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={s.evolutionCard}>
            <Text style={s.evolutionTitle}>Evolución de Bloomy</Text>
            {[
              { image: require('@/placeholders/bloomy_stage_1_Semilla.PNG'), name: 'Semilla', pct: 0,  desc: 'Desde el inicio'           },
              { image: require('@/placeholders/bloomy_stage_2_Brote.PNG'),   name: 'Brote',   pct: 20, desc: '20% del límite semanal'    },
              { image: require('@/placeholders/bloomy_stage_3_Planta.png'),  name: 'Planta',  pct: 41, desc: '41% del límite semanal'    },
              { image: require('@/placeholders/bloomy_stage_4_Flor.PNG'),    name: 'Flor',    pct: 80, desc: '80% del límite semanal'    },
            ].map((lvl, i) => {
              const cur = config.weekLimit > 0 ? (child.weeklyEarned / config.weekLimit) * 100 : 0;
              const reached = cur >= lvl.pct;
              return (
                <View key={i} style={s.evoRow}>
                  <Image source={lvl.image} style={[s.evoImage, !reached && { opacity: 0.3 }]} resizeMode="contain" />
                  <View style={s.evoInfo}>
                    <Text style={[s.evoName, !reached && { color: C.muted }]}>{lvl.name}</Text>
                    <Text style={s.evoDesc}>{lvl.desc}</Text>
                  </View>
                  {reached && <Text style={s.evoCheck}>✅</Text>}
                </View>
              );
            })}
          </View>

          <Pressable style={s.switchBtn} onPress={() => router.replace('/profile-select')}>
            <Text style={[s.switchText, { color: profileColor }]}>← Cambiar perfil</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* ── ABOUT TAB ── */}
      {tab === 'about' && (
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={[s.aboutSection, { backgroundColor: softColor }]}>
            <View style={[s.aboutIconBox, { backgroundColor: profileColor + '22' }]}>
              <Text style={{ fontSize: 24 }}>💡</Text>
            </View>
            <View style={s.aboutTextBlock}>
              <Text style={s.aboutCardTitle}>Sobre el proyecto</Text>
              <View style={[s.aboutTag, { backgroundColor: profileColor + '22' }]}>
                <Text style={[s.aboutTagText, { color: profileColor }]}>Bloom Wallet</Text>
              </View>
              <Text style={s.aboutCardText}>
                BloomWallet es una aplicación educativa que te ayuda a aprender sobre dinero, ahorro y metas.
              </Text>
            </View>
          </View>

          <View style={s.aboutSection}>
            <View style={[s.aboutIconBox, { backgroundColor: C.blueLight }]}>
              <Text style={{ fontSize: 24 }}>💡</Text>
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
              <Text style={{ fontSize: 24 }}>📱</Text>
            </View>
            <View style={s.aboutTextBlock}>
              <Text style={s.aboutCardTitle}>Technovation Girls</Text>
              <View style={[s.aboutTag, { backgroundColor: C.purpleLight }]}>
                <Text style={[s.aboutTagText, { color: C.purple }]}>Technovation 2026</Text>
              </View>
              <Text style={s.aboutCardText}>
                Programa educativo internacional que empodera a niñas y jóvenes para convertirse en líderes tecnológicas y emprendedoras. Este proyecto es parte de nuestra participación en el desafío Technovation 2026.
              </Text>
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
            <Pressable key={n.id} style={s.navItem} onPress={() => { setTab(n.id); if (n.id === 'home') setHomeView('main'); }}>
              <View style={[s.navIconWrap, active && { backgroundColor: profileColor + '22' }]}>
                <Text style={s.navEmojiIcon}>{NAV_ICONS[n.id]}</Text>
              </View>
              <Text style={[s.navLabel, active && { color: profileColor, fontWeight: '700' }]}>{n.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── SETTINGS SHEET ── */}
      <SettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onSave={updateConfig}
        onSwitchProfile={() => router.replace('/profile-select')}
      />

      {/* ── GOAL CREATION MODAL ── */}
      <Modal visible={showGoalForm} transparent animationType="slide" onRequestClose={() => setShowGoalForm(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Nueva meta 🎯</Text>

            <Text style={s.formLabel}>Ícono</Text>
            <View style={s.emojiGrid}>
              {GOAL_EMOJIS.map(e => (
                <Pressable key={e} style={[s.emojiOpt, goalEmoji === e && { borderColor: profileColor, backgroundColor: profileColor + '18' }]} onPress={() => setGoalEmoji(e)}>
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.formLabel}>Nombre</Text>
            <TextInput style={s.formInput} value={goalName} onChangeText={setGoalName} placeholder="Ej. Nintendo Switch" autoCapitalize="words" />

            <Text style={s.formLabel}>Costo en Blooms 🌸</Text>
            <TextInput style={s.formInput} value={goalCost} onChangeText={setGoalCost} placeholder="Ej. 100" keyboardType="number-pad" />

            <Text style={s.formLabel}>¿Por qué lo quieres?</Text>
            <TextInput style={s.formInput} value={goalReason} onChangeText={setGoalReason} placeholder="Ej. Es mi juego favorito..." autoCapitalize="sentences" />

            <Text style={s.formLabel}>Tipo de meta</Text>
            <View style={s.typeRow}>
              <Pressable style={[s.typeBtn, goalType === 'need' && { backgroundColor: C.greenLight, borderColor: C.green }]} onPress={() => setGoalType('need')}>
                <Text style={[s.typeBtnText, goalType === 'need' && { color: C.green }]}>🌱 Necesidad</Text>
              </Pressable>
              <Pressable style={[s.typeBtn, goalType === 'wish' && { backgroundColor: C.purpleLight, borderColor: C.purple }]} onPress={() => setGoalType('wish')}>
                <Text style={[s.typeBtnText, goalType === 'wish' && { color: C.purple }]}>✨ Deseo</Text>
              </Pressable>
            </View>

            <View style={s.modalBtns}>
              <Pressable style={s.modalCancel} onPress={() => setShowGoalForm(false)}>
                <Text style={s.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[s.modalSave, { backgroundColor: profileColor }]} onPress={handleAddGoal}>
                <Text style={s.modalSaveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── REASON EDIT MODAL ── */}
      <Modal visible={editingReason !== null} transparent animationType="fade" onRequestClose={() => setEditingReason(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
          <View style={[s.modalSheet, { paddingBottom: 28 }]}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>¿Por qué lo quieres?</Text>
            <TextInput
              style={[s.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
              value={reasonDraft}
              onChangeText={setReasonDraft}
              placeholder="Escribe tu razón aquí..."
              multiline
              autoFocus
            />
            <View style={s.modalBtns}>
              <Pressable style={s.modalCancel} onPress={() => setEditingReason(null)}>
                <Text style={s.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[s.modalSave, { backgroundColor: profileColor }]}
                onPress={() => {
                  if (editingReason) updateGoal({ id: editingReason, reason: reasonDraft.trim() || undefined });
                  setEditingReason(null);
                }}
              >
                <Text style={s.modalSaveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  headerSide: { width: 44, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, fontWeight: '700' },
  gearIcon: { fontSize: 20 },
  pill: { flex: 1, marginHorizontal: 8, paddingVertical: 10, borderRadius: 50, alignItems: 'center' },
  pillText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },

  scroll:  { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },

  // Balance card
  balanceCard: { borderRadius: C.rxl, padding: 20, marginBottom: 16 },
  balanceTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  balanceLeft: { flex: 1 },
  balanceGreeting: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  balanceBlooms: { fontSize: 32, fontWeight: '900', letterSpacing: -1, lineHeight: 36 },
  balanceMxnRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  coinSmall: { width: 64, height: 64 },
  balanceMxn: { fontSize: 13, fontWeight: '500', color: C.muted },
  bloomyPlaceholder: {
    width: 86, height: 86, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, overflow: 'hidden',
  },
  bloomyImage: { width: 82, height: 82, backgroundColor: 'transparent' },
  balanceStats: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, borderRadius: C.rmd, padding: 12, gap: 3 },
  statBoxLabel: { fontSize: 11, fontWeight: '600', color: C.muted },
  statBoxVal: { fontSize: 20, fontWeight: '800' },

  // Badge row
  badgeRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  badgeItem: { alignItems: 'center', gap: 6, opacity: 0.5 },
  badgeCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  badgeImg: { width: 44, height: 44 },
  badgeLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 14 },

  // Circular action buttons
  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 36, marginBottom: 24 },
  circleAction: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', gap: 4,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    position: 'relative',
  },
  circleActionIcon: { fontSize: 32 },
  circleActionLabel: { fontSize: 13, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 16 },
  circleActionBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  circleActionBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  sectionLabel: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 8 },

  // Tasks sub-view
  miniBalanceCard: { borderRadius: C.rlg, padding: 16, marginBottom: 16 },
  miniBalanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  miniBalanceLeft: { fontSize: 16, fontWeight: '800', color: C.text },
  miniBalanceRight: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  miniBloomsNum: { fontSize: 18, fontWeight: '900' },
  miniBloomsLabel: { fontSize: 12, fontWeight: '500', color: C.muted },
  weeklyBlock: { gap: 6 },
  weeklyTop: { flexDirection: 'row', justifyContent: 'space-between' },
  weeklyTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  weeklyCount: { fontSize: 13, fontWeight: '800', color: C.text },
  weeklyTrack: { height: 10, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden' },
  weeklyFill: { height: '100%', borderRadius: 10 },
  weeklySub: { fontSize: 12, fontWeight: '600' },

  // Empty states
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyIcon:  { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  emptyDesc:  { fontSize: 14, fontWeight: '500', color: C.muted, textAlign: 'center', lineHeight: 22 },

  // Goal cards (vertical, full-width, colored left border)
  goalCard: {
    backgroundColor: C.cardBg, borderRadius: C.rmd,
    borderLeftWidth: 4, padding: 14, marginBottom: 12, gap: 10,
  },
  goalCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  goalIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  goalCardInfo: { flex: 1, gap: 4 },
  goalCardName: { fontSize: 15, fontWeight: '800', color: C.text },
  goalTypeTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  goalTypeText: { fontSize: 10, fontWeight: '700' },
  goalCardRight: { alignItems: 'flex-end', gap: 2 },
  goalBloomNum: { fontSize: 18, fontWeight: '900', color: C.text },
  goalMxn: { fontSize: 10, fontWeight: '500', color: C.muted },
  goalBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  goalTrack: { flex: 1, height: 7, backgroundColor: '#E0D8D8', borderRadius: 6, overflow: 'hidden' },
  goalFill: { height: '100%', borderRadius: 6 },
  goalPct: { fontSize: 11, fontWeight: '800', minWidth: 30, textAlign: 'right' },
  goalBloomMeta: { fontSize: 11, fontWeight: '500', color: C.muted },
  reasonField: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  reasonText: { flex: 1, fontSize: 13, fontWeight: '500', color: C.textMid },
  reasonEdit: { fontSize: 14 },
  redeemBtn: { borderRadius: C.rmd, padding: 12, alignItems: 'center', marginTop: 2 },
  redeemBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Create goal card
  createGoalCard: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: C.rlg,
    padding: 20, alignItems: 'center', gap: 12, marginTop: 4,
  },
  createGoalEmoji: { fontSize: 36 },
  createGoalBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: C.rlg },
  createGoalBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Profile tab
  profileHeroCard: { borderRadius: C.rxl, padding: 24, marginBottom: 16, alignItems: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47.5%', backgroundColor: C.cardBg, borderRadius: C.rlg, padding: 16, alignItems: 'center', gap: 4 },
  statCardVal: { fontSize: 24, fontWeight: '900', color: C.text },
  statCardLabel: { fontSize: 11, fontWeight: '600', color: C.muted, textAlign: 'center' },
  evolutionCard: { backgroundColor: C.cardBg, borderRadius: C.rlg, padding: 16, marginBottom: 16, gap: 12 },
  evolutionTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 4 },
  evoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  evoImage: { width: 43, height: 43, backgroundColor: 'transparent' },
  evoInfo: { flex: 1 },
  evoName: { fontSize: 14, fontWeight: '700', color: C.text },
  evoDesc: { fontSize: 12, fontWeight: '500', color: C.muted },
  evoCheck: { fontSize: 16 },
  switchBtn: { alignItems: 'center', padding: 16 },
  switchText: { fontSize: 15, fontWeight: '600' },

  // About tab
  aboutSection: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: C.cardBg, borderRadius: C.rlg, padding: 16, marginBottom: 12,
  },
  aboutIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  aboutTextBlock: { flex: 1, gap: 6 },
  aboutCardTitle: { fontSize: 16, fontWeight: '800', color: C.text },
  aboutTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  aboutTagText: { fontSize: 11, fontWeight: '700' },
  aboutCardText: { fontSize: 13, fontWeight: '500', color: C.textMid, lineHeight: 20 },
  teamName: { fontSize: 13, fontWeight: '700', color: C.text, marginTop: 2 },
  versionText: { textAlign: 'center', fontSize: 12, color: C.muted, marginTop: 8, marginBottom: 16 },

  // Bottom nav
  nav: { flexDirection: 'row', backgroundColor: C.bg, borderTopWidth: 1.5, borderTopColor: C.border, paddingTop: 8, paddingBottom: 20 },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIconWrap: { width: 40, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  navEmojiIcon: { fontSize: 18, opacity: 0.7 },
  navLabel: { fontSize: 10, fontWeight: '600', color: C.muted },

  // Modals
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, gap: 12 },
  modalHandle: { width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  formLabel: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: -4 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiOpt: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.cardBg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  formInput: { backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 14, fontSize: 15, fontWeight: '600', color: C.text, borderWidth: 2, borderColor: C.border },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, padding: 14, borderRadius: C.rmd, alignItems: 'center', borderWidth: 2, borderColor: C.border, backgroundColor: C.cardBg },
  typeBtnText: { fontSize: 14, fontWeight: '700', color: C.muted },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, padding: 14, borderRadius: C.rmd, backgroundColor: C.cardBg, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: C.muted },
  modalSave: { flex: 1, padding: 14, borderRadius: C.rmd, alignItems: 'center' },
  modalSaveText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
