import React from 'react';

function Sidebar({ sealData = {}, setSealData, onSubmit, onReset, onUpdatePreferences }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSealData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  const handleReset = () => {
    if (onReset) onReset();
  };

  const flushPlans = [
    'Plan 11', 'Plan 13', 'Plan 21', 'Plan 23', 'Plan 31', 'Plan 32',
    'Plan 51', 'Plan 52', 'Plan 53A', 'Plan 53B', 'Plan 53C', 'Plan 54',
    'Plan 62', 'Plan 75', 'Plan 76'
  ];

  return (
    <div className="h-screen w-[100%] bg-blue-50 flex flex-col gap-4 p-3 border-r border-gray-200">
      <h1 className="text-base font-bold text-gray-800">Seal Recommender</h1>
      <form className="w-full space-y-4 h-[100%] pr-1" onSubmit={handleSubmit}>
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
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pressure (bar):</label>
              <input
                type="number"
                name="pressure"
                value={sealData.pressure || ''}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded-md bg-white text-xs text-gray-800 focus:ring-1 focus:ring-blue-500"
              />
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
        <div className="flex gap-2 flex-wrap">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white p-1.5 rounded-md text-xs font-semibold hover:bg-blue-700 focus:ring-1 focus:ring-blue-500"
          >
            Recommend Seal
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
      </form>
    </div>
  );
}

export default Sidebar;