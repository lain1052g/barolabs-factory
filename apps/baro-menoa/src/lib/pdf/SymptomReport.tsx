// src/lib/pdf/SymptomReport.tsx
// 메노아 증상 리포트 PDF 문서 컴포넌트 (@react-pdf/renderer)

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const BRAND = '#800020';
const GRAY = '#6b7280';
const LIGHT_GRAY = '#f3f4f6';
const BORDER = '#e5e7eb';
const BLACK = '#111827';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BLACK,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  // ── 헤더 ──────────────────────────────
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 9,
    color: GRAY,
    flexDirection: 'row',
    gap: 16,
  },
  headerMetaItem: {
    fontSize: 9,
    color: GRAY,
    marginRight: 16,
  },
  // ── 요약 섹션 ──────────────────────────
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BRAND,
    marginBottom: 8,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: BRAND,
  },
  summaryCardLabel: {
    fontSize: 8,
    color: GRAY,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  summaryCardSub: {
    fontSize: 8,
    color: GRAY,
    marginTop: 2,
  },
  // ── 테이블 ──────────────────────────────
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BRAND,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: LIGHT_GRAY,
  },
  thDate: {
    width: '18%',
    padding: 6,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  thSymptom: {
    width: '30%',
    padding: 6,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  thSeverity: {
    width: '18%',
    padding: 6,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  thNote: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  tdDate: {
    width: '18%',
    padding: 6,
    fontSize: 9,
    color: GRAY,
  },
  tdSymptom: {
    width: '30%',
    padding: 6,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  tdSeverity: {
    width: '18%',
    padding: 6,
    fontSize: 9,
    color: BLACK,
  },
  tdNote: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    color: GRAY,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  // ── 푸터 ──────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: GRAY,
  },
  footerBrand: {
    fontSize: 8,
    color: BRAND,
    fontFamily: 'Helvetica-Bold',
  },
  noData: {
    padding: 20,
    textAlign: 'center',
    color: GRAY,
    fontSize: 10,
  },
});

// 심각도 색상
function severityColor(severity: number): string {
  if (severity >= 5) return '#dc2626';
  if (severity >= 4) return '#ea580c';
  if (severity >= 3) return '#ca8a04';
  if (severity >= 2) return '#2563eb';
  return '#16a34a';
}

// 심각도 라벨
function severityLabel(severity: number): string {
  const labels = ['', '매우 약함', '약함', '보통', '강함', '매우 강함'];
  return `${severity} - ${labels[severity] ?? ''}`;
}

export interface SymptomLogRow {
  id: string;
  log_date: string;
  symptom_name: string;
  severity: number;
  note: string | null;
}

export interface SymptomReportProps {
  userName: string;
  fromDate: string;
  toDate: string;
  logs: SymptomLogRow[];
  generatedAt: string;
}

export function SymptomReport({
  userName,
  fromDate,
  toDate,
  logs,
  generatedAt,
}: SymptomReportProps) {
  // 요약 계산
  const totalCount = logs.length;

  const symptomCounts = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.symptom_name] = (acc[log.symptom_name] ?? 0) + 1;
    return acc;
  }, {});

  const topSymptom =
    totalCount > 0
      ? Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
      : '-';

  const avgSeverity =
    totalCount > 0
      ? (logs.reduce((sum, l) => sum + l.severity, 0) / totalCount).toFixed(1)
      : '0';

  const uniqueSymptomCount = Object.keys(symptomCounts).length;

  // 날짜 포맷 (YYYY-MM-DD → YY.MM.DD)
  const fmt = (d: string) => d.replace(/-/g, '.').slice(2);

  return (
    <Document
      title="메노아 증상 리포트"
      author="메노아 by 바로랩스"
      subject={`${fromDate} ~ ${toDate} 증상 기록`}
    >
      <Page size="A4" style={styles.page}>
        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>메노아 증상 리포트</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.headerMetaItem}>기간: {fromDate} ~ {toDate}</Text>
            <Text style={styles.headerMetaItem}>작성자: {userName}</Text>
          </View>
        </View>

        {/* ── 요약 ── */}
        <Text style={styles.sectionTitle}>요약</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>총 기록 수</Text>
            <Text style={styles.summaryCardValue}>{totalCount}건</Text>
            <Text style={styles.summaryCardSub}>{uniqueSymptomCount}가지 증상</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>가장 많은 증상</Text>
            <Text style={styles.summaryCardValue}>{topSymptom}</Text>
            {totalCount > 0 && (
              <Text style={styles.summaryCardSub}>
                {symptomCounts[topSymptom] ?? 0}회 기록
              </Text>
            )}
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardLabel}>평균 심각도</Text>
            <Text style={styles.summaryCardValue}>{avgSeverity} / 5</Text>
            <Text style={styles.summaryCardSub}>1=매우 약함 ~ 5=매우 강함</Text>
          </View>
        </View>

        {/* ── 증상 기록 테이블 ── */}
        <Text style={styles.sectionTitle}>증상 기록</Text>
        {totalCount === 0 ? (
          <View style={styles.table}>
            <Text style={styles.noData}>해당 기간에 기록된 증상이 없습니다.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            {/* 헤더 행 */}
            <View style={styles.tableHeader}>
              <Text style={styles.thDate}>날짜</Text>
              <Text style={styles.thSymptom}>증상명</Text>
              <Text style={styles.thSeverity}>심각도</Text>
              <Text style={styles.thNote}>메모</Text>
            </View>
            {/* 데이터 행 */}
            {logs.map((log, idx) => (
              <View
                key={log.id}
                style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                wrap={false}
              >
                <Text style={styles.tdDate}>{fmt(log.log_date)}</Text>
                <Text style={styles.tdSymptom}>{log.symptom_name}</Text>
                <View style={[styles.tdSeverity, { flexDirection: 'row', alignItems: 'center' }]}>
                  <View
                    style={[
                      styles.severityDot,
                      { backgroundColor: severityColor(log.severity) },
                    ]}
                  />
                  <Text>{severityLabel(log.severity)}</Text>
                </View>
                <Text style={styles.tdNote}>{log.note ?? '-'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── 푸터 ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>메노아 by 바로랩스</Text>
          <Text style={styles.footerText}>생성일: {generatedAt}</Text>
        </View>
      </Page>
    </Document>
  );
}
