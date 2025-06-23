import React, { useState, useEffect } from 'react';

// Fluid properties database for common fluids (density in kg/m³, Antoine constants for vapor pressure in Pa, viscosity in cP)
const fluidProperties = {
  Water: {
    density: (temp) => 1000 - 0.0178 * (temp - 4) ** 2,
    antoine: { A: 8.07131, B: 1730.63, C: 233.426 }, // log10(P) = A - B/(T+C), P in mmHg
    viscosity: (temp) => Math.exp(-24.71 + 4209/(temp + 273.15) + 0.04527 * (temp + 273.15) - 3.376e-5 * (temp + 273.15) ** 2),
  },
  LightOil: {
    density: (temp) => 850 - 0.6 * temp,
    antoine: { A: 7.5, B: 1500, C: 200 },
    viscosity: (temp) => 10 ** (2.5 - 0.02 * temp),
  },
  HeavyOil: {
    density: (temp) => 900 - 0.65 * temp,
    antoine: { A: 7.7, B: 1600, C: 210 },
    viscosity: (temp) => 10 ** (3.0 - 0.015 * temp),
  },
  Kerosene: {
    density: (temp) => 820 - 0.7 * temp,
    antoine: { A: 7.4, B: 1450, C: 190 },
    viscosity: (temp) => 2.5 * Math.exp(-0.01 * temp),
  },
  Gasoline: {
    density: (temp) => 740 - 0.8 * temp,
    antoine: { A: 7.3, B: 1400, C: 180 },
    viscosity: (temp) => 0.6 * Math.exp(-0.008 * temp),
  },
};

// Default fluid properties for unknown fluids
const defaultFluidProperties = {
  density: (temp) => 800 - 0.7 * temp, // Generic hydrocarbon approximation
  antoine: { A: 7.5, B: 1500, C: 200 },
  viscosity: (temp) => 1.0 * Math.exp(-0.01 * temp), // Generic viscosity
};

// Calculate vapor pressure using Antoine equation (returns bar)
const getVaporPressure = (fluidType, temperature, userDensity, userViscosity) => {
  const props = fluidProperties[fluidType] || defaultFluidProperties;
  const { A, B, C } = props.antoine;
  const tempK = temperature + 273.15;
  const logPmmHg = A - B / (temperature + C); // Pressure in mmHg
  const pPa = Math.pow(10, logPmmHg) * 133.322; // Convert mmHg to Pa
  return pPa / 100000; // Convert Pa to bar
};

// Calculate NPSHr based on pump type, speed, and flow (API 610 approximation)
const getNPSHr = (pumpType, shaftSpeed, flowRate) => {
  if (!pumpType || !shaftSpeed || !flowRate) return 3.0;
  const nss = pumpType === 'Centrifugal' ? 9000 : 8000; // Suction specific speed (US units)
  const qGpm = flowRate * 264.172 / 3600; // Convert m³/h to gpm
  const nRpm = shaftSpeed;
  const npshrFt = Math.pow((nRpm * Math.sqrt(qGpm) / nss), 4/3); // NPSHr in feet
  return npshrFt * 0.3048; // Convert to meters
};

// Calculate friction loss using Darcy-Weisbach equation (returns ROS returns meters
const getFrictionLoss = (pipeDiameter, flowRate, fluidType, temperature, userDensity, userViscosity) => {
  if (!pipeDiameter || !flowRate) return 0.5;
  const d = pipeDiameter / 1000; // Convert mm to m
  const a = Math.PI * (d / 2) ** 2; // Pipe cross-sectional area (m²)
  const v = (flowRate / 3600) / a; // Velocity (m/s)
  const density = userDensity || (fluidProperties[fluidType] || defaultFluidProperties).density(temperature);
  const viscosity = userViscosity || (fluidProperties[fluidType] || defaultFluidProperties).viscosity(temperature);
  const re = (density * v * d) / (viscosity / 1000); // Reynolds number
  const f = re > 2000 ? 0.025 : 64 / re; // Friction factor (laminar or turbulent)
  const l = 10; // Assume 10m pipe length
  const g = 9.81; // Gravity (m/s²)
  return (f * l * v ** 2) / (2 * d * g); // Head loss in meters
};

// Cavitation mitigation suggestions
const getMitigationSuggestions = (cavitationRisk, sealData) => {
  if (cavitationRisk !== 'High risk of cavitation') return [];
  const suggestions = [
    'Increase suction pipe diameter to reduce friction losses.',
    'Lower pump speed to reduce NPSHr.',
    'Install a booster pump to increase suction pressure.',
    'Optimize suction line design to minimize bends and restrictions.',
  ];
  if (sealData.fluidType.toLowerCase().includes('oil') || sealData.fluidType.toLowerCase().includes('hydrocarbon') || sealData.flashing) {
    suggestions.push('Use dual seals with API Plan 53B for hydrocarbon compatibility.');
  }
  if (sealData.viscosity > 10) {
    suggestions.push('Select seal materials resistant to high viscosity fluids (e.g., Silicon Carbide).');
  }
  if (sealData.hazardous) {
    suggestions.push('Implement API Plan 54 with external pressurized barrier fluid for safety.');
  }
  return suggestions;
};

