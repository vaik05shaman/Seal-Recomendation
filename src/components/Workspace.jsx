import React from 'react';
import GraphSection from './GraphSection';
import SimulationSection from './SimulationSection';

function Workspace({ tableEntries }) {
  if (!tableEntries || !Array.isArray(tableEntries) || tableEntries.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 p-4 border-x border-gray-200">
        <p className="text-gray-600 text-sm font-medium">No seal data submitted. Enter parameters in the sidebar.</p>
      </div>
    );
  }

  const entry = tableEntries[0];

  const comparisonData = [
    { parameter: 'Category', preferred: entry.preferredCategory, recommended: entry.category, reason: entry.reasons.category || 'No override needed.' },
    { parameter: 'Type', preferred: entry.preferredType, recommended: entry.type, reason: entry.reasons.type || 'No override needed.' },
    { parameter: 'Arrangement', preferred: entry.preferredArrangement, recommended: entry.arrangement, reason: entry.reasons.arrangement || 'No override needed.' },
    { parameter: 'Flush Plan', preferred: entry.preferredFlushPlan, recommended: entry.flushPlan, reason: entry.reasons.flushPlan || 'No override needed.' },
    { parameter: 'Material', preferred: entry.preferredMaterial, recommended: entry.materials, reason: entry.reasons.materials || 'No override needed.' },
  ];

  return (
    <div className="h-screen bg-gray-100 p-4 border-x border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-4">API 682 Seal Recommendations</h2>
      <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-5">
        <table className="w-full table-auto text-xs text-gray-700">
          <thead className="bg-blue-50 text-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">ID</th>
              <th className="px-3 py-2 text-left font-semibold">Fluid Type</th>
              <th className="px-3 py-2 text-left font-semibold">Temp (°C)</th>
              <th className="px-3 py-2 text-left font-semibold">Press (bar)</th>
              <th className="px-3 py-2 text-left font-semibold">Category</th>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Arr.</th>
              <th className="px-3 py-2 text-left font-semibold">Flush Plan</th>
              <th className="px-3 py-2 text-left font-semibold">Materials</th>
              <th className="px-3 py-2 text-left font-semibold">Rel.</th>
              <th className="px-3 py-2 text-left font-semibold">Leakage</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t hover:bg-gray-50">
              <td className="px-3 py-2">{entry.id}</td>
              <td className="px-3 py-2">{entry.fluidType}</td>
              <td className="px-3 py-2">{entry.temperature}</td>
              <td className="px-3 py-2">{entry.pressure}</td>
              <td className="px-3 py-2">{entry.category}</td>
              <td className="px-3 py-2">{entry.type}</td>
              <td className="px-3 py-2">{entry.arrangement}</td>
              <td className="px-3 py-2">{entry.flushPlan}</td>
              <td className="px-3 py-2">{entry.materials}</td>
              <td className="px-3 py-2">{entry.reliability}</td>
              <td className="px-3 py-2">{entry.leakageRate}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-sm font-semibold text-gray-800 mb-2">Preference vs. Recommendation</h3>
      <div className="bg-white border border-gray-200 rounded-md shadow-sm mb-5">
        <table className="w-full table-auto text-xs text-gray-700">
          <thead className="bg-blue-50 text-gray-800">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Parameter</th>
              <th className="px-3 py-2 text-left font-semibold">Preferred</th>
              <th className="px-3 py-2 text-left font-semibold">Recommended</th>
              <th className="px-3 py-2 text-left font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">{row.parameter}</td>
                <td className="px-3 py-2">{row.preferred}</td>
                <td className="px-3 py-2">{row.recommended}</td>
                <td className="px-3 py-2 text-gray-600">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-sm font-semibold text-gray-800 mb-2">Seal Metrics Comparison</h3>
      <GraphSection tableEntries={tableEntries} />

      <h3 className="text-sm font-semibold text-gray-800 mb-2 mt-4">Seal Simulation</h3>
      <SimulationSection tableEntries={tableEntries} />
    </div>
  );
}

export default React.memo(Workspace);