import React from 'react';

const generateAIResponse = (entry) => {
  if (!entry) return 'No recommendation available. Submit parameters.';

  const { fluidType, flushPlan, temperature, pressure, category, type, arrangement, materials, reliability, leakageRate, hazardous, fluidState, solids } = entry;

  let response = `<strong>AI Recommendation for ${fluidType} at ${temperature}°C and ${pressure} bar:</strong>`;
  response += `<p class="mt-2">Optimized seal configuration per API 682:</p>`;
  response += `<ul class="list-disc pl-3 mt-1 space-y-1 text-xs">`;
  response += `<li><span class="font-semibold">Category</span>: ${category} (${category === 'Category 3' ? 'high safety' : category === 'Category 2' ? 'robust' : 'standard'})</li>`;
  response += `<li><span class="font-semibold">Type</span>: ${type} (${type === 'Type A' ? 'general use' : type === 'Type B' ? 'gaseous fluids' : 'high temp'})</li>`;
  response += `<li><span class="font-semibold">Arrangement</span>: ${arrangement} (${arrangement === 'Arrangement 3' ? 'zero emissions' : arrangement === 'Arrangement 2' ? 'low emissions' : 'single'})</li>`;

  const flushPlanDescriptions = {
    'Plan 11': 'discharge to seal chamber',
    'Plan 13': 'seal chamber to suction',
    'Plan 21': 'cooled flush from discharge',
    'Plan 23': 'closed-loop cooling',
    'Plan 31': 'cyclone separator for solids',
    'Plan 32': 'external flush fluid',
    'Plan 51': 'external quench cooling',
    'Plan 52': 'unpressurized buffer fluid',
    'Plan 53A': 'pressurized barrier with reservoir',
    'Plan 53B': 'pressurized barrier with bladder',
    'Plan 53C': 'pressurized barrier with piston',
    'Plan 54': 'external pressurized barrier',
    'Plan 62': 'external quench',
    'Plan 75': 'condensate collection',
    'Plan 76': 'vapor recovery',
  };
  response += `<li><span class="font-semibold">Flush Plan</span>: ${flushPlan} (${flushPlanDescriptions[flushPlan] || 'custom'})</li>`;
  response += `<li><span class="font-semibold">Materials</span>: ${materials} (${materials.includes('Silicon Carbide') ? 'high durability' : 'standard'})</li>`;
  response += `<li><span class="font-semibold">Reliability</span>: ${reliability} | <span class="font-semibold">Leakage</span>: ${leakageRate}</li>`;
  response += `</ul>`;

  response += `<p class="mt-2 font-semibold">Reasoning:</p>`;
  response += `<ul class="list-disc pl-3 mt-1 space-y-1 text-xs">`;
  if (hazardous || fluidType?.toLowerCase().includes('toxic')) {
    response += `<li>${flushPlan} for zero-emission sealing (hazardous).</li>`;
  } else if (fluidType?.toLowerCase().includes('hydrocarbon') || entry.flashing) {
    response += `<li>${flushPlan} for low-emission hydrocarbons.</li>`;
  } else if (temperature > 260) {
    response += `<li>${flushPlan} for high temperatures.</li>`;
  } else if (fluidState === 'Gas') {
    response += `<li>${flushPlan} for gaseous fluids.</li>`;
  } else if (solids) {
    response += `<li>${flushPlan} to prevent solids buildup.</li>`;
  } else {
    response += `<li>${flushPlan} for standard conditions.</li>`;
  }
  response += `<li>Optimized for ${reliability.toLowerCase()} reliability and ${leakageRate.toLowerCase()} leakage.</li>`;
  response += `</ul>`;
  response += `<p class="mt-2 text-xs">API 682 compliant configuration.</p>`;
  return response;
};

function RightBar({ tableEntries }) {
  const latestEntry = tableEntries?.length > 0 ? tableEntries[0] : null;
  const aiResponse = generateAIResponse(latestEntry);

  return (
    <div className="h-screen w-[100%] bg-blue-50 p-3 border-l border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">AI Insights</h3>
      <p className="text-xs text-gray-500 mb-2">AI-generated recommendations</p>
      <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 text-xs h-[calc(100vh-100px)]">
        {latestEntry ? (
          <div className="prose prose-xs max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: aiResponse }} />
        ) : (
          <p className="text-center text-gray-600 text-xs">No insights yet. Submit inputs.</p>
        )}
      </div>
    </div>
  );
}

export default React.memo(RightBar);