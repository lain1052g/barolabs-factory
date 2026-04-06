import type { Metadata } from 'next';
import { SosClient } from './SosClient';

export const metadata: Metadata = {
  title: 'SOS 응급 가이드 | 메노아',
  description: '갱년기 증상이 심할 때 즉각적인 대처법을 확인하세요.',
};

export default function SosPage() {
  return <SosClient />;
}
