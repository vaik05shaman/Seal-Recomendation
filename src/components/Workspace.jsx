import React, { useEffect } from 'react';
import GraphSection from './GraphSection.jsx';
import SimulationSection from './SimulationSection.jsx';

// API 682 4th Edition compliant recommendation system
const getSealRecommendations = (entry) => {
  const { 
    fluidType, 
    hazardous, 
    flashing,
    temperature, 
    suctionPressure, 
    viscosity,
    solids,
    fluidState,
    shaftSpeed,
    flowRate,
    pipeDiameter,
    npshAvailable,
    npshRequired
  } = entry;

  // Convert inputs to numbers with strict validation
  const temp = Number(temperature) || 20;
  const pressure = Number(suctionPressure) || 1;
  const visc = Number(viscosity) || 1;
  const speed = Number(shaftSpeed) || 1800;
  const flow = Number(flowRate) || 50;
  const npshA = Number(npshAvailable) || 5;
  const npshR = Number(npshRequired) || 3;
  const pipeDia = Number(pipeDiameter) || 100;

  // Validate input ranges
  const validTemp = temp >= -50 && temp <= 400 ? temp : 20;
  const validPressure = pressure >= 0 && pressure <= 100 ? pressure : 1;
  const validVisc = visc >= 0.1 && visc <= 5000 ? visc : 1;
  const validSpeed = speed >= 500 && speed <= 5000 ? speed : 1800;

  // Debug input parsing
  console.log('getSealRecommendations Inputs:', {
    fluidType,
    temp: validTemp,
    pressure: validPressure,
    visc: validVisc,
    speed: validSpeed,
    flow,
    npshA,
    npshR,
    pipeDia,
    hazardous,
    flashing,
    solids,
    fluidState
  });

  // API 682 Fluid Classification (Section 4.1.2)
  const isHazardous = hazardous || 
                     (fluidType && fluidType.toLowerCase().includes('acid')) ||
                     (fluidType && fluidType.toLowerCase().includes('caustic')) ||
                     (fluidType && fluidType.toLowerCase().includes('toxic')) ||
                     (fluidType && fluidType.toLowerCase().includes('hazardous')) ||
                     (fluidType && fluidType.toLowerCase().includes('carcinogen')) ||
                     (fluidType && fluidType.toLowerCase().includes('radioactive'));

  const isFlashing = flashing || 
                    (fluidType && fluidType.toLowerCase().includes('hydrocarbon') && validTemp > 150) ||
                    (fluidState === 'Mixed') ||
                    (validTemp > 100 && validPressure < 1.5);

  const isAbrasive = solids || 
                    (fluidType && fluidType.toLowerCase().includes('slurry')) || 
                    (fluidType && fluidType.toLowerCase().includes('particulate')) || 
                    (fluidType && fluidType.toLowerCase().includes('ash')) || 
                    (fluidType && fluidType.toLowerCase().includes('catalyst'));

  const isPolymerizing = fluidType && (
    fluidType.toLowerCase().includes('styrene') ||
    fluidType.toLowerCase().includes('butadiene') ||
    fluidType.toLowerCase().includes('vinyl') ||
    fluidType.toLowerCase().includes('acrylic')
  );

  // API 682 Service Conditions Classification
  const isHighTemp = validTemp > 200;
  const isVeryHighTemp = validTemp > 260;
  const isHighPressure = validPressure > 20;
  const isVeryHighPressure = validPressure > 60; // Tightened from 50
  const isHighViscosity = validVisc > 500;
  const isExtremeViscosity = validVisc > 2000;
  const isHighSpeed = validSpeed > 2500; // Lowered from 3000
  const isCavitationRisk = npshA < npshR * 1.3;
  const isLowNPSHMargin = npshA < npshR * 1.5; // New check
  const isHighFlow = flow > 200;
  const isSmallPipe = pipeDia < 80; // Raised from 75

  // Debug service conditions
  console.log('Service Conditions:', {
    isHazardous,
    isFlashing,
    isAbrasive,
    isPolymerizing,
    isHighTemp,
    isVeryHighTemp,
    isHighPressure,
    isVeryHighPressure,
    isHighViscosity,
    isExtremeViscosity,
    isHighSpeed,
    isCavitationRisk,
    isLowNPSHMargin,
    isHighFlow,
    isSmallPipe
  });

  // 1. CATEGORY SELECTION (API 682 Section 4.1.4)
  let recommendedCategory = 'Category 1';
  let categoryReason = 'Standard service conditions (API 682 4.1.4)';
  let categoryStandard = 'Section 4.1.4';

  if (isHazardous || isFlashing || isVeryHighTemp || isVeryHighPressure) {
    recommendedCategory = 'Category 3';
    categoryReason = 'Hazardous/Flashing/Extreme conditions require Category 3';
    categoryStandard = 'Section 4.1.4, Table 1';
  } else if (validTemp > 150 || validPressure > 20 || isAbrasive || isPolymerizing) {
    recommendedCategory = 'Category 2';
    categoryReason = 'Moderate conditions or special fluids require Category 2';
    categoryStandard = 'Section 4.1.4, Table 1';
  }

  // 2. TYPE SELECTION (API 682 Section 4.2)
  let recommendedType = 'Type A';
  let typeReason = 'Standard pusher seal for general service';
  let typeStandard = 'Section 4.2.1';

  if (isVeryHighTemp || isExtremeViscosity) {
    recommendedType = 'Type C';
    typeReason = 'Bellows seal required for very high temp (>260°C) or extreme viscosity (>2000 cP)';
    typeStandard = 'Section 4.2.3, Table 3';
  } else if (isHighTemp || isHighViscosity || isPolymerizing) {
    recommendedType = 'Type B';
    typeReason = 'Balanced metal bellows seal for high temp/viscosity or polymerizing fluids';
    typeStandard = 'Section 4.2.2, Table 2';
  } else if (isHazardous || isFlashing) {
    recommendedType = 'Type B';
    typeReason = 'Balanced seal required for hazardous or flashing fluids';
    typeStandard = 'Section 4.2.2, Table 2';
  }

  // 3. ARRANGEMENT SELECTION (API 682 Annex D)
  let recommendedArrangement = 'Arrangement 1';
  let arrangementReason = 'Single seal sufficient for non-hazardous services';
  let arrangementStandard = 'Annex D.1';

  if (isHazardous || isFlashing || isVeryHighPressure) {
    recommendedArrangement = 'Arrangement 3';
    arrangementReason = 'Dual pressurized seals required for hazardous/flashing fluids or very high pressure';
    arrangementStandard = 'Annex D.3, Figure D.3';
  } else if (validTemp > 150 || validPressure > 20 || isAbrasive || isPolymerizing) {
    recommendedArrangement = 'Arrangement 2';
    arrangementReason = 'Tandem seals recommended for moderate conditions, abrasives, or polymerizing fluids';
    arrangementStandard = 'Annex D.2, Figure D.2';
  }

  // 4. FLUSH PLAN SELECTION (API 682 Annex G)
  let recommendedFlushPlan = 'Plan 11';
  let flushPlanReason = 'Standard flush for clean fluids at moderate conditions';
  let flushPlanStandard = 'Annex G.1.1, Figure G.1';

  if (isHazardous || isFlashing || isVeryHighPressure) {
    recommendedFlushPlan = 'Plan 53C';
    flushPlanReason = 'Pressurized barrier system required for hazardous/flashing fluids or very high pressure';
    flushPlanStandard = 'Annex G.5.3, Figure G.12';
  } else if (isAbrasive) {
    if (isHighPressure) {
      recommendedFlushPlan = 'Plan 54';
      flushPlanReason = 'Pressurized external flush for abrasive service under pressure';
      flushPlanStandard = 'Annex G.6, Figure G.14';
    } else {
      recommendedFlushPlan = 'Plan 32';
      flushPlanReason = 'External flush required for abrasive service';
      flushPlanStandard = 'Annex G.3.2, Figure G.4';
    }
  } else if (isHighTemp) {
    recommendedFlushPlan = 'Plan 23';
    flushPlanReason = 'Cooling circulation required for high temperature service (>200°C)';
    flushPlanStandard = 'Annex G.2.3, Figure G.3';
  } else if (isPolymerizing) {
    recommendedFlushPlan = 'Plan 52';
    flushPlanReason = 'Reservoir system for polymerizing fluids to prevent seal face adhesion';
    flushPlanStandard = 'Annex G.5.2, Figure G.11';
  } else if (isHighViscosity) {
    recommendedFlushPlan = 'Plan 21';
    flushPlanReason = 'Cooled flush recommended for high viscosity fluids';
    flushPlanStandard = 'Annex G.1.2, Figure G.2';
  }

  // 5. SEAL MATERIAL SELECTION (API 682 Section 6)
  let recommendedSealMaterial = 'Carbon vs. Silicon Carbide';
  let sealMaterialReason = 'Standard material for general service';
  let sealMaterialStandard = 'Section 6.2.1, Table 5';

  if (isHazardous || isFlashing || isVeryHighTemp) {
    recommendedSealMaterial = 'Silicon Carbide vs. Silicon Carbide';
    sealMaterialReason = 'SiC/SiC required for hazardous, flashing, or very high temp service';
    sealMaterialStandard = 'Section 6.2.2, Table 5';
  } else if (isAbrasive) {
    recommendedSealMaterial = 'Tungsten Carbide vs. Silicon Carbide';
    sealMaterialReason = 'Hardened faces required for abrasive service';
    sealMaterialStandard = 'Section 6.2.3, Table 5';
  } else if (fluidType && (fluidType.toLowerCase().includes('acid') || 
                          fluidType.toLowerCase().includes('caustic'))) {
    recommendedSealMaterial = 'Reactive Metal Oxides (RMO) vs. Silicon Carbide';
    sealMaterialReason = 'Corrosion-resistant materials for acidic/caustic service';
    sealMaterialStandard = 'Section 6.3.2, Table 6';
  } else if (isPolymerizing) {
    recommendedSealMaterial = 'Carbon Graphite vs. Silicon Carbide';
    sealMaterialReason = 'Special carbon grades for polymerizing fluids to prevent sticking';
    sealMaterialStandard = 'Section 6.3.3';
  }

  // 6. RELIABILITY & LEAKAGE (API 682 Section 9)
  let reliability = 'Standard';
  let leakageRate = '5-10 ppm';
  let reliabilityStandard = 'Section 9.1';

  if (recommendedArrangement === 'Arrangement 3') {
    reliability = 'High';
    leakageRate = '0 ppm';
    reliabilityStandard = 'Section 9.3.3';
  } else if (recommendedArrangement === 'Arrangement 2') {
    reliability = 'High';
    leakageRate = '1-5 ppm';
    reliabilityStandard = 'Section 9.3.2';
  } else if (isHazardous || isFlashing) {
    reliability = 'Enhanced';
    leakageRate = '2-8 ppm';
    reliabilityStandard = 'Section 9.3.1';
  } else if (validVisc > 100 || validSpeed > 2000) {
    reliability = 'Moderate';
    leakageRate = '10-15 ppm';
    reliabilityStandard = 'Section 9.1';
  }

  // Debug reliability and leakage
  console.log('Reliability & Leakage:', {
    recommendedArrangement,
    reliability,
    leakageRate,
    isHazardous,
    isFlashing,
    validVisc,
    validSpeed
  });

  // 7. ADDITIONAL RECOMMENDATIONS
  const additionalNotes = [];
  
  if (isCavitationRisk) {
    additionalNotes.push({
      note: '⚠️ **Cavitation Risk**: NPSHa < 1.3 × NPSHr (API 610 requirement). Consider increasing suction pressure or reducing pump speed.',
      standard: 'API 610 11th Edition, Section 8.1.4'
    });
  }
  
  if (isHighSpeed) {
    additionalNotes.push({
      note: '⚡ **High Speed**: Seal face balance ratio should be ≥0.75 for speeds >2500 RPM.',
      standard: 'API 682 Section 4.2.4.3'
    });
  }

  if (isAbrasive) {
    additionalNotes.push({
      note: '🔄 **Abrasive Service**: Implement wear sleeve protection and monthly seal face inspection.',
      standard: 'API 682 Section 6.2.3'
    });
  }

  if (isPolymerizing) {
    additionalNotes.push({
      note: '🧪 **Polymerizing Fluid**: Use double-action agitator in seal pot to prevent fluid solidification.',
      standard: 'API 682 Annex G.5.2'
    });
  }

  if (isSmallPipe && isHighFlow) {
    additionalNotes.push({
      note: '🌪️ **High Velocity Flow**: Pipe velocity exceeds 5 m/s. Consider flow straightener to prevent turbulent flow at seal chamber.',
      standard: 'API 682 Annex G.1.1 Note'
    });
  }

  if (isLowNPSHMargin) {
    additionalNotes.push({
      note: '⚠️ **Low NPSH Margin**: NPSHa < 1.5 × NPSHr. Monitor pump performance to avoid cavitation.',
      standard: 'API 610 11th Edition, Section 8.1.4'
    });
  }

  // Debug critical flags
  console.log('Critical Flags:', additionalNotes);

  return {
    category: recommendedCategory,
    type: recommendedType,
    arrangement: recommendedArrangement,
    flushPlan: recommendedFlushPlan,
    sealMaterial: recommendedSealMaterial,
    reliability,
    leakageRate,
    reasons: {
      category: { reason: categoryReason, standard: categoryStandard },
      type: { reason: typeReason, standard: typeStandard },
      arrangement: { reason: arrangementReason, standard: arrangementStandard },
      flushPlan: { reason: flushPlanReason, standard: flushPlanStandard },
      sealMaterial: { reason: sealMaterialReason, standard: sealMaterialStandard },
      reliability: { reason: `Expected leakage: ${leakageRate}`, standard: reliabilityStandard },
      additionalNotes
    },
    preferredCategory: entry.preferredCategory || 'Not specified',
    preferredType: entry.preferredType || 'Not specified',
    preferredArrangement: entry.preferredArrangement || 'Not specified',
    preferredFlushPlan: entry.preferredFlushPlan || 'Not specified',
    preferredMaterial: entry.preferredMaterial || 'Not specified'
  };
};

