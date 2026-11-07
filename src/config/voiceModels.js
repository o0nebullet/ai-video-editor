import {
  loadFromMirroredRepository,
  mirroredModelBaseUrls,
  mirroredModelFileUrls,
} from "../lib/modelSources.js";

export const VOICE_MODEL_REPOSITORY = "timeline-studio-voice-models";
export const VOICE_MODEL_HUGGING_FACE_REVISION = "074a57bc4dac9c58568b031898ea79da6f36b282";
export const VOICE_MODEL_MODELSCOPE_REVISION = "9cb5ab964c014b182701153bd00f7a2202f5dce8";
// Kho Hugging Face rieng cua AD (username InYCB), chi chua giong Viet mms-vie.
// Giong MMS khac (kor/rus/tha) khong co trong kho AD -> fallback ModelScope tac gia.
export const MMS_VOICE_MODEL_HUGGING_FACE_OWNER = "InYCB";
export const MMS_VOICE_MODEL_HUGGING_FACE_REVISION = "7590395bb782bfff8e574c49da7e64a09d8e86de";
export const OPENVOICE_HUGGING_FACE_REVISION = "d9e0542e0e4e8fcfb849240f7e8e7fa8147df1a3";
export const OPENVOICE_MODELSCOPE_REVISION = "226b24270b69b38781a35566c7d442061f9e3b81";

const mirrorOptions = (path, preference) => ({
  repository: VOICE_MODEL_REPOSITORY,
  huggingFaceRevision: VOICE_MODEL_HUGGING_FACE_REVISION,
  modelScopeRevision: VOICE_MODEL_MODELSCOPE_REVISION,
  path,
  preference,
});

export function voiceModelFileUrls(path, preference) {
  return mirroredModelFileUrls(mirrorOptions(path, preference));
}

export function openVoiceModelFileUrls(path, preference) {
  return mirroredModelFileUrls({
    repository: VOICE_MODEL_REPOSITORY,
    huggingFaceRevision: OPENVOICE_HUGGING_FACE_REVISION,
    modelScopeRevision: OPENVOICE_MODELSCOPE_REVISION,
    path,
    preference,
  });
}

export function voiceModelBaseUrls(path, preference) {
  return mirroredModelBaseUrls(mirrorOptions(path, preference));
}

export function loadVoiceModelFromMirrors(transformersEnv, modelPath, loader, preference, overrides = {}) {
  return loadFromMirroredRepository(transformersEnv, {
    ...mirrorOptions("", preference),
    modelPath,
    ...overrides,
  }, loader);
}
