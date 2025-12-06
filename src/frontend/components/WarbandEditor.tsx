import { useState, useEffect, useMemo, useCallback } from 'react';
import { Warband, Weirdo, WarbandAbility, ValidationError } from '../../backend/models/types';
import { apiClient, ApiError } from '../services/apiClient';
import { useGameData } from '../contexts/GameDataContext';
import { WeirdoEditor } from './WeirdoEditor';
import { WarbandProperties } from './WarbandProperties';
import { WarbandCostDisplay } from './WarbandCostDisplay';
import { WeirdosList } from './WeirdosList';
import './WarbandEditor.css';

/**
 * WarbandEditorComponent
 * 
 * Manages warband-level properties and weirdos.
 * Provides real-time cost calculations and validation.
 * 
 * Requirements: 1.1, 1.2, 1.4, 9.4, 10.3, 11.1, 11.4, 15.1, 15.2, 15.3, 15.4, 15.5, 4.1, 4.3, 4.4
 */

interface WarbandEditorProps {
  warbandId?: string;
  onBack?: () => void;
}

export function WarbandEditor({ warbandId, onBack }: WarbandEditorProps) {
  const [warband, setWarband] = useState<Warband | null>(null);
  const [selectedWeirdoId, setSelectedWeirdoId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Use GameDataContext to get warband abilities
  const { data: gameData } = useGameData();
  
  // Build ability descriptions map from context data (memoized)
  // Requirements: 9.1 - useMemo for expensive calculations
  const abilityDescriptions = useMemo(() => {
    const descriptions: Record<string, string> = {};
    if (gameData?.warbandAbilities) {
      gameData.warbandAbilities.forEach((ability) => {
        descriptions[ability.name] = ability.description;
      });
    }
    return descriptions;
  }, [gameData?.warbandAbilities]);

  /**
   * Load existing warband or initialize new one
   * Requirements: 11.1, 12.1, 12.2
   */
  useEffect(() => {
    const initializeWarband = async () => {
      if (warbandId) {
        // Load existing warband
        setLoading(true);
        try {
          const loadedWarband = await apiClient.getWarband(warbandId);
          setWarband(loadedWarband);
        } catch (err) {
          if (err instanceof ApiError) {
            setError(`Failed to load warband: ${err.message}`);
          } else {
            setError('An unexpected error occurred while loading the warband');
          }
        } finally {
          setLoading(false);
        }
      } else {
        // Initialize new warband with default values
        // Requirement 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7: Default name "New Warband", point limit required, ability optional
        setWarband({
          id: '',
          name: 'New Warband',
          ability: null,
          pointLimit: 75,
          totalCost: 0,
          weirdos: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    };

    initializeWarband();
  }, [warbandId]);

  /**
   * Handle warband name change
   * Requirements: 1.1, 1.5, 9.2 - useCallback for callbacks passed to child components
   */
  const handleNameChange = useCallback((name: string) => {
    if (warband) {
      setWarband({ ...warband, name });
      setSaveSuccess(false);
    }
  }, [warband]);

  /**
   * Handle warband ability change and trigger cost recalculation
   * Requirements: 1.4, 1.6, 15.1, 15.2, 9.2 - useCallback for callbacks passed to child components
   */
  const handleAbilityChange = useCallback(async (ability: WarbandAbility | null) => {
    if (!warband) return;

    setWarband({ ...warband, ability });
    setSaveSuccess(false);

    // Recalculate costs for all weirdos with new ability
    if (warband.id && warband.weirdos.length > 0) {
      try {
        const updatedWarband = await apiClient.updateWarband(warband.id, { ability });
        setWarband(updatedWarband);
      } catch (err) {
        console.error('Failed to recalculate costs:', err);
      }
    }
  }, [warband]);

  /**
   * Handle point limit change
   * Requirements: 1.2, 9.2 - useCallback for callbacks passed to child components
   */
  const handlePointLimitChange = useCallback((pointLimit: 75 | 125) => {
    if (warband) {
      setWarband({ ...warband, pointLimit });
      setSaveSuccess(false);
    }
  }, [warband]);

  /**
   * Handle adding a new weirdo (leader or trooper)
   * Requirements: 2.1, 7.1, 9.4, 10.3
   */
  const handleAddWeirdo = async (type: 'leader' | 'trooper') => {
    if (!warband) return;

    // Check if warband already has a leader
    const hasLeader = warband.weirdos.some(w => w.type === 'leader');
    if (type === 'leader' && hasLeader) {
      setError('Warband already has a leader');
      return;
    }

    // Create new weirdo with default values
    const newWeirdo: Weirdo = {
      id: `temp-${Date.now()}`,
      name: type === 'leader' ? 'New Leader' : 'New Trooper',
      type,
      attributes: {
        speed: 1,
        defense: '2d6',
        firepower: 'None',
        prowess: '2d6',
        willpower: '2d6'
      },
      closeCombatWeapons: [],
      rangedWeapons: [],
      equipment: [],
      psychicPowers: [],
      leaderTrait: null,
      notes: '',
      totalCost: 0
    };

    // If warband is saved, add via API
    if (warband.id) {
      try {
        const updatedWarband = await apiClient.addWeirdo(warband.id, newWeirdo);
        setWarband(updatedWarband);
        setSelectedWeirdoId(updatedWarband.weirdos[updatedWarband.weirdos.length - 1].id);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Failed to add weirdo: ${err.message}`);
        }
      }
    } else {
      // For unsaved warband, add locally
      setWarband({
        ...warband,
        weirdos: [...warband.weirdos, newWeirdo]
      });
      setSelectedWeirdoId(newWeirdo.id);
    }

    setSaveSuccess(false);
  };

  /**
   * Handle removing a weirdo
   * Requirements: 15.1, 15.2
   */
  const handleRemoveWeirdo = async (weirdoId: string) => {
    if (!warband) return;

    const weirdoToRemove = warband.weirdos.find(w => w.id === weirdoId);
    if (!weirdoToRemove) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${weirdoToRemove.name}?`
    );

    if (!confirmed) return;

    // If warband is saved, remove via API
    if (warband.id) {
      try {
        const updatedWarband = await apiClient.removeWeirdo(warband.id, weirdoId);
        setWarband(updatedWarband);
        if (selectedWeirdoId === weirdoId) {
          setSelectedWeirdoId(null);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Failed to remove weirdo: ${err.message}`);
        }
      }
    } else {
      // For unsaved warband, remove locally
      setWarband({
        ...warband,
        weirdos: warband.weirdos.filter(w => w.id !== weirdoId)
      });
      if (selectedWeirdoId === weirdoId) {
        setSelectedWeirdoId(null);
      }
    }

    setSaveSuccess(false);
  };

  /**
   * Handle saving the warband
   * Requirements: 11.1, 11.4, 15.1, 15.2
   */
  const handleSaveWarband = async () => {
    if (!warband) return;

    // Validate warband name
    if (!warband.name.trim()) {
      setError('Warband name is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Validate warband
      const validation = await apiClient.validate({ warband });
      setValidationErrors(validation.errors);

      if (!validation.valid) {
        setError('Please fix validation errors before saving');
        setLoading(false);
        return;
      }

      // Save or update warband
      let savedWarband: Warband;
      if (warband.id) {
        savedWarband = await apiClient.updateWarband(warband.id, warband);
      } else {
        savedWarband = await apiClient.createWarband({
          name: warband.name,
          pointLimit: warband.pointLimit,
          ability: warband.ability
        });
      }

      setWarband(savedWarband);
      setSaveSuccess(true);
      setValidationErrors([]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to save warband: ${err.message}`);
      } else {
        setError('An unexpected error occurred while saving');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate total cost of all weirdos (memoized)
   * Requirements: 10.1, 15.2, 15.3, 9.1 - useMemo for expensive calculations
   */
  const calculateTotalCost = useMemo((): number => {
    if (!warband) return 0;
    return warband.weirdos.reduce((sum, weirdo) => sum + weirdo.totalCost, 0);
  }, [warband?.weirdos]);

  /**
   * Validate warband whenever it's loaded or weirdos change
   * Requirements: 15.1, 15.2, 8.1, 8.2, 8.3
   */
  useEffect(() => {
    if (!warband) return;
    
    if (warband.weirdos.length > 0) {
      // Run validation for warbands with weirdos
      apiClient.validate({ warband })
        .then(validation => {
          console.log('Validation result:', validation);
          setValidationErrors(validation.errors);
        })
        .catch(err => {
          console.error('Validation failed:', err);
        });
    } else {
      // Clear validation errors when no weirdos
      setValidationErrors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warband?.id, warband?.weirdos]);

  /**
   * Check if warband is approaching point limit (memoized)
   * Requirements: 15.4, 15.5, 9.1 - useMemo for expensive calculations
   */
  const isApproachingLimit = useMemo((): boolean => {
    if (!warband) return false;
    const threshold = warband.pointLimit * 0.9; // 90% threshold
    return warband.totalCost >= threshold && warband.totalCost <= warband.pointLimit;
  }, [warband?.totalCost, warband?.pointLimit]);

  /**
   * Check if warband exceeds point limit (memoized)
   * Requirements: 10.3, 9.1 - useMemo for expensive calculations
   */
  const exceedsLimit = useMemo((): boolean => {
    if (!warband) return false;
    return warband.totalCost > warband.pointLimit;
  }, [warband?.totalCost, warband?.pointLimit]);

  // Check for 21-25 point rule violation (memoized)
  // Requirements: 9.1 - useMemo for expensive calculations
  // Must be before early returns to follow React hooks rules
  const has25PointViolation = useMemo(() => 
    validationErrors.some(err => err.code === 'MULTIPLE_25_POINT_WEIRDOS'),
    [validationErrors]
  );

  if (loading && !warband) {
    return (
      <div className="warband-editor">
        <div className="loading" role="status" aria-live="polite">
          <div className="spinner spinner-large" aria-hidden="true"></div>
          <span>Loading warband...</span>
        </div>
      </div>
    );
  }

  if (!warband) {
    return (
      <div className="warband-editor">
        <div className="error" role="alert" aria-live="assertive">
          Failed to initialize warband
        </div>
      </div>
    );
  }

  const approaching = isApproachingLimit;
  const exceeds = exceedsLimit;
  
  console.log('Validation state:', {
    validationErrors,
    has25PointViolation,
    weirdoCosts: warband.weirdos.map(w => ({ name: w.name, cost: w.totalCost }))
  });

  return (
    <div className="warband-editor">
      <div className="editor-header">
        <h1>{warband.id ? 'Edit Warband' : 'Create New Warband'}</h1>
        {onBack && (
          <button onClick={onBack} className="back-button">
            ← Back to List
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {has25PointViolation && (
        <div className="error-banner">
          ✗ Only one weirdo may cost 21-25 points!
        </div>
      )}

      {saveSuccess && (
        <div className="success-banner">
          Warband saved successfully!
          <button onClick={() => setSaveSuccess(false)}>×</button>
        </div>
      )}

      <WarbandProperties
        name={warband.name}
        ability={warband.ability}
        pointLimit={warband.pointLimit}
        validationErrors={validationErrors}
        abilityDescriptions={abilityDescriptions}
        onNameChange={handleNameChange}
        onAbilityChange={handleAbilityChange}
        onPointLimitChange={handlePointLimitChange}
      />

      <WarbandCostDisplay
        totalCost={warband.totalCost}
        pointLimit={warband.pointLimit}
        approaching={approaching}
        exceeds={exceeds}
      />

      <WeirdosList
        weirdos={warband.weirdos}
        selectedWeirdoId={selectedWeirdoId}
        validationErrors={validationErrors}
        hasLeader={warband.weirdos.some(w => w.type === 'leader')}
        onAddLeader={() => handleAddWeirdo('leader')}
        onAddTrooper={() => handleAddWeirdo('trooper')}
        onSelectWeirdo={setSelectedWeirdoId}
        onRemoveWeirdo={handleRemoveWeirdo}
      />

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h3>Validation Errors:</h3>
          <ul>
            {validationErrors.map((err, idx) => (
              <li key={idx}>
                <strong>{err.field}:</strong> {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="editor-actions">
        <button
          onClick={handleSaveWarband}
          disabled={loading || !warband.name.trim()}
          className="save-button"
        >
          {loading ? 'Saving...' : warband.id ? 'Save Changes' : 'Create Warband'}
        </button>
        {onBack && (
          <button onClick={onBack} className="cancel-button">
            Cancel
          </button>
        )}
      </div>

      {selectedWeirdoId && (() => {
        const selectedWeirdo = warband.weirdos.find(w => w.id === selectedWeirdoId);
        if (!selectedWeirdo) return null;
        
        return (
          <div className="weirdo-editor-modal">
            <div className="modal-overlay" onClick={() => setSelectedWeirdoId(null)} />
            <div className="modal-content">
              <WeirdoEditor
                weirdo={selectedWeirdo}
                warbandAbility={warband.ability}
                allWeirdos={warband.weirdos}
                onChange={async (updatedWeirdo) => {
                  // Update weirdo in warband and cascade cost changes
                  // Requirements: 15.1, 15.2
                  if (warband.id) {
                    try {
                      const updatedWarband = await apiClient.updateWeirdo(
                        warband.id,
                        updatedWeirdo.id,
                        updatedWeirdo
                      );
                      // Backend returns warband with recalculated total cost
                      setWarband(updatedWarband);
                    } catch (err) {
                      console.error('Failed to update weirdo:', err);
                    }
                  } else {
                    // For unsaved warband, update locally and recalculate total
                    const updatedWeirdos = warband.weirdos.map(w =>
                      w.id === updatedWeirdo.id ? updatedWeirdo : w
                    );
                    const newTotalCost = updatedWeirdos.reduce((sum, w) => sum + w.totalCost, 0);
                    setWarband({
                      ...warband,
                      weirdos: updatedWeirdos,
                      totalCost: newTotalCost
                    });
                  }
                }}
                onClose={() => setSelectedWeirdoId(null)}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
