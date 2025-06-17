import React, { useState, useEffect } from 'react';

// Mock vapor pressure lookup (in bar) based on fluid type and temperature
const getVaporPressure = (fluidType, temperature) => {
  const vaporPressureTable = {
    Water: { 20: 0.0234, 100: 1.013 }, // Example values in bar
    Hydrocarbon: { 20: 0.5, 100: 2.0 },
  };
  return vaporPressureTable[fluidType]?.[temperature] || 0.1; // Default fallback
};

// Mock NPSHr lookup (in meters) based on pump type, shaft speed, and flow rate
const getNPSHr = (pumpType, shaftSpeed, flowRate) => {
  const baseNPSHr = pumpType === 'Centrifugal' ? (shaftSpeed > 3000 ? 4 : 3) : 3;
  return baseNPSHr + (flowRate > 100 ? 0.5 : 0); // Adjust based on flow rate (simplified)
};

// Mock friction loss calculation (in meters) based on pipe diameter and flow rate
const getFrictionLoss = (pipeDiameter, flowRate) => {
  if (!pipeDiameter || !flowRate) return 0.5; // Default fallback
  return (flowRate / 100) * (10 / pipeDiameter); // Simplified Darcy-Weisbach approximation
};

// Mock cavitation mitigation suggestions based on risk
const getMitigationSuggestions = (cavitationRisk, sealData) => {
  if (cavitationRisk !== 'High risk of cavitation') return [];
  const suggestions = [];
  if (sealData.fluidType === 'Hydrocarbon' || sealData.flashing) {
    suggestions.push('Use dual seals with Plan 53A/B/C for better pressure stability.');
  }
  suggestions.push('Select Silicon Carbide vs. Silicon Carbide for enhanced durability.');
  suggestions.push('Increase suction pressure or reduce pump speed to lower cavitation risk.');
  return suggestions;
};

