// 척도 타입
export type Scale = "mach" | "narc" | "psyc" | "sadi";

// 개별 문항 타입
export interface Question {
  id: string;
  scale: Scale;
  order: number;
  text: string;
}

// 검사 응답 (23문항)
export interface Responses {
  // Mach (마키아벨리즘) - 6문항
  dtmc1: number;
  dtmc2: number;
  dtmc3: number;
  dtmc4: number;
  dtmc5: number;
  dtmc6: number;

  // Narc (나르시시즘) - 6문항
  dtnc1: number;
  dtnc2: number;
  dtnc3: number;
  dtnc4: number;
  dtnc5: number;
  dtnc6: number;

  // Psyc (사이코패시) - 6문항
  dtps1: number;
  dtps2: number;
  dtps3: number;
  dtps5: number;
  dtps6: number;
  dtps7: number;

  // Sadi (사디즘) - 5문항
  dtsd1: number;
  dtsd2: number;
  dtsd3: number;
  dtsd5: number;
  dtsd6: number;
}

// 원점수 (각 척도 합계)
export interface RawScores {
  mach: number;
  narc: number;
  psyc: number;
  sadi: number;
}

// T점수
export interface TScores {
  mach: number;
  narc: number;
  psyc: number;
  sadi: number;
}

// 백분위
export interface Percentiles {
  mach: number;
  narc: number;
  psyc: number;
  sadi: number;
}

// 추가 정보 (AI 해석용)
export interface AdditionalInfo {
  personality?: string;
  growthBackground?: string;
  stressFactors?: string;
  otherInfo?: string;
}

// 검사 결과
export interface TestResult {
  id: number;
  gender: 1 | 2;  // 1: 남성, 2: 여성
  age: number;
  ageGroup: number;
  responses: Responses;
  rawScores: RawScores;
  tScoresNorm: TScores;
  percentilesNorm: Percentiles;
  additionalInfo?: AdditionalInfo;
  aiInterpretation?: string;
  createdAt: Date;
}

// 척도별 통계
export interface ScaleStatistics {
  mean: number;
  sd: number;
  min: number;
  max: number;
  n: number;
}

// 통계 정보
export interface Statistics {
  mach: ScaleStatistics;
  narc: ScaleStatistics;
  psyc: ScaleStatistics;
  sadi: ScaleStatistics;
}
