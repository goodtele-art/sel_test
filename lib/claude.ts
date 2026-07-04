import Anthropic from "@anthropic-ai/sdk";
import { RawScores, TScores, Percentiles } from "./types";

// API 키 존재 여부 확인
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY가 설정되지 않았습니다!");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface InterpretationRequest {
  age: number;
  gender: 1 | 2;
  rawScores: RawScores;
  tScores: TScores;
  percentiles: Percentiles;
  additionalInfo?: {
    myPersonality?: string;
    childhoodEvent?: string;
    comfortableClients?: string;
    difficultClients?: string;
    recentStress?: string;
  };
}

export async function generateInterpretation(
  data: InterpretationRequest
): Promise<string> {
  const genderText = data.gender === 1 ? "남성" : "여성";

  const prompt = `당신은 임상심리학자로서 다크 테트라드(Dark Tetrad) 성격 검사 결과를 해석하는 전문가입니다.

## 상담자(검사 실시자) 정보
- 성별: ${genderText}
- 나이: ${data.age}세
${data.additionalInfo?.myPersonality ? `- 내가 생각하는 나의 성격: ${data.additionalInfo.myPersonality}` : ""}
${data.additionalInfo?.childhoodEvent ? `- 어린 시절 생각나는 중요한 사건: ${data.additionalInfo.childhoodEvent}` : ""}
${data.additionalInfo?.comfortableClients ? `- 나에게 잘 이해되는 내담자: ${data.additionalInfo.comfortableClients}` : ""}
${data.additionalInfo?.difficultClients ? `- 나에게 불편한, 또는 어려운 내담자: ${data.additionalInfo.difficultClients}` : ""}
${data.additionalInfo?.recentStress ? `- 나의 최근 스트레스: ${data.additionalInfo.recentStress}` : ""}

## 검사 결과
### 원점수 (Raw Scores)
- 마키아벨리즘 (Mach): ${data.rawScores.mach}/30
- 나르시시즘 (Narc): ${data.rawScores.narc}/30
- 사이코패시 (Psyc): ${data.rawScores.psyc}/30
- 사디즘 (Sadi): ${data.rawScores.sadi}/25

### T점수 (표준화 점수, 평균=50, 표준편차=10)
- 마키아벨리즘: T=${data.tScores.mach.toFixed(1)} (${data.percentiles.mach}백분위)
- 나르시시즘: T=${data.tScores.narc.toFixed(1)} (${data.percentiles.narc}백분위)
- 사이코패시: T=${data.tScores.psyc.toFixed(1)} (${data.percentiles.psyc}백분위)
- 사디즘: T=${data.tScores.sadi.toFixed(1)} (${data.percentiles.sadi}백분위)

## 해석 가이드라인
- T점수 <40: 낮음
- T점수 40-60: 평균 범위
- T점수 >60: 높음

## 요청사항
당신은 검사를 받은 상담자에게 따뜻하고 친근하게 조언하는 선배 상담자입니다. 친구에게 편지를 쓰듯이 자연스럽고 부드럽게 이야기해주세요.

다음 내용을 포함하되, **마크다운 기호(#, ##, ###, ####, -, *)를 일절 사용하지 말고**, 자연스러운 문장으로 작성해주세요:

먼저 전체적인 성격 프로필에 대해 이야기해주세요. (150-200자)
4가지 척도를 종합하여 전반적인 성격 특징을 따뜻하게 설명해주세요.

그 다음 각 척도별로 구체적으로 이야기해주세요. (각 100-150자)
"마키아벨리즘에 대해 말씀드리자면...", "나르시시즘을 보면...", "사이코패시는..." , "사디즘의 경우..." 같은 자연스러운 말투로 시작하여, T점수와 입력한 정보를 고려하여 설명해주세요.

그리고 상담 관계에서의 시사점을 이야기해주세요. (150-200자)
성격 특성이 상담 관계에 미치는 영향을 설명하되, '잘 이해되는 내담자'와 '어려운 내담자' 정보를 반드시 언급해주세요.

마지막으로 자기 성찰과 발전 방향을 제안해주세요. (150-200자)
따뜻하게 격려하면서 구체적인 조언을 해주세요. 최근 스트레스도 고려해주세요.

---

**중요한 작성 지침**:
- 상담자 본인을 위한 교육용이므로 "당신", "선생님" 같은 2인칭 호칭을 사용하세요
- 진단하는 것이 아니라 친구처럼 공감하고 조언하는 톤으로 작성하세요
- 마크다운 기호를 절대 사용하지 마세요. 모든 제목은 자연스러운 문장으로 시작하세요
- 입력된 개인 정보(성격, 어린 시절 경험, 편한/어려운 내담자, 스트레스)를 반드시 언급하며 맥락화하세요
- 강점을 먼저 인정하고, 발전 방향을 부드럽게 제안하세요
- 따뜻하고 격려하는 편지 같은 느낌으로 작성하세요`;

  try {
    // Vercel 환경에서 fetch를 직접 사용
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 응답 오류 (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const textContent = data.content?.find((block: any) => block.type === "text");

    if (textContent && textContent.text) {
      return textContent.text;
    }

    throw new Error("AI 응답 형식 오류");
  } catch (error) {
    console.error("Claude API 오류:", error);
    // 더 자세한 에러 메시지 반환
    if (error instanceof Error) {
      throw new Error(`AI 해석 생성 중 오류: ${error.message}`);
    }
    throw new Error("AI 해석 생성 중 알 수 없는 오류가 발생했습니다.");
  }
}
