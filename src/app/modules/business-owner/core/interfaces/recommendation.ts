export interface RecommendedMaterial {
  material_id: number;
  material_name: string;
  category: string;
  price: number;
  description: string;
  predicted_demand_qty: number;
  urgency_days_elapsed: number;
  urgency_cycle_days: number;
  score: number;
}

export interface OwnerRecommendationResponse {
  owner_id: string;
  recommendations: RecommendedMaterial[];
  model_version: string;
}
