/**
 * Hook for fetching dynamic data for StageRunner elements
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import axiosWrapper from '../../utils/AxiosWrapper';

/**
 * Fetches compo data including productions list
 */
export const useCompoData = (hasCompoId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasCompoId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const client = axiosWrapper();
        const response = await client.get(`/api/stagerunner-data/compo/${hasCompoId}/`);
        setData(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching compo data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasCompoId]);

  return { data, loading, error };
};

/**
 * Fetches compo results with scores
 */
export const useCompoResults = (hasCompoId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasCompoId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const client = axiosWrapper();
        const response = await client.get(`/api/stagerunner-data/results/${hasCompoId}/`);
        setData(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching results');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasCompoId]);

  return { data, loading, error };
};

/**
 * Fetches sponsors for an edition
 */
export const useSponsors = (editionId) => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!editionId) {
      setSponsors([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const client = axiosWrapper();
        const response = await client.get(`/api/stagerunner-data/sponsors/${editionId}/`);
        setSponsors(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching sponsors');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [editionId]);

  return { sponsors, loading, error };
};

/**
 * Fetches edition info
 */
export const useEditionInfo = (editionId) => {
  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!editionId) {
      setEdition(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const client = axiosWrapper();
        const response = await client.get(`/api/stagerunner-data/edition/${editionId}/`);
        setEdition(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching edition info');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [editionId]);

  return { edition, loading, error };
};

/**
 * Polls stage control state for synchronization
 */
export const useStageControl = (configId, pollInterval = 5000) => {
  const [control, setControl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastStateRef = useRef(null);

  const fetchControl = useCallback(async () => {
    if (!configId) return;

    try {
      const client = axiosWrapper();
      const response = await client.get(`/api/stage-control/by-config/?config=${configId}`);
      const newControl = response.data;

      // Check if any relevant state has changed
      const lastState = lastStateRef.current;
      const hasChanged = !lastState ||
        lastState.command_timestamp !== newControl.command_timestamp ||
        lastState.current_slide_index !== newControl.current_slide_index ||
        lastState.current_production_index !== newControl.current_production_index ||
        lastState.revealed_positions !== newControl.revealed_positions ||
        lastState.is_playing !== newControl.is_playing;

      if (hasChanged) {
        lastStateRef.current = newControl;
        setControl(newControl);
      }
    } catch (err) {
      setError(err.message || 'Error fetching control state');
    }
  }, [configId]);

  // Initial fetch
  useEffect(() => {
    if (!configId) {
      setControl(null);
      lastStateRef.current = null;
      return;
    }

    setLoading(true);
    fetchControl().finally(() => setLoading(false));
  }, [configId, fetchControl]);

  // Polling
  useEffect(() => {
    if (!configId || pollInterval <= 0) return;

    const interval = setInterval(fetchControl, pollInterval);
    return () => clearInterval(interval);
  }, [configId, pollInterval, fetchControl]);

  return { control, loading, error, refetch: fetchControl };
};

/**
 * Combined hook for all StageRunner dynamic data
 */
export const useStageRunnerData = (config, currentSlide) => {
  const editionId = config?.edition;
  const hasCompoId = currentSlide?.has_compo;

  const { data: compoData, loading: compoLoading } = useCompoData(hasCompoId);
  const { data: resultsData, loading: resultsLoading } = useCompoResults(
    ['results_live', 'results_final', 'podium'].includes(currentSlide?.slide_type) ? hasCompoId : null
  );
  const { sponsors, loading: sponsorsLoading } = useSponsors(editionId);
  const { edition, loading: editionLoading } = useEditionInfo(editionId);

  return {
    compoData,
    resultsData,
    sponsors,
    edition,
    loading: compoLoading || resultsLoading || sponsorsLoading || editionLoading,
  };
};

export default useStageRunnerData;
