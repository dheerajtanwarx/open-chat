import OpenAI, { AzureOpenAI } from "openai";

function normalizeEndpoint(rawEndpoint: string) {
  try {
    const url = new URL(rawEndpoint.trim());
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/+$/, "") + "/";
  } catch {
    return rawEndpoint.trim().replace(/\?.*$/, "").replace(/\/+$/, "") + "/";
  }
}

function isV1Endpoint(endpoint: string) {
  return /\/openai\/v1\/?$/i.test(endpoint.replace(/\?.*$/, "").replace(/\/+$/, ""));
}

export function getOpenAIClient() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT ?? process.env.OPENAI_BASE_URL;

  if (!apiKey) {
    throw new Error("Azure OpenAI API key not configured");
  }

  if (!endpoint) {
    throw new Error("Azure OpenAI endpoint not configured");
  }

  const normalizedEndpoint = endpoint.trim();

  if (isV1Endpoint(normalizedEndpoint)) {
    return new OpenAI({
      apiKey,
      baseURL: normalizedEndpoint.replace(/\?.*$/, "").replace(/\/+$/, "") + "/",
    });
  }

  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? process.env.OPENAI_API_VERSION;
  if (!apiVersion) {
    throw new Error("Azure OpenAI API version not configured");
  }

  return new AzureOpenAI({
    apiKey,
    endpoint: normalizeEndpoint(normalizedEndpoint),
    apiVersion,
  });
}

export function getLLMModel() {
  const model =
    process.env.AZURE_OPENAI_DEPLOYMENT ??
    process.env.OPENAI_MODEL ??
    "";

  if (!model) {
    throw new Error("Azure OpenAI deployment/model is not configured");
  }

  return model;
}
