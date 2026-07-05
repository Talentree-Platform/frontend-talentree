export interface ChurnPredictionResponse {
  user_id: string;
  churn_risk_score: number;
}

export interface FraudPredictionResponse {
  request_id: number;
  fraud_score: number;
  is_fraud: boolean;
}

export interface AnomalyPredictionResponse {
  tx_id: number;
  anomaly_score: number;
  is_anomaly: boolean;
}

export interface SentimentPredictionResponse {
  review_id: number;
  sentiment_score: number; // e.g. -1 to 1
  sentiment_label: string; // 'Positive' | 'Negative' | 'Neutral'
  flagged_toxic: boolean;
}
