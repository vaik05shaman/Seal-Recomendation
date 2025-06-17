import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Workspace from '../components/Workspace';
import RightBar from '../components/Rightbar';

const recommendSeal = (input) => {
  const {
    fluidType, fluidState, temperature, pressure, pumpType, shaftDiameter,
    sealCategory, sealType, sealArrangement, flushPlan, hazardous, flashing,
    solids, viscosity, shaftSpeed, sealMaterial,
  } = input;

  let recommendation = {
    category: sealCategory || 'Category 1',
    type: sealType || 'Type A',
    arrangement: sealArrangement || 'Arrangement 1',
    flushPlan: flushPlan || 'Plan 11',
    materials: sealMaterial || 'Carbon vs. Silicon Carbide',
    reliability: 'Moderate',
    performance: 'Moderate',
    leakageRate: 'Low',
    complianceNotes: [],
    reasons: {},
    preferredCategory: sealCategory,
    preferredType: sealType,
    preferredArrangement: sealArrangement,
    preferredFlushPlan: flushPlan,
    preferredMaterial: sealMaterial,
    preferredReliability: 'Moderate',
    preferredPerformance: 'Moderate',
    preferredLeakage: 'Low',
  };

  if (sealCategory === 'Category 3' && sealArrangement === 'Arrangement 3' && ['Plan 53A', 'Plan 53B', 'Plan 53C', 'Plan 54'].includes(flushPlan)) {
    recommendation.preferredReliability = 'High';
    recommendation.preferredPerformance = 'High';
    recommendation.preferredLeakage = 'Zero';
  } else if (sealCategory === 'Category 2' && sealArrangement === 'Arrangement 2' && ['Plan 52', 'Plan 53A'].includes(flushPlan)) {
    recommendation.preferredReliability = 'High';
    recommendation.preferredPerformance = 'Moderate';
    recommendation.preferredLeakage = 'Low';
  } else {
    recommendation.preferredReliability = 'Low';
    recommendation.preferredPerformance = 'Low';
    recommendation.preferredLeakage = 'Moderate';
  }

  if (hazardous || fluidType?.toLowerCase().includes('toxic')) {
    recommendation.category = 'Category 3';
    recommendation.arrangement = 'Arrangement 3';
    recommendation.flushPlan = 'Plan 53C';
    recommendation.materials = 'Silicon Carbide vs. Silicon Carbide';
    recommendation.type = 'Type C';
    recommendation.reliability = 'High';
    recommendation.performance = 'High';
    recommendation.leakageRate = 'Zero';
    recommendation.reasons = {
      category: 'Hazardous/toxic fluids require Category 3 for safety (API 682, 4.1.4).',
      arrangement: 'Arrangement 3 ensures zero emissions for hazardous fluids.',
      flushPlan: 'Plan 53C uses pressurized barrier fluid for zero leakage.',
      materials: 'Silicon Carbide is durable for hazardous applications.',
      type: 'Type C bellows seal for high reliability in hazardous conditions.',
    };
    recommendation.complianceNotes.push('Category 3, Arrangement 3 with Plan 53C for hazardous/toxic fluids.');
  } else if (fluidType?.toLowerCase().includes('hydrocarbon') || flashing) {
    recommendation.category = 'Category 2';
    recommendation.arrangement = 'Arrangement 2';
    recommendation.flushPlan = 'Plan 52';
    recommendation.reliability = 'High';
    recommendation.performance = 'Moderate';
    recommendation.leakageRate = 'Low';
    recommendation.reasons = {
      category: 'Hydrocarbons/flashing fluids need Category 2 for robust sealing (Annex G).',
      arrangement: 'Arrangement 2 uses dual seals for low emissions.',
      flushPlan: 'Plan 52 provides unpressurized buffer fluid for safety.',
      type: recommendation.type === 'Type A' ? 'Type A suitable for hydrocarbons.' : recommendation.type,
    };
    recommendation.complianceNotes.push('Category 2, Arrangement 2 with Plan 52 for hydrocarbons/flashing fluids.');
  } else if (temperature > 260 || pressure > 50) {
    recommendation.category = 'Category 2';
    recommendation.type = 'Type C';
    recommendation.flushPlan = 'Plan 21';
    recommendation.reliability = 'Moderate';
    recommendation.performance = 'Moderate';
    recommendation.leakageRate = 'Low';
    recommendation.reasons = {
      category: 'High temperature/pressure requires Category 2 (4.1.3).',
      type: 'Type C bellows seal handles extreme conditions.',
      flushPlan: 'Plan 21 provides cooled flush for high temperatures.',
    };
    recommendation.complianceNotes.push('Category 2, Type C with Plan 21 for high temperature/pressure.');
  } else if (fluidState === 'Gas') {
    recommendation.type = 'Type B';
    recommendation.flushPlan = 'Plan 76';
    recommendation.reasons = {
      type: 'Type B is optimized for gaseous fluids (4.1.2).',
      flushPlan: 'Plan 76 handles non-condensing vapor recovery for gases.',
    };
    recommendation.complianceNotes.push('Type B with Plan 76 for gaseous fluids.');
  } else if (solids) {
    recommendation.flushPlan = 'Plan 32';
    recommendation.materials = 'Silicon Carbide vs. Silicon Carbide';
    recommendation.reasons = {
      flushPlan: 'Plan 32 uses clean external flush to prevent solids accumulation.',
      materials: 'Silicon Carbide resists abrasion from solids (6.1.6).',
    };
    recommendation.complianceNotes.push('Plan 32 with abrasion-resistant materials for solids.');
  } else {
    if (temperature > 150) {
      recommendation.flushPlan = 'Plan 23';
      recommendation.reasons.flushPlan = 'Plan 23 uses a closed-loop cooling system for high temperatures.';
      recommendation.complianceNotes.push('Plan 23 for high-temperature applications.');
    } else if (viscosity > 1000) {
      recommendation.flushPlan = 'Plan 32';
      recommendation.reasons.flushPlan = 'Plan 32 provides clean flush for high-viscosity fluids.';
      recommendation.complianceNotes.push('Plan 32 for high-viscosity fluids.');
    } else if (shaftSpeed > 3600) {
      recommendation.flushPlan = 'Plan 31';
      recommendation.reasons.flushPlan = 'Plan 31 uses cyclone separator for high-speed applications.';
      recommendation.complianceNotes.push('Plan 31 for high shaft speeds.');
    } else {
      recommendation.flushPlan = 'Plan 11';
      recommendation.reasons.flushPlan = 'Plan 11 is default for standard conditions (Annex F).';
      recommendation.complianceNotes.push('Plan 11 for standard conditions.');
    }
  }

  if (recommendation.arrangement === 'Arrangement 1') {
    if (!['Plan 11', 'Plan 13', 'Plan 21', 'Plan 23', 'Plan 31', 'Plan 32', 'Plan 62'].includes(recommendation.flushPlan)) {
      recommendation.flushPlan = 'Plan 11';
      recommendation.reasons.flushPlan = 'Plan 11 is default for single seals (Arrangement 1).';
      recommendation.complianceNotes.push('Plan 11 for single seal arrangement.');
    }
  } else if (recommendation.arrangement === 'Arrangement 2') {
    if (!['Plan 52', 'Plan 75', 'Plan 76'].includes(recommendation.flushPlan)) {
      recommendation.flushPlan = 'Plan 52';
      recommendation.reasons.flushPlan = 'Plan 52 is standard for Arrangement 2 dual unpressurized seals.';
      recommendation.complianceNotes.push('Plan 52 for dual unpressurized seals.');
    }
  } else if (recommendation.arrangement === 'Arrangement 3') {
    if (!['Plan 53A', 'Plan 53B', 'Plan 53C', 'Plan 54'].includes(recommendation.flushPlan)) {
      recommendation.flushPlan = 'Plan 53C';
      recommendation.reasons.flushPlan = 'Plan 53C is standard for Arrangement 3 dual pressurized seals.';
      recommendation.complianceNotes.push('Plan 53C for dual pressurized seals.');
    }
  }

  if (shaftDiameter < 20 || shaftDiameter > 110) {
    recommendation.reliability = 'Low';
    recommendation.performance = 'Low';
    recommendation.complianceNotes.push('Shaft diameter outside API 682 scope (20-110 mm).');
  }

  if (viscosity > 1000) {
    recommendation.reliability = 'Moderate';
    recommendation.performance = 'Moderate';
    recommendation.complianceNotes.push('High viscosity requires specialized seal design (6.1.5).');
  }

  return recommendation;
};

