// src/lib/pdf/VisitReport.tsx
// 메노아 진료 요약 PDF 문서 컴포넌트 (@react-pdf/renderer)

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { VisitSummaryData } from '@/actions/visit-summary';

const BRAND = '#800020';
const BRAND_LIGHT = '#fdf6f7';
const GRAY = '#6b7280';
const GRAY_LIGHT = '#9ca3af';
const LIGHT_GRAY = '#f3f4f6';
const BORDER = '#e5e7eb';
const BLACK = '#111827';
const GREEN = '#16a34a';
const RED = '#dc2626';
const ORANGE = '#ea580c';
const YELLOW = '#ca8a04';
const SEV_COLOR = ['', GREEN, '#65a30d', YELLOW, ORANGE, RED];

function severityColor(s: number): string {
  return SEV_COLOR[Math.round(s)] ?? GRAY;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: BLACK,
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 36,
  },
  // ── 헤더 ──
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  headerMetaItem: {
    fontSize: 8,
    color: GRAY,
    marginRight: 14,
    marginBottom: 2,
  },
  headerMetaSmall: {
    fontSize: 7.5,
    color: GRAY_LIGHT,
    marginTop: 3,
  },
  // ── 데이터 품질 경고 ──
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 7,
    borderRadius: 4,
    borderLeftWidth: 3,
  },
  qualityBadgeGood: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: GREEN,
  },
  qualityBadgeFair: {
    backgroundColor: '#fffbeb',
    borderLeftColor: YELLOW,
  },
  qualityBadgePoor: {
    backgroundColor: '#fef2f2',
    borderLeftColor: RED,
  },
  qualityText: {
    fontSize: 8,
    color: BLACK,
  },
  // ── 요약 문장 박스 ──
  summaryBox: {
    backgroundColor: BRAND_LIGHT,
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: BRAND,
  },
  summaryLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 8.5,
    color: '#374151',
    lineHeight: 1.5,
  },
  // ── 섹션 ──
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    marginBottom: 6,
    marginTop: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingBottom: 4,
  },
  // ── 2컬럼 그리드 ──
  row2: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
  },
  // ── 증상 리스트 ──
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  symptomName: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  symptomCount: {
    fontSize: 8,
    color: GRAY,
    width: 40,
    textAlign: 'center',
  },
  symptomDots: {
    flexDirection: 'row',
    gap: 2,
    width: 60,
    justifyContent: 'flex-end',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  symptomSev: {
    fontSize: 8,
    color: GRAY,
    width: 38,
    textAlign: 'right',
  },
  // ── 추이 ──
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  trendName: {
    flex: 1,
    fontSize: 8.5,
    color: BLACK,
  },
  trendArrow: {
    fontSize: 10,
    width: 16,
    textAlign: 'center',
  },
  trendDetail: {
    fontSize: 8,
    color: GRAY,
    width: 90,
    textAlign: 'right',
  },
  // ── 상관관계 카드 ──
  corrCard: {
    flexDirection: 'row',
    backgroundColor: LIGHT_GRAY,
    borderRadius: 4,
    padding: 7,
    marginBottom: 5,
    borderLeftWidth: 2.5,
  },
  corrLeft: {
    width: 70,
  },
  corrEmoji: {
    fontSize: 14,
    marginBottom: 1,
  },
  corrTrigger: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  corrRight: {
    flex: 1,
    paddingLeft: 8,
  },
  corrSymptom: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    marginBottom: 2,
  },
  corrDetail: {
    fontSize: 8,
    color: GRAY,
  },
  // ── 트리거 그리드 ──
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  triggerCard: {
    width: '19%',
    backgroundColor: LIGHT_GRAY,
    borderRadius: 4,
    padding: 6,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  triggerCardWarn: {
    width: '19%',
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    padding: 6,
    borderWidth: 0.5,
    borderColor: '#fecaca',
  },
  triggerLabel: {
    fontSize: 7.5,
    color: GRAY,
    marginBottom: 2,
  },
  triggerValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  // ── 기분 ──
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 4,
  },
  moodScore: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
  },
  moodSub: {
    fontSize: 7.5,
    color: GRAY,
  },
  // ── 최악/최고의 날 ──
  dayHighlight: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dayCard: {
    flex: 1,
    borderRadius: 4,
    padding: 8,
  },
  dayCardWorst: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 2.5,
    borderLeftColor: RED,
  },
  dayCardBest: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 2.5,
    borderLeftColor: GREEN,
  },
  dayCardLabel: {
    fontSize: 7.5,
    color: GRAY,
    marginBottom: 2,
  },
  dayCardDate: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  dayCardDetail: {
    fontSize: 8,
    color: GRAY,
    marginTop: 1,
  },
  // ── 건강 프로필 ──
  profileRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  profileLabel: {
    width: 60,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: GRAY,
  },
  profileValue: {
    flex: 1,
    fontSize: 8,
    color: BLACK,
  },
  // ── 전문의 질문 ──
  questionItem: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 4,
  },
  questionBullet: {
    width: 14,
    fontSize: 9,
    color: BRAND,
  },
  questionText: {
    flex: 1,
    fontSize: 8.5,
    color: '#374151',
    lineHeight: 1.4,
  },
  // ── 푸터 ──
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerBrand: {
    fontSize: 7.5,
    color: BRAND,
    fontFamily: 'Helvetica-Bold',
  },
  footerNote: {
    fontSize: 7,
    color: GRAY_LIGHT,
    flex: 1,
    textAlign: 'center',
  },
  footerDate: {
    fontSize: 7.5,
    color: GRAY,
  },
});

