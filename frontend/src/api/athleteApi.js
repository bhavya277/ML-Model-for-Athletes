import apiClient from './client';
import masterDataset from '../data/realDataset.json';
import { generateRecommendations } from '../utils/risk';

/**
 * Athlete & ML Model API Service
 * Implements an abstraction layer that can query a live backend or serve from verified repository artifacts.
 */
export const athleteApi = {
  /**
   * Fetch all athletes with optional filtering & pagination
   */
  async getAthletes(params = {}) {
    try {
      // Try querying live backend endpoint if configured
      if (import.meta.env.VITE_USE_LIVE_BACKEND === 'true') {
        const response = await apiClient.get('/athletes', { params });
        return response.data;
      }
    } catch (e) {
      console.warn('Live API unavailable, utilizing verified repository artifacts:', e.message);
    }

    // Local verified repository adapter
    let list = [...masterDataset.athletes];
    
    if (params.sport && params.sport !== 'All') {
      list = list.filter(a => a.sport.toLowerCase() === params.sport.toLowerCase());
    }
    if (params.position && params.position !== 'All') {
      list = list.filter(a => a.position.toLowerCase() === params.position.toLowerCase());
    }
    if (params.riskTier && params.riskTier !== 'All') {
      list = list.filter(a => a.predictions.riskTier.toLowerCase() === params.riskTier.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(a => 
        a.athleteId.toString().includes(q) ||
        a.sport.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q) ||
        a.teamId.toLowerCase().includes(q)
      );
    }
    if (params.sortBy) {
      if (params.sortBy === 'risk_desc') {
        list.sort((a, b) => b.predictions.probability - a.predictions.probability);
      } else if (params.sortBy === 'risk_asc') {
        list.sort((a, b) => a.predictions.probability - b.predictions.probability);
      } else if (params.sortBy === 'id_asc') {
        list.sort((a, b) => a.athleteId - b.athleteId);
      } else if (params.sortBy === 'onset_asc') {
        list.sort((a, b) => a.predictions.onsetDayOffset - b.predictions.onsetDayOffset);
      } else if (params.sortBy === 'recovery_desc') {
        list.sort((a, b) => b.predictions.recoveryDurationDays - a.predictions.recoveryDurationDays);
      }
    }

    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 25;
    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Fetch single athlete by ID
   */
  async getAthleteById(id) {
    try {
      if (import.meta.env.VITE_USE_LIVE_BACKEND === 'true') {
        const response = await apiClient.get(`/athletes/${id}`);
        return response.data;
      }
    } catch (e) {
      console.warn(`Live API error for athlete ${id}:`, e.message);
    }

    const athleteId = parseInt(id);
    const athlete = masterDataset.athletes.find(a => a.athleteId === athleteId);
    if (!athlete) {
      throw new Error(`Athlete #${id} not found in test cohort.`);
    }
    return { data: athlete };
  },

  /**
   * Fetch risk assessment & recommendations for an athlete
   */
  async getAthleteRisk(id) {
    const { data: athlete } = await this.getAthleteById(id);
    const recommendations = generateRecommendations(athlete);
    return {
      athleteId: athlete.athleteId,
      predictions: athlete.predictions,
      metrics: athlete.metrics,
      recommendations
    };
  },

  /**
   * Fetch overall dataset metadata & validated model metrics
   */
  async getModelMetrics() {
    try {
      if (import.meta.env.VITE_USE_LIVE_BACKEND === 'true') {
        const response = await apiClient.get('/model/metrics');
        return response.data;
      }
    } catch (e) {
      console.warn('Live metrics API unavailable, utilizing repository artifacts:', e.message);
    }

    return {
      metadata: masterDataset.metadata,
      validation: masterDataset.modelValidation,
      featureDictionary: masterDataset.featureDictionary,
      boundaryReport: masterDataset.boundaryReport
    };
  }
};