function Dashboard() {
  const initialSealData = JSON.parse(localStorage.getItem('sealData')) || {
    fluidType: '',
    fluidState: 'Liquid',
    temperature: '',
    pressure: '',
    pumpType: '',
    shaftDiameter: '',
    sealCategory: 'Category 1',
    sealType: 'Type A',
    sealArrangement: 'Arrangement 1',
    flushPlan: 'Plan 11',
    sealMaterial: 'Carbon vs. Silicon Carbide',
    hazardous: false,
    flashing: false,
    solids: false,
    viscosity: '',
    shaftSpeed: '',
  };

  const initialTableEntries = JSON.parse(localStorage.getItem('tableEntries')) || [];

  const [sealData, setSealData] = useState(initialSealData);
  const [tableEntries, setTableEntries] = useState(initialTableEntries);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    localStorage.setItem('sealData', JSON.stringify(sealData));
    localStorage.setItem('tableEntries', JSON.stringify(tableEntries));
  }, [sealData, tableEntries]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = () => {
    if (!sealData.fluidType || !sealData.temperature || !sealData.temperature) {
      alert('Please fill in fluid type, temperature, and pressure.');
      return;
    }

    const recommendation = recommendSeal(sealData);
    const entry = {
      id: tableEntries.length + 1,
      ...sealData,
      ...recommendation,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    };

    setTableEntries([entry]);
  };

  const resetInputs = () => {
    const defaultSealData = {
      fluidType: '',
      fluidState: 'Liquid',
      temperature: '',
      pressure: '',
      pumpType: '',
      shaftDiameter: '',
      sealCategory: 'Category 1',
      sealType: 'Type A',
      sealArrangement: 'Arrangement 1',
      flushPlan: 'Plan 11',
      sealMaterial: 'Carbon vs. Silicon Carbide',
      hazardous: false,
      flashing: false,
      solids: false,
      viscosity: '',
      shaftSpeed: '',
    };
    setSealData(defaultSealData);
    setTableEntries([]);
    localStorage.setItem('sealData', JSON.stringify(defaultSealData));
    localStorage.setItem('tableEntries', JSON.stringify([]));
  };

  const updatePreferences = () => {
    if (tableEntries.length === 0) {
      alert('No recommendation available to update preferences.');
      return;
    }
    const latestEntry = tableEntries[0];
    const updatedSealData = {
      ...sealData,
      sealCategory: latestEntry.category,
      sealType: latestEntry.type,
      sealArrangement: latestEntry.arrangement,
      flushPlan: latestEntry.flushPlan,
      sealMaterial: latestEntry.materials,
    };
    setSealData(updatedSealData);
    localStorage.setItem('sealData', JSON.stringify(updatedSealData));
  };

  return (
    <div className="flex flex-row min-h-screen bg-gray-50">
      {!isOnline && (
        <div className="bg-red-600 text-white p-2 text-center w-full">
          <p className="font-semibold text-sm">You are offline</p>
        </div>
      )}
      <div className="flex flex-row flex-1 w-full">
        <div className="w-[20%] border-r border-gray-200">
          <Sidebar
            sealData={sealData}
            setSealData={setSealData}
            onSubmit={handleSubmit}
            onReset={resetInputs}
            onUpdatePreferences={updatePreferences}
          />
        </div>
        <div className="w-[60%] border-x border-gray-200">
          <Workspace tableEntries={tableEntries} />
        </div>
        <div className="w-[20%] border-l border-gray-200">
          <RightBar tableEntries={tableEntries} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
