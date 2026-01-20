const form = document.querySelector("[data-lab-form]");
const responseBox = document.querySelector("[data-response]");
const statusText = document.querySelector("[data-status]");
const saveButton = document.querySelector("[data-save]");
const clearButton = document.querySelector("[data-clear]");
const debugBox = document.querySelector("[data-debug]");
const debugPanel = document.querySelector("[data-debug-panel]");

const DEFAULT_MODEL = "LGAI-EXAONE/K-EXAONE-236B-A23B";
const DEFAULT_ENDPOINT = "https://api.friendli.ai/v1/chat/completions";

const storedKey = localStorage.getItem("friendli_api_key");
const storedEndpoint = localStorage.getItem("friendli_api_endpoint");
const storedModel = localStorage.getItem("friendli_api_model");

if (storedKey) {
  const keyInput = document.querySelector("#api-key");
  if (keyInput) keyInput.value = storedKey;
}

if (storedEndpoint) {
  const endpointInput = document.querySelector("#api-endpoint");
  if (endpointInput) endpointInput.value = storedEndpoint;
}

if (storedModel) {
  const modelInput = document.querySelector("#model");
  if (modelInput) modelInput.value = storedModel;
}

const updateStatus = (message) => {
  if (!statusText) return;
  statusText.textContent = message;
};

const updateDebug = (message) => {
  if (!debugBox) return;
  debugBox.textContent = message;
};

const setResponse = (message) => {
  if (!responseBox) return;
  responseBox.textContent = message;
};

const makeSystemPrompt = (mode) => {
  if (mode === "summary") {
    return "당신은 한국어 텍스트 요약 전문가입니다. 핵심 요점 3개와 한 줄 요약을 제공합니다.";
  }
  if (mode === "translation") {
    return "당신은 전문 번역가입니다. 자연스럽고 매끄러운 영어로 번역하세요.";
  }
  return "당신은 EXAONE 데모를 진행하는 도우미입니다. 친절하고 명확하게 답변하세요.";
};

const makeUserPrompt = (mode, input, option) => {
  if (mode === "summary") {
    return `다음 글을 요약해주세요. 요약 길이: ${option}\n\n${input}`;
  }
  if (mode === "translation") {
    return `다음 한국어를 영어로 번역해주세요. 톤: ${option}\n\n${input}`;
  }
  return input;
};

const mockAnswer = (mode, input) => {
  if (mode === "summary") {
    return `요약 데모\n- 핵심 1: ${input.slice(0, 40)}...\n- 핵심 2: 주요 아이디어를 분리했습니다.\n- 핵심 3: 결론을 정리했습니다.\n\n한 줄 요약: 입력한 텍스트의 핵심을 짧게 정리했습니다.`;
  }
  if (mode === "translation") {
    return `Demo Translation:\n${input}\n\n(실제 API 키를 입력하면 자연스러운 번역 결과가 나옵니다.)`;
  }
  return `EXAONE 데모 응답입니다.\n\n"${input}"에 대한 테스트 답변을 표시하고 있어요.\nAPI 키를 입력하면 실시간 응답이 출력됩니다.`;
};

