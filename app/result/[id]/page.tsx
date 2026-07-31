"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ScoreChart from "@/components/ScoreChart";
import InterpretationSection from "@/components/InterpretationSection";
import { Scale, Responses } from "@/lib/types";
import {
  calculateRawScores,
  calculateNormTScores,
  calculateNormPercentiles,
} from "@/lib/scoring";

export default function ResultPage({
  params,
}: {
  params: { id: string };
}) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      try {
        // 세션 스토리지에서 데이터 가져오기
        const testData = sessionStorage.getItem("testData");
        const testResponses = sessionStorage.getItem("testResponses");
        const interpretationType = sessionStorage.getItem("interpretationType");
        const additionalInfo = sessionStorage.getItem("additionalInfo");

        if (!testData || !testResponses) {
          setLoading(false);
          return;
        }

        const data = JSON.parse(testData);
        const responses: Responses = JSON.parse(testResponses);

        // 원점수 계산
        const rawScores = calculateRawScores(responses);

        // T점수 계산 (규준 기반)
        const tScoresNorm = await calculateNormTScores(rawScores);

        // 백분위 계산 (규준 기반)
        const percentilesNorm = await calculateNormPercentiles(rawScores);

        // 결과 객체 생성
        const resultData = {
          id: params.id,
          gender: parseInt(data.gender) as 1 | 2,
          age: parseInt(data.age),
          rawScores,
          tScoresNorm,
          percentilesNorm,
          aiInterpretation: null,
        };

        setResult(resultData);
        setLoading(false);

        // AI 해석 요청
        if (interpretationType === "ai") {
          setAiLoading(true);
          try {
            const additionalData = additionalInfo
              ? JSON.parse(additionalInfo)
              : {};

            const response = await fetch("/api/interpret", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                age: resultData.age,
                gender: resultData.gender,
                rawScores: resultData.rawScores,
                tScores: resultData.tScoresNorm,
                percentiles: resultData.percentilesNorm,
                additionalInfo: additionalData,
              }),
            });

            if (response.ok) {
              const { interpretation } = await response.json();
              setResult((prev: any) => ({
                ...prev,
                aiInterpretation: interpretation,
              }));
            } else {
              console.error("AI 해석 요청 실패");
            }
          } catch (error) {
            console.error("AI 해석 오류:", error);
          } finally {
            setAiLoading(false);
          }
        }
      } catch (error) {
        console.error("결과 로딩 오류:", error);
        setLoading(false);
      }
    };

    loadResult();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto" />
          <p className="text-stone-300">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900">
        <div className="text-center space-y-4">
          <p className="text-stone-300">결과를 찾을 수 없습니다.</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg border border-amber-400/50"
          >
            처음으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const scales: Scale[] = ["mach", "narc", "psyc", "sadi"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 py-8 px-4 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-full border border-amber-500/30 mb-2">
            <span className="text-amber-400 text-sm font-medium">Assessment Result</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-stone-200 bg-clip-text text-transparent">
            검사 결과
          </h1>
          <p className="text-stone-400 text-sm">
            {result.gender === 1 ? "남성" : "여성"}, {result.age}세
          </p>
        </div>

        {/* 원점수 요약 */}
        <div className="bg-gradient-to-br from-stone-800/80 to-neutral-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-amber-500/20 p-6">
          <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
            원점수 요약
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scales.map((scale) => {
              const maxScore = scale === "sadi" ? 25 : 30;
              return (
                <div
                  key={scale}
                  className="bg-gradient-to-br from-stone-900/50 to-neutral-900/50 border border-amber-500/20 rounded-xl p-4 text-center hover:border-amber-500/40 transition-all"
                >
                  <div className="text-sm text-amber-400 mb-1 font-semibold">
                    {scale.toUpperCase()}
                  </div>
                  <div className="text-3xl font-bold text-stone-100">
                    {result.rawScores[scale]}
                  </div>
                  <div className="text-xs text-stone-500">/ {maxScore}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* T점수 그래프 */}
        <ScoreChart
          scores={{
            mach: result.tScoresNorm.mach,
            narc: result.tScoresNorm.narc,
            psyc: result.tScoresNorm.psyc,
            sadi: result.tScoresNorm.sadi,
          }}
        />

        {/* 척도별 해석 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-200">척도별 해석</h2>
          {scales.map((scale) => (
            <InterpretationSection
              key={scale}
              scale={scale}
              tScore={result.tScoresNorm[scale]}
              percentile={result.percentilesNorm[scale]}
            />
          ))}
        </div>

        {/* AI 맞춤 해석 */}
        {aiLoading && (
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h2 className="text-xl font-semibold text-purple-300">
                AI 맞춤 해석
              </h2>
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto" />
                <p className="text-purple-300">AI가 검사 결과를 분석하고 있습니다...</p>
                <p className="text-purple-400 text-sm">약 30초-1분 소요됩니다</p>
              </div>
            </div>
          </div>
        )}

        {!aiLoading && result.aiInterpretation && (
          <div className="bg-gradient-to-br from-amber-50/5 to-stone-50/5 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-amber-300/20 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-amber-300/20">
              <span className="text-3xl">✉️</span>
              <h2 className="text-2xl font-serif text-amber-200">
                당신을 위한 메시지
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-amber-50/90 leading-loose whitespace-pre-line font-serif text-[17px] tracking-wide" style={{lineHeight: '2.0'}}>
                {result.aiInterpretation}
              </p>
              <div className="mt-8 pt-6 border-t border-amber-300/20 text-right">
                <p className="text-amber-300/70 font-serif text-sm italic">
                  - 당신의 성장을 응원하는 마음을 담아
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 주의사항 */}
        <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 rounded-2xl border-2 border-amber-500/30 p-6 backdrop-blur-sm">
          <h3 className="font-semibold text-amber-300 mb-3 flex items-center gap-2">
            <span className="text-amber-400">⚠</span>
            결과 활용 시 주의사항
          </h3>
          <ul className="text-sm text-amber-200/90 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>본 검사는 상담 전문가를 위한 교육용 도구입니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>검사 결과는 참고 자료로만 활용하시기 바랍니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>임상적 판단이 필요한 경우 반드시 전문가와 상담하시기 바랍니다.</span>
            </li>
          </ul>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 text-center py-4 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-2xl transition-all active:scale-98 border border-amber-400/50"
          >
            처음으로 돌아가기
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 py-4 px-6 bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 font-semibold rounded-xl shadow-lg border-2 border-stone-600 hover:border-amber-500/50 transition-all active:scale-98"
          >
            결과 인쇄하기
          </button>
        </div>
      </div>
    </div>
  );
}
