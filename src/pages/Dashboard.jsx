import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Workspace from '../components/Workspace';
import RightBar from '../components/Rightbar';

function Dashboard() {
  const [sidebarData, setSidebarData] = useState({
    operation: 'Turning',
    spindleSpeed: 2500,
    depthOfCut: 2.5,
    feedRate: 0.2,
    toolOverhang: 40,
    material: 'Steel',
    toolType: 'Carbide',
  });

  return (
    <div className="flex w-full h-screen">
      <div className="w-[20%]">
        <Sidebar setSidebarData={setSidebarData} />
      </div>
      <div className="w-[55%]">
        <Workspace sidebarData={sidebarData} />
      </div>
      <div className="w-[25%]">
        <RightBar />
      </div>
    </div>
  );
}

export default Dashboard;