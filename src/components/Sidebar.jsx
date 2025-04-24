import { useState } from 'react';

function Sidebar({ setSidebarData }) {
  const [operation, setOperation] = useState('Turning');
  const [spindleSpeed, setSpindleSpeed] = useState(2500);
  const [depthOfCut, setDepthOfCut] = useState(2.5);
  const [feedRate, setFeedRate] = useState(0.2);
  const [toolOverhang, setToolOverhang] = useState(40);
  const [material, setMaterial] = useState('Steel');
  const [toolType, setToolType] = useState('Carbide');

  const handleSimulate = () => {
    setSidebarData({
      operation,
      spindleSpeed: Number(spindleSpeed),
      depthOfCut: Number(depthOfCut),
      feedRate: Number(feedRate),
      toolOverhang: Number(toolOverhang),
      material,
      toolType,
    });
  };

  return (
    <div className=" h-full bg-blue-100 flex flex-col gap-10 items-center p-4">
      <div className="text-2xl font-bold mb-4 text-black">Chatter Lab</div>
      <div className="w-full">
        <div className="mb-4">
          <label className="block my-2 ">Selected Operation: </label>
          <div className='text-lg bg-blue-200 border text-blue-500 p-2 font-bold '>
            Turning
          </div>

        </div>
        <div className="mb-4">
          <label className="block my-2">Spindle Speed (RPM): </label>
          <input
            type="number"
            value={spindleSpeed}
            onChange={(e) => setSpindleSpeed(e.target.value)}
            className="w-full text-lg bg-blue-200 border outline-none text-blue-500 p-2 font-bold"
          />
        </div>
        <div className="mb-4">
          <label className="block my-2">Depth of Cut (mm): </label>
          <input
            type="number"
            value={depthOfCut}
            onChange={(e) => setDepthOfCut(e.target.value)}
            className="w-full text-lg bg-blue-200 border text-blue-500 p-2 font-bold"
          />
        </div>
        <div className="mb-4">
          <label className="block my-2">Feed Rate (mm/rev): </label>
          <input
            type="number"
            value={feedRate}
            onChange={(e) => setFeedRate(e.target.value)}
            className="w-full text-lg bg-blue-200 border text-blue-500 p-2 font-bold"
          />
        </div>
      
        <div className="mb-4">
          <label className="block my-2">Material: </label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full text-lg bg-blue-200 border text-blue-500 p-2 font-bold"
          >
            <option value="Steel">Steel</option>
            <option value="Aluminum">Aluminum</option>
            <option value="Titanium">Titanium</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block my-2">Tool Type: </label>
          <select
            value={toolType}
            onChange={(e) => setToolType(e.target.value)}
            className="w-full text-lg bg-blue-200 border text-blue-500 p-2 font-bold"
          >
            <option value="Carbide">Carbide</option>
            <option value="HSS">HSS</option>
            <option value="Ceramic">Ceramic</option>
          </select>
        </div>
        <button
          onClick={handleSimulate}
          className="border bg-blue-400 border-blue-400 text-white cursor-pointer p-2 rounded-md w-full text-lg font-bold"
        >
          Simulate
        </button>
      </div>
    </div>
  );
}

export default Sidebar;