const callFriendli = async ({ endpoint, apiKey, model, temperature, prompt, mode, option }) => {
  const payload = {
    model,
    messages: [
      { role: "system", content: makeSystemPrompt(mode) },
      { role: "user", content: makeUserPrompt(mode, prompt, option) },
    ],
    temperature,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`API 오류 (${response.status}): ${errorText}`);
    error.status = response.status;
    error.body = errorText;
    error.endpoint = endpoint;
    error.payload = payload;
    throw error;
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error("응답 데이터에서 메시지를 찾지 못했습니다.");
  }
  return message.trim();
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!form) return;

  const apiKey = form.querySelector("#api-key")?.value.trim();
  const endpoint = form.querySelector("#api-endpoint")?.value.trim() || DEFAULT_ENDPOINT;
  const model = form.querySelector("#model")?.value.trim() || DEFAULT_MODEL;
  const prompt = form.querySelector("#prompt")?.value.trim();
  const temperatureInput = Number(form.querySelector("#temperature")?.value || 0.7);
  const temperature = Math.min(1, Math.max(0, temperatureInput));
  const mode = document.body.dataset.mode;
  const option = form.querySelector("#option")?.value || "기본";
  const maskedKey = apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "없음";

  if (!prompt) {
    updateStatus("프롬프트를 입력해주세요.");
    updateDebug("입력된 프롬프트가 없습니다. 프롬프트를 추가한 뒤 다시 시도해주세요.");
    return;
  }

  setResponse("응답을 생성하는 중...");
  updateStatus("요청을 전송했습니다.");
  updateDebug(
    [
      `요청 모드: ${mode}`,
      `엔드포인트: ${endpoint}`,
      `모델: ${model}`,
      `온도: ${temperature}`,
      `옵션: ${option}`,
      `API 키: ${maskedKey}`,
      `프롬프트 길이: ${prompt.length}자`,
      `타임스탬프: ${new Date().toLocaleString()}`,
    ].join("\n")
  );

  try {
    if (!apiKey) {
      const demo = mockAnswer(mode, prompt);
      setResponse(demo);
      updateStatus("API 키가 없어 데모 응답을 보여드렸어요.");
      updateDebug(`${debugBox?.textContent}\n\n데모 모드로 응답을 생성했습니다.`);
      return;
    }

    const result = await callFriendli({
      endpoint,
      apiKey,
      model,
      temperature,
      prompt,
      mode,
      option,
    });
    setResponse(result);
    updateStatus("응답 수신 완료!");
    updateDebug(`${debugBox?.textContent}\n\n응답 길이: ${result.length}자`);
  } catch (error) {
    setResponse("오류가 발생했습니다. 입력값을 확인해주세요.");
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError =
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("NetworkError") ||
      errorMessage.includes("Network request failed");
    if (error?.status === 404) {
      updateStatus("API 경로를 찾지 못했습니다. 엔드포인트 URL을 확인해주세요.");
    } else if (isNetworkError) {
      updateStatus("네트워크 또는 CORS 오류입니다. 브라우저 콘솔과 API 권한을 확인해주세요.");
    } else {
      updateStatus(errorMessage);
    }
    const payloadPreview = error?.payload
      ? `\n요청 페이로드: ${JSON.stringify(error.payload, null, 2)}`
      : "";
    updateDebug(
      `${debugBox?.textContent}\n\n오류 발생: ${errorMessage}\n상태 코드: ${
        error?.status ?? "알 수 없음"
      }\n엔드포인트: ${error?.endpoint ?? "알 수 없음"}${payloadPreview}`
    );
  }
};

const handleSave = () => {
  if (!form) return;
  const apiKey = form.querySelector("#api-key")?.value.trim();
  const endpoint = form.querySelector("#api-endpoint")?.value.trim();
  const model = form.querySelector("#model")?.value.trim();

  if (apiKey) {
    localStorage.setItem("friendli_api_key", apiKey);
  }
  if (endpoint) {
    localStorage.setItem("friendli_api_endpoint", endpoint);
  }
  if (model) {
    localStorage.setItem("friendli_api_model", model);
  }
  updateStatus("설정이 저장되었습니다.");
  updateDebug("설정 저장: API 키/엔드포인트/모델 정보를 로컬 스토리지에 저장했습니다.");
};

const handleClear = () => {
  localStorage.removeItem("friendli_api_key");
  localStorage.removeItem("friendli_api_endpoint");
  localStorage.removeItem("friendli_api_model");
  const keyInput = form.querySelector("#api-key");
  const endpointInput = form.querySelector("#api-endpoint");
  const modelInput = form.querySelector("#model");
  if (keyInput) keyInput.value = "";
  if (endpointInput) endpointInput.value = DEFAULT_ENDPOINT;
  if (modelInput) modelInput.value = DEFAULT_MODEL;
  updateStatus("저장된 설정을 초기화했습니다.");
  updateDebug("저장된 설정을 모두 초기화했습니다.");
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (saveButton) {
  saveButton.addEventListener("click", handleSave);
}

if (clearButton) {
  clearButton.addEventListener("click", handleClear);
}

if (form && debugPanel) {
  const debugToggle = form.querySelector("#debug");
  if (debugToggle) {
    debugPanel.hidden = !debugToggle.checked;
    debugToggle.addEventListener("change", () => {
      debugPanel.hidden = !debugToggle.checked;
    });
  }
}
