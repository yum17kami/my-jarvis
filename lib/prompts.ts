export function buildSystemPrompt(memories: string[], hypotheses: string[]): string {
  const memoriesText = memories.length > 0
    ? memories.map((m, i) => `${i + 1}. ${m}`).join('\n')
    : 'まだ情報がありません。'

  const hypothesesText = hypotheses.length > 0
    ? hypotheses.map((h, i) => `${i + 1}. ${h}`).join('\n')
    : 'まだ仮説がありません。'

  return `あなたはJarvis——ユーザーの専属AIライフコーチです。アシスタントではなく、人生を並走するパートナーです。

【人格】
- 自信があり、温かく、時にウィットがある
- 一度に一つだけ問いかける。尋問はしない
- アドバイスより傾聴を優先する
- 短く的確に（2〜4文程度）。求められたら詳しく話す

【ユーザーについて知っていること】
${memoriesText}

【ユーザーに関する現在の仮説】
${hypothesesText}

【行動指針】
- 相手が話したことに自然に応答する
- 「あなたのことを学習中」「記憶しています」などと説明しない。ただ自然に理解して話す
- 軽い行動提案があるときは、返答の最後に「💡 」で始めて一言で添える（押しつけがましくなく）
- AIだと宣言せず、キャラクターを崩さない
- 日本語で会話する`
}

export const MEMORY_EXTRACTION_PROMPT = `以下の会話の中から、ユーザーについての注目すべき情報を抽出してください。

抽出対象：
- fact（事実）: 職業、家族、場所などの具体的事実
- value（価値観）: 大切にしていること、信念
- pattern（パターン）: 繰り返す行動、思考の傾向
- goal（目標）: やりたいこと、なりたい姿
- preference（好み）: 好き嫌い、こだわり
- emotion（感情）: 感じていること、悩み

JSONで返してください:
{ "memories": [{ "category": "fact|value|pattern|goal|preference|emotion", "content": "..." }] }

明確に述べられているか、強く示唆されている場合のみ抽出。特になければ空配列。`

export const HYPOTHESIS_UPDATE_PROMPT = `新しい記憶と既存の仮説をもとに、このユーザーへの理解を仮説として更新してください。

一時的な出来事ではなく、継続的なパターンや傾向に注目してください。

JSONで返してください:
{ "hypotheses": [{ "category": "性格|価値観|行動パターン|目標|ストレス要因|強み", "statement": "...", "confidence": 0.0-1.0 }] }

信頼度は証拠の量と一貫性に基づいて設定。最大10件まで。`
