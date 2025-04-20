import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Cylinder, Box } from '@react-three/drei';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useRef, useState, useEffect } from 'react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function GraphSection({ sidebarData }) {
  const { spindleSpeed = 2500, depthOfCut = 2.5, feedRate = 0.2 } = sidebarData || {};

  // Calculate chatter vibration (simplified model)
  const calculateVibration = (t) => {
    return (
      (spindleSpeed / 1000) * Math.sin(t * 0.5) +
      depthOfCut * 0.5 +
      feedRate * t * 5
    );
  };

  const data = {
    labels: ['0s', '1s', '2s', '3s', '4s', '5s'],
    datasets: [
      {
        label: 'Chatter Vibration (mm)',
        data: [0, 1, 2, 3, 4, 5].map(calculateVibration),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chatter Vibration Analysis',
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Vibration (mm)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time (s)',
        },
      },
    },
  };

  return (
    <div className="h-full p-4 bg-white rounded-lg shadow-md">
      <Line data={data} options={options} />
    </div>
  );
}

function TurningModel({ sidebarData }) {
  const mesh = useRef();
  const { spindleSpeed = 2500 } = sidebarData || {};

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.z += spindleSpeed * 0.0001; // Rotate based on spindle speed
    }
  });

  return (
    <Cylinder
      ref={mesh}
      args={[0.5, 0.5, 2, 32]}
      position={[0, 0, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial
        color={sidebarData?.material === 'Steel' ? 'gray' : sidebarData?.material === 'Aluminum' ? 'silver' : 'gold'}
      />
    </Cylinder>
  );
}

function MillingModel({ sidebarData }) {
  const mesh = useRef();
  const { feedRate = 0.2 } = sidebarData || {};

  useFrame(({ clock }) => {
    if (mesh.current) {
      // Simulate milling by oscillating along x-axis
      mesh.current.position.x = Math.sin(clock.getElapsedTime() * feedRate) * 0.5;
    }
  });

  return (
    <Box ref={mesh} args={[2, 0.5, 0.5]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color={sidebarData?.material === 'Steel' ? 'gray' : sidebarData?.material === 'Aluminum' ? 'silver' : 'gold'}
      />
    </Box>
  );
}

function DrillingModel({ sidebarData }) {
  const mesh = useRef();
  const { spindleSpeed = 2500 } = sidebarData || {};

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.z += spindleSpeed * 0.0001;
      mesh.current.position.z = Math.sin(Date.now() * 0.001) * 0.2; // Simulate drilling motion
    }
  });

  return (
    <Cylinder ref={mesh} args={[0.2, 0.2, 3, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color={sidebarData?.material === 'Steel' ? 'gray' : sidebarData?.material === 'Aluminum' ? 'silver' : 'gold'}
      />
    </Cylinder>
  );
}

function SimulationSection({ sidebarData }) {
  const { operation = 'Turning' } = sidebarData || {};
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setHasWebGL(!!gl);
  }, []);

  if (!hasWebGL) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-200 rounded-lg">
        <p className="text-red-500">WebGL is not supported in your browser.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        {operation === 'Turning' && <TurningModel sidebarData={sidebarData} />}
        {operation === 'Milling' && <MillingModel sidebarData={sidebarData} />}
        {operation === 'Drilling' && <DrillingModel sidebarData={sidebarData} />}
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}

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
    <div className="h-full flex flex-col gap-4 p-4 bg-gray-100">
      <div className="h-1/2 min-h-[200px]">
        <GraphSection sidebarData={sidebarData} />
      </div>
      <div className="h-1/2 min-h-[200px]">
        <SimulationSection sidebarData={sidebarData} />
      </div>
    </div>
  );
}

export default Workspace;