import React, { useState } from 'react';

const Sidebar = () => {
  const [operation, setOperation] = useState('Turning');
  const [spindleSpeed, setSpindleSpeed] = useState(2500);
  const [depthOfCut, setDepthOfCut] = useState(2.5);
  const [feedRate, setFeedRate] = useState(0.2);
  const [toolOverhang, setToolOverhang] = useState(40);
  const [material, setMaterial] = useState('Steel');
  const [toolType, setToolType] = useState('Carbide');

  return (
    <div className='bg-slate-500 h-full flex flex-col items-center p-4'>
      <div className='text-2xl font-bold mb-4'>
        Chatter Lab
      </div>
      <div className='w-full'>
        <div className='mb-4'>
          <label>Select Operation: </label>
          <select value={operation} onChange={(e) => setOperation(e.target.value)} className='w-full'>
            <option value="Turning">Turning</option>
            <option value="Milling">Milling</option>
            <option value="Drilling">Drilling</option>
          </select>
        </div>
        <div className='mb-4'>
          <label>Spindle Speed (RPM): </label>
          <input
            type="number"
            value={spindleSpeed}
            onChange={(e) => setSpindleSpeed(e.target.value)}
            className='w-full'
          />
        </div>
        <div className='mb-4'>
          <label>Depth of Cut (mm): </label>
          <input
            type="number"
            value={depthOfCut}
            onChange={(e) => setDepthOfCut(e.target.value)}
            className='w-full'
          />
        </div>
        <div className='mb-4'>
          <label>Feed Rate (mm/rev): </label>
          <input
            type="number"
            value={feedRate}
            onChange={(e) => setFeedRate(e.target.value)}
            className='w-full'
          />
        </div>
        <div className='mb-4'>
          <label>Tool Overhang (mm): </label>
          <input
            type="number"
            value={toolOverhang}
            onChange={(e) => setToolOverhang(e.target.value)}
            className='w-full'
          />
        </div>
        <div className='mb-4'>
          <label>Material: </label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)} className='w-full'>
            <option value="Steel">Steel</option>
            <option value="Aluminum">Aluminum</option>
            <option value="Titanium">Titanium</option>
          </select>
        </div>
        <div className='mb-4'>
          <label>Tool Type: </label>
          <select value={toolType} onChange={(e) => setToolType(e.target.value)} className='w-full'>
            <option value="Carbide">Carbide</option>
            <option value="HSS">HSS</option>
            <option value="Ceramic">Ceramic</option>
          </select>
        </div>
        <button className='w-full bg-blue-500 text-white py-2 rounded'>
          Simulate
        </button>
      </div>
    </div>
  );
};

export default Sidebar;