function Workspace({ tableEntries }) {
  // Debug tableEntries updates
  useEffect(() => {
    console.log('Workspace: tableEntries updated:', tableEntries);
  }, [tableEntries]);

  if (!tableEntries || !Array.isArray(tableEntries) || tableEntries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 border-x border-gray-200">
        <p className="text-gray-600 text-sm font-medium">No seal data submitted. Enter parameters in the sidebar.</p>
      </div>
    );
  }

  const entry = tableEntries[tableEntries.length - 1];
  const recommendations = getSealRecommendations(entry);

  // Wrapper for compatibility with GraphSection and SimulationSection
  const enhancedEntry = {
    ...entry,
    ...recommendations,
    id: entry.id || 'N/A',
    fluidType: entry.fluidType || 'N/A',
    temperature: entry.temperature || 'N/A',
    suctionPressure: entry.suctionPressure || 'N/A',
    performance: recommendations.reliability,
    preferredReliability: recommendations.reliability,
    preferredPerformance: recommendations.reliability,
    preferredLeakage: recommendations.leakageRate,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  };

  const comparisonData = [
    { 
      parameter: 'Category', 
      preferred: recommendations.preferredCategory, 
      recommended: recommendations.category, 
      reason: recommendations.reasons.category.reason,
      standard: recommendations.reasons.category.standard,
      href: 'https://www.api.org/standards/682#section-4.1.4'
    },
    { 
      parameter: 'Type', 
      preferred: recommendations.preferredType, 
      recommended: recommendations.type, 
      reason: recommendations.reasons.type.reason,
      standard: recommendations.reasons.type.standard,
      href: 'https://www.api.org/standards/682#section-4.2'
    },
    { 
      parameter: 'Arrangement', 
      preferred: recommendations.preferredArrangement, 
      recommended: recommendations.arrangement, 
      reason: recommendations.reasons.arrangement.reason,
      standard: recommendations.reasons.arrangement.standard,
      href: 'https://www.api.org/standards/682#annex-d'
    },
    { 
      parameter: 'Flush Plan', 
      preferred: recommendations.preferredFlushPlan, 
      recommended: recommendations.flushPlan, 
      reason: recommendations.reasons.flushPlan.reason,
      standard: recommendations.reasons.flushPlan.standard,
      href: 'https://www.api.org/standards/682#annex-g'
    },
    { 
      parameter: 'Seal Material', 
      preferred: recommendations.preferredMaterial, 
      recommended: recommendations.sealMaterial, 
      reason: recommendations.reasons.sealMaterial.reason,
      standard: recommendations.reasons.sealMaterial.standard,
      href: 'https://www.api.org/standards/682#section-6'
    }
  ];

  // Abbreviations for clarity
  const definitions = "Abbreviations: ID (Identifier), Temp (Temperature), Press (Pressure), Arr. (Arrangement), Rel. (Reliability), NPSHa (Net Positive Suction Head Available), NPSHr (Net Positive Suction Head Required).";

  return (
    <div className="min-h-screen bg-gray-100 p-6 border-x border-gray-200 overflow-auto font-sans">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">API 682 Seal Recommendation System</h1>
       
        <p className="text-xs text-gray-500 mb-4">{definitions}</p>
        <p className="text-xs text-gray-600 mb-4">Last updated: {enhancedEntry.timestamp}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-sm text-blue-700 mb-2">Input Summary</h3>
            <p className="text-xs"><span className="font-medium">Fluid:</span> {enhancedEntry.fluidType}</p>
            <p className="text-xs"><span className="font-medium">Temp:</span> {enhancedEntry.temperature}°C</p>
            <p className="text-xs"><span className="font-medium">Pressure:</span> {enhancedEntry.suctionPressure} bar</p>
            <p className="text-xs"><span className="font-medium">Speed:</span> {enhancedEntry.shaftSpeed || 'N/A'} RPM</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-bold text-sm text-yellow-700 mb-2">Critical Flags</h3>
            {recommendations.reasons.additionalNotes.length > 0 ? (
              <ul className="list-disc pl-4 text-xs">
                {recommendations.reasons.additionalNotes.map((note, i) => (
                  <li key={i}>{note.note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs">No critical issues detected</p>
            )}
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-sm text-blue-700 mb-2">Seal Reliability</h3>
            <p className="text-sm font-bold">{recommendations.reliability} Reliability</p>
            <p className="text-xs">Expected Leakage: {recommendations.leakageRate}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Seal Configuration Recommendation</h2>
        <p className="text-xs text-gray-500 mb-4">{definitions}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Category</div>
            <div className="text-sm font-bold">{recommendations.category}</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Type</div>
            <div className="text-sm font-bold">{recommendations.type}</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Arrangement</div>
            <div className="text-sm font-bold">{recommendations.arrangement}</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Flush Plan</div>
            <div className="text-sm font-bold">{recommendations.flushPlan}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-500">Seal Material</div>
            <div className="text-sm font-bold">{recommendations.sealMaterial}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">API 682 Compliance Analysis</h2>
        <p className="text-xs text-gray-500 mb-4">{definitions}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-blue-50">
              <tr>
                {['Parameter', 'Preferred', 'Recommended', 'Reason', 'API 682 Reference'].map((header) => (
                  <th key={header} className="px-4 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{row.parameter}</td>
                  <td className="px-4 py-3">{row.preferred}</td>
                  <td className="px-4 py-3 font-semibold">{row.recommended}</td>
                  <td className="px-4 py-3">{row.reason}</td>
                  <td className="px-4 py-3">
                    <a href={row.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                      {row.standard}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {recommendations.reasons.additionalNotes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Critical Recommendations</h2>
          <p className="text-xs text-gray-500 mb-4">{definitions}</p>
          <div className="space-y-3">
            {recommendations.reasons.additionalNotes.map((note, index) => (
              <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                <div className="mr-3 mt-1 text-yellow-500">⚠️</div>
                <div>
                  <p className="text-sm">{note.note}</p>
                  <p className="text-xs text-gray-600">Reference: {note.standard}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Seal Metrics Comparison</h2>
        <p className="text-xs text-gray-500 mb-4">{definitions}</p>
        <GraphSection tableEntries={tableEntries} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Seal Simulation</h2>
        <p className="text-xs text-gray-500 mb-4">{definitions}</p>
        <SimulationSection tableEntries={tableEntries} />
      </div>
    </div>
  );
}

export default Workspace;