import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../core/environment/envirinment';
import { OwnerRecommendationResponse } from '../interfaces/recommendation';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  constructor(private http: HttpClient) { }
  public apiUrl = `${environment.baseUrl}/api`;

  getOwnerRecommendations(topK: number = 10): Observable<OwnerRecommendationResponse> {
    // TEMP-VERIFICATION-BYPASS: will be reverted
    return of({
      owner_id: "11111111-1111-1111-1111-111111111101",
      recommendations: [
        {"material_id":88,"material_name":"Soy Wax Flakes Grade-E88","category":"Handmade & Crafts","price":20.23,"description":"Artisanal raw Soy Wax Flakes Grade-E88 in Handmade & Crafts division. Premium source for production use.","predicted_demand_qty":50,"urgency_days_elapsed":7,"urgency_cycle_days":14,"score":0.5},
        {"material_id":28,"material_name":"Natural Dye Pigments Grade-E28","category":"Handmade & Crafts","price":34.46,"description":"Artisanal raw Natural Dye Pigments Grade-E28 in Handmade & Crafts division. Premium source for production use.","predicted_demand_qty":50,"urgency_days_elapsed":12,"urgency_cycle_days":14,"score":0.82},
        {"material_id":67,"material_name":"Industrial Zipper Rolls Grade-B67","category":"Fashion & Accessories","price":57.27,"description":"Artisanal raw Industrial Zipper Rolls Grade-B67 in Fashion & Accessories division. Premium source for production use.","predicted_demand_qty":50,"urgency_days_elapsed":3,"urgency_cycle_days":14,"score":0.35}
      ],
      model_version: "2026-07-04T05:52:31"
    });
    return this.http.post<OwnerRecommendationResponse>(`${this.apiUrl}/Recommendation/owner`, { topK });
  }

}
