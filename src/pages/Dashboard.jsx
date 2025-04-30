import { use, useEffect, useState } from 'react';
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  
  },[isOnline]);

  return (
    <div className="flex flex-col">
   {  !isOnline&&  <div className="bg-red-600 text-white p-4 text-center">
       {<p className="text-center font-semibold">{'You are offline'}</p>}
      </div>}
      <div className='flex w-full h-screen'>
      <div className="w-[20%]">
        <Sidebar setSidebarData={setSidebarData} />
      </div>
      <div className="w-[55%]">
        <Workspace sidebarData={sidebarData} />
      </div>
      <div className="w-[25%]">
      <RightBar sidebarData={sidebarData} />
      </div></div>
    </div>
  );
}

export default Dashboard;