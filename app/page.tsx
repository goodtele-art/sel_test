import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl"></div>
      </div>

      <main className="max-w-2xl w-full space-y-8 relative z-10">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-full border border-amber-500/30 mb-4">
            <span className="text-amber-400 text-sm font-medium">Professional Assessment Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-stone-200 bg-clip-text text-transparent">
            다크 테트라드 성격 검사
          </h1>
        </div>

        {/* 검사 설명 */}
        <div className="bg-gradient-to-br from-stone-800/80 to-neutral-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-amber-500/20 p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></span>
              검사 소개
            </h2>
            <p className="text-stone-300 leading-relaxed">
              다크 테트라드는 4가지 어두운 성격 특성을 측정하는 검사입니다:
            </p>
            <ul className="space-y-3 text-stone-300">
              <li className="flex items-start group">
                <span className="text-amber-500 mr-3 mt-1">◆</span>
                <span className="group-hover:text-amber-200 transition-colors">
                  <strong className="text-amber-300">마키아벨리즘</strong>: 타인을 조작하거나 전략적으로 이용하는 경향
                </span>
              </li>
              <li className="flex items-start group">
                <span className="text-amber-500 mr-3 mt-1">◆</span>
                <span className="group-hover:text-amber-200 transition-colors">
                  <strong className="text-amber-300">나르시시즘</strong>: 자기중심적 성향과 과대한 자기상
                </span>
              </li>
              <li className="flex items-start group">
                <span className="text-amber-500 mr-3 mt-1">◆</span>
                <span className="group-hover:text-amber-200 transition-colors">
                  <strong className="text-amber-300">사이코패시</strong>: 충동성과 낮은 공감 능력
                </span>
              </li>
              <li className="flex items-start group">
                <span className="text-amber-500 mr-3 mt-1">◆</span>
                <span className="group-hover:text-amber-200 transition-colors">
                  <strong className="text-amber-300">사디즘</strong>: 타인의 고통에서 즐거움을 느끼는 경향
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 rounded-xl p-4 space-y-2 border border-amber-500/20">
            <h3 className="font-semibold text-amber-300 flex items-center gap-2">
              <span className="text-amber-400">✦</span> 검사 정보
            </h3>
            <ul className="text-sm text-stone-300 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                문항 수: 23문항
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                소요 시간: 약 5-7분
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                점수 산출: T점수 (규준 기반 + 누적 데이터 기반)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                AI 맞춤 해석 제공
              </li>
            </ul>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-4">
          <Link
            href="/test"
            className="block w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-5 px-6 rounded-xl shadow-2xl transition-all duration-300 text-center text-lg active:scale-98 border border-amber-400/50 hover:shadow-amber-500/50"
          >
            <span className="flex items-center justify-center gap-2">
              <span>검사 시작하기</span>
              <span className="text-xl">→</span>
            </span>
          </Link>

          <Link
            href="/retrieve"
            className="block w-full bg-stone-800/50 hover:bg-stone-700/50 text-stone-200 font-semibold py-4 px-6 rounded-xl shadow-lg border-2 border-stone-600/50 hover:border-amber-500/50 transition-all duration-300 text-center active:scale-98 backdrop-blur-sm"
          >
            <span className="flex items-center justify-center gap-2">
              <span>이전 결과 조회하기</span>
              <span className="text-amber-400">↻</span>
            </span>
          </Link>
        </div>

        {/* 주의사항 */}
        <div className="text-center text-sm text-stone-400 space-y-2 border-t border-stone-700 pt-6">
          <p className="flex items-center justify-center gap-2">
            <span className="text-amber-500">✦</span>
            본 검사는 상담 전문가를 위한 교육용 도구입니다.
          </p>
          <p className="flex items-center justify-center gap-2">
            <span className="text-amber-500">✦</span>
            검사 결과는 암호로 저장되며, 언제든지 재조회할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