function Sidebar({ sealData = {}, setSealData, onSubmit, onReset, onUpdatePreferences }) {
  const [npshResults, setNpshResults] = useState(null);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!sealData.fluidType) newErrors.fluidType = 'Fluid Type is required';
    if (!sealData.temperature || isNaN(sealData.temperature)) newErrors.temperature = 'Valid Temperature is required';
    if (!sealData.suctionPressure || isNaN(sealData.suctionPressure)) newErrors.suctionPressure = 'Valid Suction Pressure is required';
    if (!sealData.pumpType) newErrors.pumpType = 'Pump Type is required';
    if (!sealData.shaftSpeed || isNaN(sealData.shaftSpeed)) newErrors.shaftSpeed = 'Valid Shaft Speed is required';
    if (!sealData.flowRate || isNaN(sealData.flowRate)) newErrors.flowRate = 'Valid Flow Rate is required';
    if (!sealData.pipeDiameter || isNaN(sealData.pipeDiameter)) newErrors.pipeDiameter = 'Valid Pipe Diameter is required';
    return newErrors;
  };

  const calculateNPSH = () => {
    const { fluidType, temperature, suctionPressure, pumpType, shaftSpeed, flowRate, pipeDiameter } = sealData;
    if (!fluidType || !temperature || !suctionPressure || !pumpType || !shaftSpeed || !flowRate || !pipeDiameter) {
      return null;
    }
    const vaporPressure = getVaporPressure(fluidType, parseFloat(temperature)); // bar
    const fluidDensity = fluidType === 'Water' ? 1000 : 800; // kg/m³ (simplified)
    const pressureHead = (parseFloat(suctionPressure) * 100000) / (fluidDensity * 9.81); // Convert bar to m
    const frictionLoss = getFrictionLoss(parseFloat(pipeDiameter), parseFloat(flowRate)); // meters
    const NPSHa = pressureHead - (vaporPressure * 100000) / (fluidDensity * 9.81) - frictionLoss;
    const NPSHr = getNPSHr(pumpType, parseFloat(shaftSpeed), parseFloat(flowRate));
    const cavitationRisk = NPSHa < NPSHr ? 'High risk of cavitation' : 'Low risk of cavitation';
    return { NPSHa: NPSHa.toFixed(2), NPSHr: NPSHr.toFixed(2), cavitationRisk };
  };

  useEffect(() => {
    const results = calculateNPSH();
    setNpshResults(results);
  }, [sealData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSealData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    const results = calculateNPSH();
    if (results && onSubmit) {
      onSubmit({ ...sealData, ...results });
    }
  };

  const handleReset = () => {
    setNpshResults(null);
    setErrors({});
    if (onReset) onReset();
  };

  const flushPlans = [
    'Plan 11', 'Plan 13', 'Plan 21', 'Plan 23', 'Plan 31', 'Plan 32',
    'Plan 51', 'Plan 52', 'Plan 53A', 'Plan 53B', 'Plan 53C', 'Plan 54',
    'Plan 62', 'Plan 75', 'Plan 76'
  ];

  return (
    <div className="h-screen w-full bg-blue-50 flex flex-col gap-4 p-3 border-r border-gray-200">
      <h1 className="text-base font-bold text-gray-800">Seal Recommender</h1>
      <form className="w-full space-y-4 h-full pr-1" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Fluid Properties</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fluid Type:</label>
              <input
                type="text"
                name="fluidType"
                value={sealData.fluidType || ''}
                onChange={handleChange}
                placeholder="e.g., Hydrocarbon, Water"
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
              {errors.fluidType && <p className="text-xs text-red-600 mt-1">{errors.fluidType}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fluid State:</label>
              <select
                name="fluidState"
                value={sealData.fluidState || 'Liquid'}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Liquid">Liquid</option>
                <option value="Gas">Gas</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="hazardous"
                checked={sealData.hazardous || false}
                onChange={handleChange}
                className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-xs text-gray-700">Hazardous/Toxic</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="flashing"
                checked={sealData.flashing || false}
                onChange={handleChange}
                className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-xs text-gray-700">Flashing Hydrocarbon</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="solids"
                checked={sealData.solids || false}
                onChange={handleChange}
                className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-xs text-gray-700">Contains Solids</label>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Viscosity (cP):</label>
              <input
                type="number"
                name="viscosity"
                value={sealData.viscosity || ''}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Operating Conditions</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Temperature (°C):</label>
              <input
                type="number"
                name="temperature"
                value={sealData.temperature || ''}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
              {errors.temperature && <p className="text-xs text-red-600 mt-1">{errors.temperature}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Suction Pressure (bar):</label>
              <input
                type="number"
                name="suctionPressure"
                value={sealData.suctionPressure || ''}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
              {errors.suctionPressure && <p className="text-xs text-red-600 mt-1">{errors.suctionPressure}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Flow Rate (m³/h):</label>
              <input
                type="number"
                name="flowRate"
                value={sealData.flowRate || ''}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
              {errors.flowRate && <p className="text-xs text-red-600 mt-1">{errors.flowRate}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Suction Pipe Diameter (mm):</label>
              <input
                type="number"
                name="pipeDiameter"
                value={sealData.pipeDiameter || ''}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
              {errors.pipeDiameter && <p className="text-xs text-red-600 mt-1">{errors.pipeDiameter}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Shaft Speed (RPM):</label>
              <input
                type="number"
                name="shaftSpeed"
                value={sealData.shaftSpeed || ''}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
              {errors.shaftSpeed && <p className="text-xs text-red-600 mt-1">{errors.shaftSpeed}</p>}
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Pump Details</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pump Type:</label>
              <select
                name="pumpType"
                value={sealData.pumpType || ''}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="Centrifugal">Centrifugal</option>
              </select>
              {errors.pumpType && <p className="text-xs text-red-600 mt-1">{errors.pumpType}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Shaft Diameter (mm):</label>
              <input
                type="number"
                name="shaftDiameter"
                value={sealData.shaftDiameter || ''}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Seal Preferences</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Seal Category:</label>
              <select
                name="sealCategory"
                value={sealData.sealCategory || 'Category 1'}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Category 1">Category 1</option>
                <option value="Category 2">Category 2</option>
                <option value="Category 3">Category 3</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Seal Type:</label>
              <select
                name="sealType"
                value={sealData.sealType || 'Type A'}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Type A">Type A</option>
                <option value="Type B">Type B</option>
                <option value="Type C">Type C</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Seal Arrangement:</label>
              <select
                name="sealArrangement"
                value={sealData.sealArrangement || 'Arrangement 1'}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Arrangement 1">Arrangement 1</option>
                <option value="Arrangement 2">Arrangement 2</option>
                <option value="Arrangement 3">Arrangement 3</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Flush Plan:</label>
              <select
                name="flushPlan"
                value={sealData.flushPlan || 'Plan 11'}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              >
                {flushPlans.map((plan) => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Seal Material:</label>
              <select
                name="sealMaterial"
                value={sealData.sealMaterial || 'Carbon vs. Silicon Carbide'}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Carbon vs. Silicon Carbide">Carbon vs. Silicon Carbide</option>
                <option value="Silicon Carbide vs. Silicon Carbide">Silicon Carbide vs. Silicon Carbide</option>
              </select>
            </div>
          </div>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="p-2 bg-red-100 border border-red-300 rounded-md">
            <p className="text-xs text-red-600">Please correct the following errors:</p>
            <ul className="list-disc list-inside text-xs text-red-600">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white p-1.5 rounded-md text-xs font-semibold hover:bg-blue-700 focus:ring-1 focus:ring-blue-500"
          >
            Recommend Seal & Check NPSH
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-600 text-white p-1.5 rounded-md text-xs font-semibold hover:bg-gray-700 focus:ring-1 focus:ring-gray-500"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onUpdatePreferences}
            className="flex-1 bg-green-600 text-white p-1.5 rounded-md text-xs font-semibold hover:bg-green-700 focus:ring-1 focus:ring-green-500"
          >
            Update Preferences
          </button>
        </div>
        {/* Real-Time NPSH Preview */}
        {npshResults && (
          <div className="mt-4 p-3 bg-white border border-gray-300 rounded-md">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">NPSH Preview</h2>
            <div className="space-y-3">
              <div className="p-2 bg-gray-100 border border-gray-200 rounded-md">
                <p className="text-xs font-medium text-gray-700">
                  <strong>NPSH Definition:</strong> Pressure margin at pump inlet to prevent cavitation.
                </p>
              </div>
              <div className="p-2 bg-gray-100 border border-gray-200 rounded-md">
                <p className="text-xs font-medium text-gray-700">
                  <strong>Cavitation Definition:</strong> Formation and collapse of vapor bubbles due to low pressure.
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-700">
                  <strong>NPSH Available (NPSHa):</strong> {npshResults.NPSHa} m
                </p>
                <p className="text-xs text-gray-700">
                  <strong>NPSH Required (NPSHr):</strong> {npshResults.NPSHr} m
                </p>
                <p className="text-xs text-gray-700">
                  <strong>Cavitation Risk:</strong>{' '}
                  <span
                    className={
                      npshResults.cavitationRisk === 'High risk of cavitation'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }
                  >
                    {npshResults.cavitationRisk}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Cavitation Mitigation Suggestions */}
        {npshResults?.cavitationRisk === 'High risk of cavitation' && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Cavitation Mitigation Suggestions</h2>
            <ul className="list-disc list-inside text-xs text-gray-700">
              {getMitigationSuggestions(npshResults.cavitationRisk, sealData).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}

export default Sidebar;