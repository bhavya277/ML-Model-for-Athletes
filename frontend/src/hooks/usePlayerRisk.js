import { useState, useEffect } from 'react';
import { athleteApi } from '../api/athleteApi';

export const usePlayerRisk = (athleteId) => {
  const [athlete, setAthlete] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!athleteId) return;

    let isMounted = true;
    const fetchAthleteDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await athleteApi.getAthleteById(athleteId);
        const riskData = await athleteApi.getAthleteRisk(athleteId);
        
        if (isMounted) {
          setAthlete(data);
          setRecommendations(riskData.recommendations);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || `Failed to fetch athlete #${athleteId}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAthleteDetails();

    return () => {
      isMounted = false;
    };
  }, [athleteId]);

  return { athlete, recommendations, loading, error };
};
