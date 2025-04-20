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
    <div className="bg-slate-500 h-full flex flex-col items-center p-4">
      <div className="text-2xl font-bold mb-4 text-white">Chatter Lab</div>
      <div className="w-full">
        <div className="mb-4">
          <label className="block text-white">Select Operation: </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="w-full p-2 rounded"
          >
            <option value="Turning">Turning</option>
            <option value="Milling">Milling</option>
            <option value="Drilling">Drilling</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-white">Spindle Speed (RPM): </label>
          <input
            type="number"
            value={spindleSpeed}
            onChange={(e) => setSpindleSpeed(e.target.value)}
            className="w-full p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Depth of Cut (mm): </label>
          <input
            type="number"
            value={depthOfCut}
            onChange={(e) => setDepthOfCut(e.target.value)}
            className="w-full p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Feed Rate (mm/rev): </label>
          <input
            type="number"
            value={feedRate}
            onChange={(e) => setFeedRate(e.target.value)}
            className="w-full p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Tool Overhang (mm): </label>
          <input
            type="number"
            value={toolOverhang}
            onChange={(e) => setToolOverhang(e.target.value)}
            className="w-full p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Material: </label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full p-2 rounded"
          >
            <option value="Steel">Steel</option>
            <option value="Aluminum">Aluminum</option>
            <option value="Titanium">Titanium</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-white">Tool Type: </label>
          <select
            value={toolType}
            onChange={(e) => setToolType(e.target.value)}
            className="w-full p-2 rounded"
          >
            <option value="Carbide">Carbide</option>
            <option value="HSS">HSS</option>
            <option value="Ceramic">Ceramic</option>
          </select>
        </div>
        <button
          onClick={handleSimulate}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Simulate
        </button>
      </div>
    </div>
  );
}

export default Sidebar;