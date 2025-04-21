import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import FFT from 'fft.js'; // Importing FFT.js for FFT calculations

function GraphSection({ sidebarData }) {
  const { operation, spindleSpeed, depthOfCut, feedRate, toolOverhang, material, toolType } = sidebarData;
  const [activeGraph, setActiveGraph] = useState('vibration');
  function generateVibrationData(spindleSpeed, depthOfCut) {
    let timeArray = [];
    let vibrationArray = [];
    let totalTime = 2; // seconds
    let dt = 0.01; // time step
    
    for (let t = 0; t <= totalTime; t += dt) {
      timeArray.push(t);
      let amplitude = Math.sin(2 * Math.PI * spindleSpeed / 60 * t) * (1 + depthOfCut / 2);
      vibrationArray.push(amplitude + 0.1 * Math.random()); // slight random noise
    }
    return { timeArray, vibrationArray };
  }

  function VibrationTimeGraph({ timeArray, vibrationArray }) {
    return (
      <Plot
        data={[
          {
            x: timeArray,
            y: vibrationArray,
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'red' },
          },
        ]}
        layout={{ width: 700, height: 500, title: 'Vibration Over Time' }}
      />
    );
  }

  // 🚀 Generate the vibration data from current parameters
  const { timeArray, vibrationArray } = generateVibrationData(spindleSpeed, depthOfCut);

  //Stability Lobe Graph
  function generateStabilityData() {
    let speeds = [];
    let depths = [];
    
    for (let rpm = 500; rpm <= 6000; rpm += 100) {
      speeds.push(rpm);
      // stability: sinusoidal lobe shapes
      depths.push(2 + Math.sin(rpm/1000) * 1.5);
    }
    return { speeds, depths };
  }
  function StabilityLobeGraph({ speeds, depths }) {
    return (
      <Plot
        data={[
          {
            x: speeds,
            y: depths,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'blue' },
          },
        ]}
        layout={{ width: 700, height: 500, title: 'Stability Lobe Diagram' }}
      />
    );
  }
  
  const { speeds, depths } = generateStabilityData();
  function nextPowerOfTwo(n) {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }
  
  function padArrayToLength(arr, newLength) {
    const padded = [...arr];
    while (padded.length < newLength) {
      padded.push(0); // pad with zeros
    }
    return padded;
  }
  
  function computeFFT(vibrationArray) {
    const desiredLength = nextPowerOfTwo(vibrationArray.length);
    const paddedArray = padArrayToLength(vibrationArray, desiredLength);
  
    const f = new FFT(desiredLength);
    const out = f.createComplexArray();
    const data = f.toComplexArray(paddedArray);
    f.transform(out, data);
  
    let frequencies = [];
    let amplitudes = [];
    
    for (let i = 0; i < out.length; i += 2) {
      frequencies.push(i); // simplified frequency bins
      amplitudes.push(Math.sqrt(out[i] * out[i] + out[i + 1] * out[i + 1]));
    }
    return { frequencies, amplitudes };
  }
  
  function FrequencySpectrumGraph({ frequencies, amplitudes }) {
    return (
      <Plot
        data={[
          {
            x: frequencies,
            y: amplitudes,
            type: 'scatter',
            mode: 'lines',
            marker: { color: 'green' },
          },
        ]}
        layout={{ width: 700, height: 500, title: 'Frequency Spectrum (FFT)' }}
      />
    );
  }
  
  const { frequencies, amplitudes } = computeFFT(vibrationArray);
  function generateSurfaceFinishData(feedRates) {
    return feedRates.map(feed => 0.5 + 2*feed + Math.random()*0.1);
  }

  function SurfaceFinishGraph({ feedRates, roughnessValues }) {
    return (
      <Plot
        data={[
          {
            x: feedRates,
            y: roughnessValues,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'purple' },
          },
        ]}
        layout={{ width: 700, height: 500, title: 'Surface Finish vs Feed Rate' }}
      />
    );
  }
  const feedRates = [0.1, 0.2, 0.3, 0.4, 0.5];
const roughnessValues = generateSurfaceFinishData(feedRates);
function generateChatterRiskMapReal() {
  const toolStiffness = 1e6; // N/m
  const dampingRatio = 0.05; 
  const mass = 2; // kg
  const naturalFreq = Math.sqrt(toolStiffness / mass); // rad/s
  const c = 2 * mass * naturalFreq * dampingRatio; // damping coefficient

  let xSpeeds = Array.from({ length: 100 }, (_, i) => 500 + i * 100); // RPM
  let yDepths = Array.from({ length: 90 }, (_, i) => 0.5 + i * 0.5); // mm
  
  let zRisk = yDepths.map(depth =>
    xSpeeds.map(speed => {
      let omega = (speed * 2 * Math.PI) / 60; // convert RPM to rad/s
      let a_critical = (2 * c * omega) / toolStiffness; // critical depth of cut (meters)
      a_critical *= 1000; // convert meters to mm

      if (depth > a_critical) {
        return 1; // High risk
      } else {
        return 0; // Safe
      }
    })
  );
  
  return { xSpeeds, yDepths, zRisk };
}

function ChatterRiskHeatmap({ xSpeeds, yDepths, zRisk }) {
  return (
    <Plot
      data={[
        {
          z: zRisk,
          x: xSpeeds,
          y: yDepths,
          type: 'heatmap',
          colorscale: 'Jet',
        },
      ]}
      layout={{ width: 700, height: 500, title: 'Chatter Risk Heatmap' }}
    />
  );
}

const { xSpeeds, yDepths, zRisk } = generateChatterRiskMapReal();

  
  return (
    <div className=' flex flex-col items-center justify-center'>
      <div className=' flex gap-1 '>

      <button
  className={`${activeGraph === 'vibration' ? 'bg-blue-200' : ''} p-1 cursor-pointer px-2 border`}
  onClick={() => setActiveGraph('vibration')}
>
  Vibration Graph
</button>

<button
  className={`${activeGraph === 'stability' ? 'bg-blue-200' : ''} p-1 cursor-pointer px-2 border`}
  onClick={() => setActiveGraph('stability')}
>
  Stability Lobe Graph
</button>

<button
  className={`${activeGraph === 'fft' ? 'bg-blue-200' : ''} p-1 cursor-pointer px-2 border`}
  onClick={() => setActiveGraph('fft')}
>
  FFT Graph
</button>

<button
  className={`${activeGraph === 'surface' ? 'bg-blue-200' : ''} p-1 cursor-pointer px-2 border`}
  onClick={() => setActiveGraph('surface')}
>
  Surface Finish Graph
</button>

<button
  className={`${activeGraph === 'chatter' ? 'bg-blue-200' : ''} p-1 cursor-pointer px-2 border`}
  onClick={() => setActiveGraph('chatter')}
>
  Chatter Risk Heatmap
</button>

      </div>
      
      {activeGraph === 'vibration' && <VibrationTimeGraph timeArray={timeArray} vibrationArray={vibrationArray} />}
      {activeGraph === 'stability' && <StabilityLobeGraph speeds={speeds} depths={depths} />}
      {activeGraph === 'fft' && <FrequencySpectrumGraph frequencies={frequencies} amplitudes={amplitudes} />}
      {activeGraph === 'surface' && <SurfaceFinishGraph feedRates={feedRates} roughnessValues={roughnessValues} />}
      {activeGraph === 'chatter' && <ChatterRiskHeatmap xSpeeds={xSpeeds} yDepths={yDepths} zRisk={zRisk} />}

    </div>
  );
}

export default GraphSection;