function Sidebar({ sealData = {}, setSealData, onSubmit, onReset, onUpdatePreferences }) {
  const [npshResults, setNpshResults] = useState(null);
  const [errors, setErrors] = useState({});

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('sealRecommenderData');
    if (savedData) {
      setSealData(JSON.parse(savedData));
    }
  }, [setSealData]);

  // Save data to localStorage whenever sealData changes
  useEffect(() => {
    localStorage.setItem('sealRecommenderData', JSON.stringify(sealData));
    const results = calculateNPSH();
    setNpshResults(results);
  }, [sealData]);

  const validateInputs = () => {
    const newErrors = {};
    if (!sealData.fluidType) newErrors.fluidType = 'Fluid Type is required';
    if (!sealData.temperature || isNaN(sealData.temperature) || sealData.temperature < -50 || sealData.temperature > 300) {
      newErrors.temperature = 'Valid Temperature (-50 to 300°C) is required';
    }
    if (!sealData.suctionPressure || isNaN(sealData.suctionPressure) || sealData.suctionPressure < 0) {
      newErrors.suctionPressure = 'Valid Suction Pressure (≥ 0 bar) is required';
    }
    if (!sealData.pumpType) newErrors.pumpType = 'Pump Type is required';
    if (!sealData.shaftSpeed || isNaN(sealData.shaftSpeed) || sealData.shaftSpeed < 0 || sealData.shaftSpeed > 10000) {
      newErrors.shaftSpeed = 'Valid Shaft Speed (0-10000 RPM) is required';
    }
    if (!sealData.flowRate || isNaN(sealData.flowRate) || sealData.flowRate < 0) {
      newErrors.flowRate = 'Valid Flow Rate (≥ 0 m³/h) is required';
    }
    if (!sealData.pipeDiameter || isNaN(sealData.pipeDiameter) || sealData.pipeDiameter < 10) {
      newErrors.pipeDiameter = 'Valid Pipe Diameter (≥ 10 mm) is required';
    }
    if (sealData.userDensity && (isNaN(sealData.userDensity) || sealData.userDensity < 100)) {
      newErrors.userDensity = 'Valid Density (≥ 100 kg/m³) is required';
    }
    if (sealData.userViscosity && (isNaN(sealData.userViscosity) || sealData.userViscosity < 0)) {
      newErrors.userViscosity = 'Valid Viscosity (≥ 0 cP) is required';
    }
    return newErrors;
  };

  const calculateNPSH = () => {
    const { fluidType, temperature, suctionPressure, pumpType, shaftSpeed, flowRate, pipeDiameter, userDensity, userViscosity } = sealData;
    if (!fluidType || !temperature || !suctionPressure || !pumpType || !shaftSpeed || !flowRate || !pipeDiameter) {
      return null;
    }
    const density = userDensity || (fluidProperties[fluidType] || defaultFluidProperties).density(parseFloat(temperature));
    const vaporPressure = getVaporPressure(fluidType, parseFloat(temperature), userDensity, userViscosity);
    const pressureHead = (parseFloat(suctionPressure) * 100000) / (density * 9.81); // Convert bar to m
    const frictionLoss = getFrictionLoss(parseFloat(pipeDiameter), parseFloat(flowRate), fluidType, parseFloat(temperature), userDensity, userViscosity);
    const NPSHa = pressureHead - (vaporPressure * 100000) / (density * 9.81) - frictionLoss;
    const NPSHr = getNPSHr(pumpType, parseFloat(shaftSpeed), parseFloat(flowRate));
    const cavitationRisk = NPSHa < NPSHr ? 'High risk of cavitation' : 'Low risk of cavitation';
    return { NPSHa: NPSHa.toFixed(2), NPSHr: NPSHr.toFixed(2), cavitationRisk };
  };

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
    setSealData({});
    setNpshResults(null);
    setErrors({});
    localStorage.removeItem('sealRecommenderData');
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
                placeholder="e.g., Water, Oil, Hydrocarbon"
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
              {errors.fluidType && <p className="text-xs text-red-600 mt-1">{errors.fluidType}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Density (kg/m³):</label>
              <input
                type="number"
                name="userDensity"
                value={sealData.userDensity || ''}
                onChange={handleChange}
                placeholder="Enter density or leave blank for default"
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
                step="0.1"
              />
              {errors.userDensity && <p className="text-xs text-red-600 mt-1">{errors.userDensity}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Viscosity (cP):</label>
              <input
                type="number"
                name="userViscosity"
                value={sealData.userViscosity || ''}
                onChange={handleChange}
                placeholder="Enter viscosity or leave blank for default"
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
                step="0.01"
              />
              {errors.userViscosity && <p className="text-xs text-red-600 mt-1">{errors.userViscosity}</p>}
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
                step="0.1"
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
                step="0.01"
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
                step="0.1"
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
                step="0.1"
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
                step="1"
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
                step="0.1"
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
                <option value="Tungsten Carbide vs. Tungsten Carbide">Tungsten Carbide vs. Tungsten Carbide</option>
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
        {npshResults && (
          <div className="mt-4 p-3 bg-white border border-gray-300 rounded-md">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">NPSH Analysis</h2>
            <div className="space-y-3">
              <div className="p-2 bg-gray-100 border border-gray-200 rounded-md">
                <p className="text-xs font-medium text-gray-700">
                  <strong>NPSH Definition:</strong> Net Positive Suction Head, the pressure margin at pump inlet to prevent cavitation.
                </p>
              </div>
              <div className="p-2 bg-gray-100 border border-gray-200 rounded-md">
                <p className="text-xs font-medium text-gray-700">
                  <strong>Cavitation Definition:</strong> Formation and collapse of vapor bubbles due to low pressure, causing pump damage.
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