export interface VisitReportProps {
  data: VisitSummaryData;
}

export function VisitReport({ data }: VisitReportProps) {
  const hasHealth = data.conditions.length > 0 || data.medicalHistory.length > 0 ||
    data.medications.length > 0 || data.supplements.length > 0 || data.isSmoker;

  const qualityStyle = data.dataQuality === 'good'
    ? styles.qualityBadgeGood
    : data.dataQuality === 'fair'
    ? styles.qualityBadgeFair
    : styles.qualityBadgePoor;

  const qualityMsg = data.dataQuality === 'good'
    ? `데이터 품질 양호 — ${data.totalRecordDays}일 기록 (${data.days}일 기간)`
    : data.dataQuality === 'fair'
    ? `데이터 보통 — ${data.totalRecordDays}일 기록. 더 많이 기록할수록 정확도가 높아져요.`
    : `데이터 부족 — ${data.totalRecordDays}일 기록. 통계 신뢰도가 낮을 수 있어요.`;

  return (
    <Document
      title="메노아 진료 요약"
      author="메노아 by 바로랩스"
      subject={`${data.periodFrom} ~ ${data.periodTo} 진료 요약`}
    >
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>메노아 진료 요약</Text>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaItem}>이름: {data.userName}</Text>
            {data.birthYear && <Text style={styles.headerMetaItem}>출생: {data.birthYear}년</Text>}
            {data.menopauseStage && <Text style={styles.headerMetaItem}>단계: {data.menopauseStage}</Text>}
            <Text style={styles.headerMetaItem}>기간: {data.periodFrom} ~ {data.periodTo} ({data.days}일)</Text>
          </View>
          <Text style={styles.headerMetaSmall}>{data.generatedAt} 기준 생성 · 의학적 진단이 아닌 참고 자료입니다</Text>
        </View>

        {/* 데이터 품질 */}
        <View style={[styles.qualityBadge, qualityStyle]}>
          <Text style={styles.qualityText}>{qualityMsg}</Text>
        </View>

        {/* AI 요약 */}
        {data.summaryText && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>자동 요약</Text>
            <Text style={styles.summaryText}>{data.summaryText}</Text>
          </View>
        )}

        {/* 1. 주요 증상 */}
        {data.symptoms.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>주요 증상 ({data.symptoms.length}가지 · 최근 {data.days}일)</Text>
            {data.symptoms.slice(0, 8).map(s => (
              <View key={s.name} style={styles.symptomRow} wrap={false}>
                <Text style={styles.symptomName}>{s.name}</Text>
                <Text style={styles.symptomCount}>{s.count}회</Text>
                <View style={styles.symptomDots}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <View
                      key={n}
                      style={[
                        styles.dot,
                        { backgroundColor: n <= Math.round(s.avgSeverity) ? severityColor(s.avgSeverity) : BORDER },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.symptomSev}>평균 {s.avgSeverity}</Text>
              </View>
            ))}
          </>
        )}

        {/* 2. 증상 추이 */}
        {data.trends.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>증상 추이 (기간 전반부 → 후반부)</Text>
            {data.trends.slice(0, 5).map(t => (
              <View key={t.name} style={styles.trendRow} wrap={false}>
                <Text style={styles.trendName}>{t.name}</Text>
                <Text style={[
                  styles.trendArrow,
                  { color: t.direction === 'worsening' ? RED : t.direction === 'improving' ? GREEN : GRAY },
                ]}>
                  {t.direction === 'worsening' ? '↑' : t.direction === 'improving' ? '↓' : '→'}
                </Text>
                <Text style={styles.trendDetail}>
                  {t.firstHalfAvg} → {t.secondHalfAvg}
                  {' '}({t.direction === 'worsening' ? '증가 추세' : t.direction === 'improving' ? '감소 추세' : '유지'})
                </Text>
              </View>
            ))}
          </>
        )}

        {/* 3. 트리거-증상 상관관계 */}
        {data.correlations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>생활 요인 기록 비교</Text>
            {data.correlations.slice(0, 4).map((c, i) => (
              <View
                key={i}
                style={[
                  styles.corrCard,
                  { borderLeftColor: c.difference > 0 ? RED : GREEN },
                ]}
                wrap={false}
              >
                <View style={styles.corrLeft}>
                  <Text style={styles.corrTrigger}>[{c.triggerLabel}]</Text>
                </View>
                <View style={styles.corrRight}>
                  <Text style={styles.corrSymptom}>{c.symptomName}</Text>
                  <Text style={styles.corrDetail}>
                    기록일 평균 {c.onDaysAvg} / 미기록일 평균 {c.offDaysAvg}
                    {' '}— {c.difference > 0 ? `+${c.difference}점 높음` : `${c.difference}점 낮음`} ({c.onDaysCount}일/{c.offDaysCount}일 비교)
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* 4. 생활 요인 평균 */}
        {data.triggers && (
          <>
            <Text style={styles.sectionTitle}>생활 요인 평균 ({data.triggers.daysRecorded}일 기록)</Text>
            <View style={styles.triggerGrid}>
              <View style={styles.triggerCard}>
                <Text style={styles.triggerLabel}>[카페인]</Text>
                <Text style={styles.triggerValue}>{data.triggers.avgCaffeine}잔/일</Text>
              </View>
              <View style={styles.triggerCard}>
                <Text style={styles.triggerLabel}>[음주]</Text>
                <Text style={styles.triggerValue}>{data.triggers.avgAlcohol}잔/일</Text>
              </View>
              <View style={data.triggers.avgSleepMinutes < 360 ? styles.triggerCardWarn : styles.triggerCard}>
                <Text style={styles.triggerLabel}>[수면]</Text>
                <Text style={styles.triggerValue}>
                  {Math.floor(data.triggers.avgSleepMinutes / 60)}시간 {data.triggers.avgSleepMinutes % 60 > 0 ? `${data.triggers.avgSleepMinutes % 60}분` : ''}
                </Text>
              </View>
              <View style={data.triggers.avgStress >= 4 ? styles.triggerCardWarn : styles.triggerCard}>
                <Text style={styles.triggerLabel}>[스트레스]</Text>
                <Text style={styles.triggerValue}>
                  {data.triggers.avgStress > 0 ? `${data.triggers.avgStress}/5` : '미기록'}
                </Text>
              </View>
              <View style={styles.triggerCard}>
                <Text style={styles.triggerLabel}>[운동]</Text>
                <Text style={styles.triggerValue}>{data.triggers.avgExerciseMinutes}분/일</Text>
              </View>
            </View>
          </>
        )}

        {/* 5. 기분 + 최악/최고의 날 (2컬럼) */}
        {(data.mood || data.worstDay) && (
          <View style={styles.row2}>
            {data.mood && (
              <View style={styles.col}>
                <Text style={styles.sectionTitle}>기분 추이</Text>
                <View style={styles.moodRow}>
                  <View>
                    <Text style={styles.moodScore}>{data.mood.avgScore}</Text>
                    <Text style={styles.moodSub}>/ 5점</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 8.5, color: BLACK }}>최근 {data.days}일 평균 ({data.mood.daysRecorded}일 기록)</Text>
                    {data.mood.prevAvgScore !== null && (
                      <Text style={[styles.moodSub, {
                        color: data.mood.avgScore >= data.mood.prevAvgScore ? GREEN : RED,
                      }]}>
                        이전 대비 {data.mood.avgScore >= data.mood.prevAvgScore ? '▲' : '▼'}
                        {Math.abs(Math.round((data.mood.avgScore - data.mood.prevAvgScore) * 10) / 10)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}
            {(data.worstDay || data.bestDay) && (
              <View style={styles.col}>
                <Text style={styles.sectionTitle}>특이일</Text>
                <View style={styles.dayHighlight}>
                  {data.worstDay && (
                    <View style={[styles.dayCard, styles.dayCardWorst]}>
                      <Text style={styles.dayCardLabel}>최악의 날</Text>
                      <Text style={styles.dayCardDate}>{data.worstDay.label}</Text>
                      <Text style={styles.dayCardDetail}>평균 심각도 {data.worstDay.avgSeverity}</Text>
                    </View>
                  )}
                  {data.bestDay && (
                    <View style={[styles.dayCard, styles.dayCardBest]}>
                      <Text style={styles.dayCardLabel}>가장 좋은 날</Text>
                      <Text style={styles.dayCardDate}>{data.bestDay.label}</Text>
                      <Text style={styles.dayCardDetail}>평균 심각도 {data.bestDay.avgSeverity}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* 6. 건강 프로필 */}
        {hasHealth && (
          <>
            <Text style={styles.sectionTitle}>건강 프로필</Text>
            {data.conditions.length > 0 && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>현재 질환</Text>
                <Text style={styles.profileValue}>{data.conditions.join(', ')}</Text>
              </View>
            )}
            {data.medicalHistory.length > 0 && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>병력</Text>
                <Text style={styles.profileValue}>{data.medicalHistory.join(', ')}</Text>
              </View>
            )}
            {data.medications.length > 0 && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>복용 약물</Text>
                <Text style={styles.profileValue}>{data.medications.join(', ')}</Text>
              </View>
            )}
            {data.supplements.length > 0 && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>영양제</Text>
                <Text style={styles.profileValue}>{data.supplements.join(', ')}</Text>
              </View>
            )}
            {data.isSmoker && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>흡연</Text>
                <Text style={[styles.profileValue, { color: RED }]}>예</Text>
              </View>
            )}
          </>
        )}

        {/* 7. 전문의 질문 가이드 */}
        {data.doctorQuestions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>전문의에게 물어볼 사항</Text>
            {data.doctorQuestions.map((q, i) => (
              <View key={i} style={styles.questionItem} wrap={false}>
                <Text style={styles.questionBullet}>Q{i + 1}.</Text>
                <Text style={styles.questionText}>{q}</Text>
              </View>
            ))}
          </>
        )}

        {/* 푸터 */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>메노아 by 바로랩스</Text>
          <Text style={styles.footerNote}>본 자료는 사용자가 직접 기록한 데이터를 요약한 것이며, 의학적 진단이나 치료를 대체하지 않습니다</Text>
          <Text style={styles.footerDate}>{data.generatedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}
