import { Responses, RawScores, TScores, Percentiles, Statistics, ScaleStatistics } from "./types";

/**
 * 원점수 계산 (각 척도의 합계)
 */
export function calculateRawScores(responses: Responses): RawScores {
  return {
    mach: responses.dtmc1 + responses.dtmc2 + responses.dtmc3 + responses.dtmc4 + responses.dtmc5 + responses.dtmc6,
    narc: responses.dtnc1 + responses.dtnc2 + responses.dtnc3 + responses.dtnc4 + responses.dtnc5 + responses.dtnc6,
    psyc: responses.dtps1 + responses.dtps2 + responses.dtps3 + responses.dtps5 + responses.dtps6 + responses.dtps7,
    sadi: responses.dtsd1 + responses.dtsd2 + responses.dtsd3 + responses.dtsd5 + responses.dtsd6,
  };
}

/**
 * 평균 계산
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * 표준편차 계산
 */
function standardDeviation(values: number[], meanValue: number): number {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - meanValue, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * T점수 계산
 * T = 50 + 10 * (X - M) / SD
 */
function calculateTScore(rawScore: number, mean: number, sd: number): number {
  if (sd === 0) return 50; // 표준편차가 0이면 평균 반환
  return 50 + 10 * (rawScore - mean) / sd;
}

/**
 * T점수에서 백분위 계산 (정규분포 가정)
 * T점수는 평균 50, 표준편차 10의 표준화된 점수
 */
function tScoreToPercentile(tScore: number): number {
  // T점수를 Z점수로 변환: Z = (T - 50) / 10
  const zScore = (tScore - 50) / 10;

  // Z점수를 백분위로 변환 (근사 공식)
  // 정규분포 누적분포함수(CDF) 근사
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  let percentile;
  if (zScore >= 0) {
    percentile = (1 - probability) * 100;
  } else {
    percentile = probability * 100;
  }

  // 0-100 범위로 제한
  return Math.round(Math.max(0, Math.min(100, percentile)));
}

/**
 * CSV 데이터에서 통계 계산 (규준 데이터)
 */
export async function calculateNormStatistics(): Promise<Statistics> {
  try {
    // 클라이언트 사이드에서는 public 폴더의 파일을 fetch
    const response = await fetch('/norm-data.csv');
    const csvText = await response.text();

    // CSV 파싱
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');

    // 각 척도별 원점수 배열
    const machScores: number[] = [];
    const narcScores: number[] = [];
    const psycScores: number[] = [];
    const sadiScores: number[] = [];

    // 데이터 행 처리 (헤더 제외)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');

      // Mach (DTMC1-6)
      const machScore =
        parseInt(values[7]) + parseInt(values[8]) + parseInt(values[9]) +
        parseInt(values[10]) + parseInt(values[11]) + parseInt(values[12]);
      machScores.push(machScore);

      // Narc (DTNC1-6)
      const narcScore =
        parseInt(values[13]) + parseInt(values[14]) + parseInt(values[15]) +
        parseInt(values[16]) + parseInt(values[17]) + parseInt(values[18]);
      narcScores.push(narcScore);

      // Psyc (DTPS1, 2, 3, 5, 6, 7)
      const psycScore =
        parseInt(values[19]) + parseInt(values[20]) + parseInt(values[21]) +
        parseInt(values[22]) + parseInt(values[23]) + parseInt(values[24]);
      psycScores.push(psycScore);

      // Sadi (DTSD1, 2, 3, 5, 6)
      const sadiScore =
        parseInt(values[25]) + parseInt(values[26]) + parseInt(values[27]) +
        parseInt(values[28]) + parseInt(values[29]);
      sadiScores.push(sadiScore);
    }

    // 각 척도별 통계 계산
    const machMean = mean(machScores);
    const narcMean = mean(narcScores);
    const psycMean = mean(psycScores);
    const sadiMean = mean(sadiScores);

    return {
      mach: {
        mean: machMean,
        sd: standardDeviation(machScores, machMean),
        min: Math.min(...machScores),
        max: Math.max(...machScores),
        n: machScores.length,
      },
      narc: {
        mean: narcMean,
        sd: standardDeviation(narcScores, narcMean),
        min: Math.min(...narcScores),
        max: Math.max(...narcScores),
        n: narcScores.length,
      },
      psyc: {
        mean: psycMean,
        sd: standardDeviation(psycScores, psycMean),
        min: Math.min(...psycScores),
        max: Math.max(...psycScores),
        n: psycScores.length,
      },
      sadi: {
        mean: sadiMean,
        sd: standardDeviation(sadiScores, sadiMean),
        min: Math.min(...sadiScores),
        max: Math.max(...sadiScores),
        n: sadiScores.length,
      },
    };
  } catch (error) {
    console.error('규준 통계 계산 오류:', error);
    // 기본값 반환 (오류 시)
    return {
      mach: { mean: 15, sd: 4.5, min: 6, max: 30, n: 0 },
      narc: { mean: 15, sd: 4.5, min: 6, max: 30, n: 0 },
      psyc: { mean: 12, sd: 4, min: 6, max: 30, n: 0 },
      sadi: { mean: 10, sd: 3.5, min: 5, max: 25, n: 0 },
    };
  }
}

/**
 * 규준 기반 T점수 계산
 */
export async function calculateNormTScores(rawScores: RawScores): Promise<TScores> {
  const normStats = await calculateNormStatistics();

  return {
    mach: calculateTScore(rawScores.mach, normStats.mach.mean, normStats.mach.sd),
    narc: calculateTScore(rawScores.narc, normStats.narc.mean, normStats.narc.sd),
    psyc: calculateTScore(rawScores.psyc, normStats.psyc.mean, normStats.psyc.sd),
    sadi: calculateTScore(rawScores.sadi, normStats.sadi.mean, normStats.sadi.sd),
  };
}

/**
 * 규준 기반 백분위 계산 (T점수 기준)
 */
export async function calculateNormPercentiles(rawScores: RawScores): Promise<Percentiles> {
  try {
    // T점수를 먼저 계산
    const tScores = await calculateNormTScores(rawScores);

    // T점수를 백분위로 변환
    return {
      mach: tScoreToPercentile(tScores.mach),
      narc: tScoreToPercentile(tScores.narc),
      psyc: tScoreToPercentile(tScores.psyc),
      sadi: tScoreToPercentile(tScores.sadi),
    };
  } catch (error) {
    console.error('백분위 계산 오류:', error);
    return { mach: 50, narc: 50, psyc: 50, sadi: 50 };
  }
}
