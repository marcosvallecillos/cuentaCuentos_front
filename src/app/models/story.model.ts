export interface StoryResponse {
  historia: string;
  audio_text: string;
  necesita_interaccion: boolean;
  prompt_interaccion?: string;
  progreso: {
    completado: boolean;
    interaccion_actual: number;
  };
}

export interface AgeGroup {
  name: string;
  color: string;
  story_length: number;
  vocabulary: string;
  interactions: number;
}

export interface DrawingData {
  imageData: string;
  label: string;
}