// Core exports for Holistic Divination

// Inference
export { HybridAIEngine, SecureConfigStorage } from './inference/ai-engine';
export { DEFAULT_CONFIG, SUPPORTED_PROVIDERS, MODE_OPTIONS, COMPLEXITY_SETTINGS } from './inference/config';
export type { 
  AIConfig, 
  AIMode, 
  APIProvider,
  InferenceRequest, 
  InferenceResult,
  PersonInfo,
  LunarDateInfo,
  QuestionInfo,
  HexagramResult,
  ClassicReference,
} from './inference/ai-engine';

// Collection
export { 
  HolisticInfoCollector, 
  COLLECTION_SCHEMA,
  CollectionPhase,
  CollectionUrgency,
} from './collection/holistic-collector';
export type { 
  HolisticPersonContext,
  CollectionSection,
  CollectionField,
  CollectionProgress,
  QuestionDomain,
  LifeStage,
  EmotionalState,
} from './collection/holistic-collector';

// Engine
export { UniqueDivinationKeyGenerator } from './engine/key-generator';
export type { DivinationKey } from './engine/key-generator';
export { SixLayerFusionEngine } from './engine/six-layer-engine';
export type { 
  GongLiLayer,
  TiYongLayer,
  JiBianLayer,
  QuXiangLayer,
  YiLiLayer,
  ClassicCitation,
  FinalDivinationResult,
} from './engine/six-layer-engine';

// Data
export { CLASSICS_LIBRARY, ClassicLibraryImpl } from './data/classics-data';
export type { ClassicEntry, ClassicCategory, ClassicLibrary } from './data/types';

// Utils
export { LunarCalendarConverter, TIAN_GAN, DI_ZHI, SOLAR_TERMS } from './utils/lunar-calendar';
export type { LunarDate, EightCharacters, CompleteLunarInfo } from './utils/lunar-calendar';

// Default export
export { SixLayerFusionEngine as default } from './engine/six-layer-engine';