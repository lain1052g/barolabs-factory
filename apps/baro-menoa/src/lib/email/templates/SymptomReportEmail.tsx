import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface SymptomReportEmailProps {
  name?: string;
  totalLogs: number;
  mostFrequentSymptom: string;
  averageSeverity: number;
  weekStart: string; // e.g. "2024년 1월 1일"
  weekEnd: string;   // e.g. "2024년 1월 7일"
}

export function SymptomReportEmail({
  name,
  totalLogs,
  mostFrequentSymptom,
  averageSeverity,
  weekStart,
  weekEnd,
}: SymptomReportEmailProps) {
  const displayName = name ?? '회원';
  const severityLabel = getSeverityLabel(averageSeverity);
  const severityColor = getSeverityColor(averageSeverity);

  return (
    <Html lang="ko">
      <Head />
      <Preview>지난 주 증상 리포트가 도착했어요 📊 {weekStart} ~ {weekEnd} 분석 결과를 확인하세요.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>메노아</Heading>
            <Text style={tagline}>주간 증상 리포트</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>
              {displayName}님의 주간 리포트 📊
            </Heading>
            <Text style={periodText}>
              {weekStart} ~ {weekEnd}
            </Text>

            <Hr style={divider} />

            {/* Stats */}
            <Heading style={h2}>지난 7일 요약</Heading>

            <Section style={statsGrid}>
              <Section style={statCard}>
                <Text style={statValue}>{totalLogs}</Text>
                <Text style={statLabel}>총 기록 수</Text>
              </Section>
              <Section style={statCard}>
                <Text style={statValue}>{averageSeverity.toFixed(1)}</Text>
                <Text style={{ ...statLabel, color: severityColor }}>{severityLabel}</Text>
              </Section>
            </Section>

            <Section style={highlightCard}>
              <Text style={highlightTitle}>가장 많이 기록된 증상</Text>
              <Text style={highlightValue}>💊 {mostFrequentSymptom}</Text>
            </Section>

            <Hr style={divider} />

            {/* Message */}
            <Text style={paragraph}>
              {totalLogs >= 5
                ? `이번 주에 ${totalLogs}개의 증상을 꾸준히 기록하셨어요. 꾸준한 기록이 건강 관리의 첫 걸음입니다!`
                : `이번 주 기록이 조금 적었어요. 매일 조금씩 기록하면 더 정확한 건강 패턴을 파악할 수 있어요.`}
            </Text>

            <Text style={paragraph}>
              대시보드에서 더 자세한 분석 결과와 증상 변화 추이를 확인해보세요.
            </Text>

            <Section style={buttonContainer}>
              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://menoa.barolabs.kr'}/dashboard`}
                style={button}
              >
                리포트 전체 보기
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              매주 월요일 지난 주 리포트를 발송해 드립니다.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} 바로랩스. All rights reserved.
            </Text>
            <Text style={footerText}>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://menoa.barolabs.kr'}/settings`} style={footerLink}>
                이메일 설정 변경
              </a>
              {' · '}
              <a href={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://menoa.barolabs.kr'}/privacy`} style={footerLink}>
                개인정보처리방침
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const subject = '지난 주 증상 리포트가 도착했어요 📊';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSeverityLabel(avg: number): string {
  if (avg < 2) return '매우 경미';
  if (avg < 3) return '경미';
  if (avg < 4) return '보통';
  if (avg < 5) return '심함';
  return '매우 심함';
}

function getSeverityColor(avg: number): string {
  if (avg < 2) return '#22c55e';
  if (avg < 3) return '#84cc16';
  if (avg < 4) return '#f59e0b';
  if (avg < 5) return '#ef4444';
  return '#800020';
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const BRAND = '#800020';

const main: React.CSSProperties = {
  backgroundColor: '#fdf6f7',
  fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif",
};

const container: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '560px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const header: React.CSSProperties = {
  backgroundColor: BRAND,
  padding: '32px 40px 24px',
  textAlign: 'center',
};

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 700,
  margin: '0 0 4px',
  letterSpacing: '-0.5px',
};

const tagline: React.CSSProperties = {
  color: 'rgba(255,255,255,0.8)',
  fontSize: '13px',
  margin: 0,
};

const content: React.CSSProperties = {
  padding: '32px 40px',
};

const h1: React.CSSProperties = {
  color: '#111111',
  fontSize: '22px',
  fontWeight: 700,
  margin: '0 0 8px',
};

const periodText: React.CSSProperties = {
  color: '#888888',
  fontSize: '13px',
  margin: '0 0 16px',
};

const h2: React.CSSProperties = {
  color: BRAND,
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 16px',
};

const paragraph: React.CSSProperties = {
  color: '#444444',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 16px',
};

const divider: React.CSSProperties = {
  borderColor: '#f0e0e4',
  margin: '24px 0',
};

const statsGrid: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '16px',
};

const statCard: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#fdf6f7',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center',
  border: '1px solid #f0e0e4',
};

const statValue: React.CSSProperties = {
  color: BRAND,
  fontSize: '28px',
  fontWeight: 700,
  margin: '0 0 4px',
  lineHeight: '1',
};

const statLabel: React.CSSProperties = {
  color: '#666666',
  fontSize: '12px',
  margin: 0,
};

const highlightCard: React.CSSProperties = {
  backgroundColor: '#fff5f7',
  border: `1px solid ${BRAND}30`,
  borderRadius: '8px',
  padding: '16px 20px',
  marginBottom: '8px',
};

const highlightTitle: React.CSSProperties = {
  color: '#888888',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 6px',
};

const highlightValue: React.CSSProperties = {
  color: '#111111',
  fontSize: '18px',
  fontWeight: 600,
  margin: 0,
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '24px 0 0',
};

const button: React.CSSProperties = {
  backgroundColor: BRAND,
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: 600,
  padding: '14px 32px',
  textDecoration: 'none',
};

const footer: React.CSSProperties = {
  backgroundColor: '#fdf6f7',
  borderTop: '1px solid #f0e0e4',
  padding: '20px 40px',
  textAlign: 'center',
};

const footerText: React.CSSProperties = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0 0 4px',
};

const footerLink: React.CSSProperties = {
  color: BRAND,
  textDecoration: 'none',
};

export default SymptomReportEmail;
