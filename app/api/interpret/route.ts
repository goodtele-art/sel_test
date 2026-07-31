import { NextRequest, NextResponse } from "next/server";
import { generateInterpretation } from "@/lib/claude";

// 긴 해석문 생성에 30초 이상 걸릴 수 있어 기본 타임아웃으로는 부족함
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { age, gender, rawScores, tScores, percentiles, additionalInfo } =
      body;

    // 입력 검증
    if (!age || !gender || !rawScores || !tScores || !percentiles) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // Claude API 호출
    const interpretation = await generateInterpretation({
      age,
      gender,
      rawScores,
      tScores,
      percentiles,
      additionalInfo: additionalInfo || {},
    });

    return NextResponse.json({ interpretation });
  } catch (error) {
    console.error("API 오류:", error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
