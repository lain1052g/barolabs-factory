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

interface WelcomeEmailProps {
  name?: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const displayName = name ?? '회원';

  return (
    <Html lang="ko">
      <Head />
      <Preview>메노아에 오신 것을 환영합니다 🌸 갱년기 건강 관리를 시작해보세요.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>메노아</Heading>
            <Text style={tagline}>갱년기 건강 파트너</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>환영합니다, {displayName}님! 🌸</Heading>
            <Text style={paragraph}>
              메노아에 가입해주셔서 진심으로 감사드립니다.
              이제 갱년기 증상을 스마트하게 추적하고, 건강을 더 잘 관리할 수 있어요.
            </Text>

            <Hr style={divider} />

            <Heading style={h2}>메노아로 할 수 있는 것들</Heading>

            <Section style={featureRow}>
              <Text style={featureIcon}>📊</Text>
              <Section style={featureText}>
                <Text style={featureTitle}>증상 추적</Text>
                <Text style={featureDesc}>
                  안면홍조, 불면, 감정 변화 등 30가지 이상의 갱년기 증상을 날짜별로 기록하고 추이를 확인하세요.
                </Text>
              </Section>
            </Section>

            <Section style={featureRow}>
              <Text style={featureIcon}>🆘</Text>
              <Section style={featureText}>
                <Text style={featureTitle}>SOS 긴급 대응</Text>
                <Text style={featureDesc}>
                  증상이 심할 때 바로 따라 할 수 있는 대처법을 안내합니다.
                </Text>
              </Section>
            </Section>

            <Section style={featureRow}>
              <Text style={featureIcon}>📈</Text>
              <Section style={featureText}>
                <Text style={featureTitle}>7일 분석 리포트</Text>
                <Text style={featureDesc}>
                  지난 한 주 동안의 증상 패턴을 분석하여 건강 인사이트를 제공합니다.
                </Text>
              </Section>
            </Section>

            <Hr style={divider} />

            <Text style={paragraph}>
              지금 바로 시작해서 건강한 갱년기를 만들어보세요!
            </Text>

            <Section style={buttonContainer}>
              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://menoa.barolabs.kr'}/dashboard`}
                style={button}
              >
                대시보드 바로가기
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              본 메일은 메노아 가입 시 자동 발송됩니다.
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

export const subject = '메노아에 오신 것을 환영합니다 🌸';

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

const featureRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '16px',
};

const featureIcon: React.CSSProperties = {
  fontSize: '22px',
  margin: '0 12px 0 0',
  lineHeight: '1',
  minWidth: '28px',
};

const featureText: React.CSSProperties = {
  flex: 1,
};

const featureTitle: React.CSSProperties = {
  color: '#111111',
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 4px',
};

const featureDesc: React.CSSProperties = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '1.6',
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

export default WelcomeEmail;
