import React from 'react';
import SimulationSection from './SimulationSection';
import GraphSection from './GraphSection';




function Workspace({ sidebarData }) {
  // Validate sidebarData
  if (!sidebarData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 p-4">
        <p className="text-red-500">Error: No sidebar data provided.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-10 p-4 ">
      <div className="h-1/2 ">
        <GraphSection sidebarData={sidebarData} />
      </div>
      <div className="h-1/2 ">
      <SimulationSection sidebarData={sidebarData} />
      </div>
    </div>
  );
}

export default Workspace;