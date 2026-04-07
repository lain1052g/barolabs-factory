import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '메노아 — 갱년기 건강 파트너';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#fdf6f7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 배경 장식 원 */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: '#800020',
            opacity: 0.06,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundColor: '#800020',
            opacity: 0.06,
          }}
        />

        {/* 달+별 아이콘 (우측 상단) */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <path
              d="M54 36C54 45.941 45.941 54 36 54C26.059 54 18 45.941 18 36C18 27.4 23.8 20.17 31.7 18.28C29.23 21.42 27.75 25.36 27.75 29.65C27.75 40.27 36.35 48.87 46.97 48.87C49.8 48.87 52.48 48.24 54.9 47.13C54.31 43.59 54 40.02 54 36Z"
              fill="#800020"
              opacity="0.8"
            />
            <circle cx="58" cy="18" r="4" fill="#800020" opacity="0.5" />
            <circle cx="48" cy="10" r="2.5" fill="#800020" opacity="0.4" />
            <circle cx="65" cy="28" r="2" fill="#800020" opacity="0.35" />
          </svg>
        </div>

        {/* 메인 콘텐츠 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            padding: '0 80px',
            textAlign: 'center',
          }}
        >
          {/* 브랜드 태그 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#800020',
              borderRadius: '100px',
              padding: '8px 24px',
            }}
          >
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 600, letterSpacing: '0.05em' }}>
              MENOA
            </span>
          </div>

          {/* 메인 타이틀 */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: '#800020',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            메노아
          </div>

          {/* 설명 */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 400,
              color: '#5a3040',
              lineHeight: 1.5,
              maxWidth: '800px',
            }}
          >
            갱년기 증상을 스마트하게 추적하고,
            <br />
            건강을 다시 찾아드립니다
          </div>

          {/* 기능 태그들 */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            {['증상 추적', '트리거 분석', '감정 저널', 'PDF 리포트'].map((tag) => (
              <div
                key={tag}
                style={{
                  backgroundColor: 'white',
                  border: '1.5px solid #e8b4bc',
                  borderRadius: '100px',
                  padding: '8px 20px',
                  fontSize: '18px',
                  color: '#800020',
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 도메인 */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#800020',
            }}
          />
          <span
            style={{
              fontSize: '18px',
              color: '#9a5c6a',
              letterSpacing: '0.05em',
            }}
          >
            menoa.barolabs.kr
          </span>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#800020',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
