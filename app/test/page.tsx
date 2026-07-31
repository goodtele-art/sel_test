"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TestStart() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    gender: "" as "1" | "2" | "",
    age: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 컴포넌트 마운트 시 이전 검사 데이터 모두 초기화
  useEffect(() => {
    sessionStorage.removeItem("testData");
    sessionStorage.removeItem("testResponses");
    sessionStorage.removeItem("additionalInfo");
    sessionStorage.removeItem("interpretationType");
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
    }

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 10 || age > 100) {
      newErrors.age = "10세에서 100세 사이의 나이를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // 로컬 스토리지에 임시 저장 (페이지 새로고침 대비)
      sessionStorage.setItem("testData", JSON.stringify({
        gender: formData.gender,
        age: formData.age,
      }));

      // 검사 문항 페이지로 이동
      router.push("/test/questions");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl"></div>
      </div>

      <main className="max-w-md w-full space-y-6 relative z-10">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-stone-200 bg-clip-text text-transparent">
            검사 시작
          </h1>
          <p className="text-stone-400">
            기본 정보를 입력해주세요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-stone-800/80 to-neutral-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-amber-500/20 p-6 md:p-8 space-y-6">
          {/* 성별 */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-amber-300">
              성별 <span className="text-amber-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: "1" })}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  formData.gender === "1"
                    ? "border-amber-500 bg-amber-500/20 text-amber-200 shadow-lg shadow-amber-500/20"
                    : "border-stone-600 text-stone-300 hover:border-amber-500/50 bg-stone-900/50"
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: "2" })}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  formData.gender === "2"
                    ? "border-amber-500 bg-amber-500/20 text-amber-200 shadow-lg shadow-amber-500/20"
                    : "border-stone-600 text-stone-300 hover:border-amber-500/50 bg-stone-900/50"
                }`}
              >
                여성
              </button>
            </div>
            {errors.gender && (
              <p className="text-sm text-red-400">{errors.gender}</p>
            )}
          </div>

          {/* 나이 */}
          <div className="space-y-3">
            <label htmlFor="age" className="block text-sm font-semibold text-amber-300">
              나이 <span className="text-amber-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              inputMode="numeric"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-600 bg-stone-900/50 text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:outline-none transition-colors"
              placeholder="나이를 입력하세요"
            />
            {errors.age && (
              <p className="text-sm text-red-400">{errors.age}</p>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-4 px-6 rounded-xl shadow-2xl transition-all duration-300 active:scale-98 border border-amber-400/50"
          >
            다음 단계 →
          </button>
        </form>

        {/* 뒤로 가기 */}
        <Link
          href="/"
          className="block text-center text-stone-400 hover:text-amber-400 transition-colors"
        >
          ← 처음으로 돌아가기
        </Link>
      </main>
    </div>
  );
}
