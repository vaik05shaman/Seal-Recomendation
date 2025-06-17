import React, { useRef, useEffect, useState } from 'react';

function RealisticPumpSimulation({ tableEntries }) {
  const canvasRef = useRef(null);
  const [activeSeal, setActiveSeal] = useState('selected');

  if (!tableEntries || tableEntries.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg h-[500px] w-full">
        <p className="text-gray-600 text-sm font-medium">No seal data available. Configure parameters first.</p>
      </div>
    );
  }

  const entry = tableEntries[0];
  const metricMap = { High: 3, Moderate: 2, Low: 1, Zero: 0 };
  const shaftSpeed = parseFloat(entry.shaftSpeed) || 1000;

  const selected = {
    type: entry.preferredType || 'Type A',
    leakage: metricMap[entry.preferredLeakage] || 1,
    reliability: metricMap[entry.preferredReliability] || 2,
    flushPlan: entry.preferredFlushPlan || 'Plan 11',
  };
  const recommended = {
    type: entry.type || 'Type A',
    leakage: metricMap[entry.leakageRate] || 1,
    reliability: metricMap[entry.reliability] || 2,
    flushPlan: entry.flushPlan || 'Plan 11',
  };

  const currentSeal = activeSeal === 'selected' ? selected : recommended;
  const leakageRate = 4 - currentSeal.leakage;
  const vibration = 3 - currentSeal.reliability;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const components = {
      casing: {
        x: width/2 - 150, y: height/2 - 112.5,
        width: 300, height: 225,
        volutePath: [
          {x:0, y:45}, {x:45, y:0}, {x:255, y:0}, {x:300, y:45},
          {x:345, y:90}, {x:345, y:135}, {x:300, y:180},
          {x:255, y:225}, {x:45, y:225}, {x:0, y:180}
        ]
      },
      inlet: {
        x: width/2 - 225, y: height/2 - 52.5,
        width: 75, height: 105
      },
      outlet: {
        x: width/2 + 37.5, y: height/2 - 150,
        width: 75, height: 60
      },
      impeller: {
        x: width/2, y: height/2,
        diameter: 135, hubDiameter: 45,
        vanes: 6, vaneLength: 67.5
      },
      shaft: {
        x: width/2 - 120, y: height/2 - 18.75,
        length: 240, diameter: 37.5,
        keyway: {x: 45, y: 7.5, width: 75, height: 22.5}
      },
      seal: {
        x: width/2 + 90, y: height/2 - 26.25,
        width: 30, diameter: 52.5,
        faces: { diameter: 30 }
      }
    };

    let angle = 0;
    let lastTime = performance.now();
    const leakageParticles = [];
    const flowParticles = [];

    function createLeakageParticle() {
      if (leakageRate === 0) return;
      leakageParticles.push({
        x: components.seal.x + 15,
        y: components.seal.y + components.seal.diameter/2 + Math.random()*15 - 7.5,
        vx: (0.5 + leakageRate/3) * (0.5 + Math.random()*0.3),
        vy: -0.3 + Math.random()*0.6,
        size: 1 + Math.random()*leakageRate,
        life: 50 + leakageRate*25,
        alpha: 0.9,
      });
    }

    function createFlowParticle(flushPlan) {
      let startX, startY, vx, vy;
      switch (flushPlan) {
        case 'Plan 11':
        case 'Plan 21':
        case 'Plan 31':
          startX = components.outlet.x;
          startY = components.outlet.y + components.outlet.height/2;
          vx = -1.5 - Math.random();
          vy = Math.random()*0.2 - 0.1;
          break;
        case 'Plan 13':
          startX = components.seal.x;
          startY = components.seal.y + components.seal.diameter;
          vx = -1.5 - Math.random();
          vy = 0.5 + Math.random()*0.2;
          break;
        case 'Plan 23':
          startX = components.seal.x;
          startY = components.seal.y;
          vx = 1 + Math.random()*0.5;
          vy = -0.5 - Math.random()*0.2;
          break;
        case 'Plan 32':
        case 'Plan 54':
          startX = components.seal.x + components.seal.width + 50;
          startY = components.seal.y;
          vx = -1.5 - Math.random();
          vy = Math.random()*0.2 - 0.1;
          break;
        case 'Plan 51':
        case 'Plan 62':
          startX = components.seal.x;
          startY = components.seal.y + components.seal.diameter + 20;
          vx = 1 + Math.random()*0.5;
          vy = 0.5 + Math.random()*0.2;
          break;
        case 'Plan 52':
        case 'Plan 53A':
        case 'Plan 53B':
        case 'Plan 53C':
          startX = components.seal.x + 50;
          startY = components.seal.y - 100;
          vx = -1 - Math.random()*0.5;
          vy = 0.5 + Math.random()*0.2;
          break;
        case 'Plan 75':
        case 'Plan 76':
          startX = components.seal.x;
          startY = components.seal.y + components.seal.diameter;
          vx = 1 + Math.random()*0.5;
          vy = 0.5 + Math.random()*0.2;
          break;
        default:
          startX = components.inlet.x + components.inlet.width;
          startY = components.inlet.y + Math.random()*components.inlet.height;
          vx = 1.5 + Math.random();
          vy = Math.random()*0.2 - 0.1;
      }
      flowParticles.push({
        x: startX,
        y: startY,
        vx,
        vy,
        size: 1 + Math.random(),
        life: 150,
        alpha: 0.7,
      });
    }

    function updateParticles(flushPlan) {
      for (let i = leakageParticles.length - 1; i >= 0; i--) {
        const p = leakageParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.01;
        p.life -= 1;
        if (p.life <= 0 || p.alpha <= 0) leakageParticles.splice(i, 1);
      }

      for (let i = flowParticles.length - 1; i >= 0; i--) {
        const p = flowParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (flushPlan === 'Plan 23') {
          if (p.x > components.seal.x + 50) p.vx = -p.vx;
          if (p.y < components.seal.y - 50) p.vy = -p.vy;
        } else if (p.x > width/2) {
          p.vy -= 0.02;
        }
        p.alpha -= 0.005;
        p.life -= 1;
        if (p.life <= 0 || p.alpha <= 0 || p.y < components.outlet.y) {
          flowParticles.splice(i, 1);
        }
      }

      if (Math.random() < leakageRate * 0.05) createLeakageParticle();
      if (Math.random() < 0.2) createFlowParticle(flushPlan);
    }

    function drawFlushLine(ctx, flushPlan) {
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();

      switch (flushPlan) {
        case 'Plan 11':
          ctx.moveTo(components.outlet.x, components.outlet.y + components.outlet.height/2);
          ctx.lineTo(components.seal.x, components.seal.y);
          break;
        case 'Plan 13':
          ctx.moveTo(components.seal.x, components.seal.y + components.seal.diameter);
          ctx.lineTo(components.inlet.x, components.inlet.y + components.inlet.height);
          break;
        case 'Plan 21':
          ctx.moveTo(components.outlet.x, components.outlet.y + components.outlet.height/2);
          ctx.lineTo(components.seal.x + 20, components.seal.y - 30);
          ctx.lineTo(components.seal.x, components.seal.y);
          ctx.rect(components.seal.x, components.seal.y - 45, 20, 20);
          ctx.stroke();
          break;
        case 'Plan 23':
          ctx.moveTo(components.seal.x, components.seal.y);
          ctx.lineTo(components.seal.x + 37.5, components.seal.y - 37.5);
          ctx.lineTo(components.seal.x + 37.5, components.seal.y - 60);
          ctx.lineTo(components.seal.x, components.seal.y - 37.5);
          ctx.closePath();
          ctx.rect(components.seal.x + 22.5, components.seal.y - 60, 22.5, 22.5);
          ctx.stroke();
          break;
        case 'Plan 31':
          ctx.moveTo(components.outlet.x, components.outlet.y + components.outlet.height/2);
          ctx.lineTo(components.seal.x + 20, components.seal.y);
          ctx.arc(components.seal.x + 20, components.seal.y, 11.25, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'Plan 32':
          ctx.moveTo(components.seal.x + components.seal.width + 37.5, components.seal.y);
          ctx.lineTo(components.seal.x, components.seal.y);
          break;
        case 'Plan 51':
          ctx.moveTo(components.seal.x, components.seal.y + components.seal.diameter + 15);
          ctx.lineTo(components.seal.x + 37.5, components.seal.y + components.seal.diameter + 37.5);
          break;
        case 'Plan 52':
        case 'Plan 53A':
        case 'Plan 53B':
        case 'Plan 53C':
          ctx.moveTo(components.seal.x, components.seal.y);
          ctx.lineTo(components.seal.x + 37.5, components.seal.y - 37.5);
          ctx.lineTo(components.seal.x + 37.5, components.seal.y - 75);
          ctx.rect(components.seal.x + 22.5, components.seal.y - 75, 30, 30);
          ctx.stroke();
          break;
        case 'Plan 54':
          ctx.moveTo(components.seal.x + components.seal.width + 37.5, components.seal.y);
          ctx.lineTo(components.seal.x, components.seal.y);
          ctx.rect(components.seal.x + components.seal.width, components.seal.y - 15, 22.5, 22.5);
          ctx.stroke();
          break;
        case 'Plan 62':
          ctx.moveTo(components.seal.x, components.seal.y + components.seal.diameter + 15);
          ctx.lineTo(components.seal.x + 37.5, components.seal.y + components.seal.diameter + 37.5);
          break;
        case 'Plan 75':
        case 'Plan 76':
          ctx.moveTo(components.seal.x, components.seal.y + components.seal.diameter);
          ctx.lineTo(components.seal.x + 37.5, components.seal.y + components.seal.diameter + 37.5);
          ctx.rect(components.seal.x + 22.5, components.seal.y + components.seal.diameter + 37.5, 22.5, 22.5);
          ctx.stroke();
          break;
        default:
          ctx.moveTo(components.outlet.x, components.outlet.y + components.outlet.height/2);
          ctx.lineTo(components.seal.x, components.seal.y);
      }

      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(components.seal.x + components.seal.width + 37.5, components.seal.y - 11.25);
      ctx.lineTo(components.seal.x + components.seal.width + 33.75, components.seal.y - 15);
      ctx.lineTo(components.seal.x + components.seal.width + 33.75, components.seal.y - 7.5);
      ctx.closePath();
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.restore();
    }

    function drawPump(timestamp) {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      const shakeX = vibration * 0.3 * Math.sin(timestamp / 300);
      const shakeY = vibration * 0.2 * Math.cos(timestamp / 350);
      ctx.save();
      ctx.translate(shakeX, shakeY);

      ctx.save();
      ctx.translate(components.casing.x, components.casing.y);
      ctx.beginPath();
      components.casing.volutePath.forEach((point, i) => {
        i === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      const casingGradient = ctx.createLinearGradient(0, 0, components.casing.width, components.casing.height);
      casingGradient.addColorStop(0, '#94a3b8');
      casingGradient.addColorStop(1, '#64748b');
      ctx.fillStyle = casingGradient;
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.25;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(22.5, 60);
      ctx.bezierCurveTo(60, 22.5, 240, 22.5, 277.5, 60);
      ctx.bezierCurveTo(315, 97.5, 315, 127.5, 277.5, 165);
      ctx.bezierCurveTo(240, 202.5, 60, 202.5, 22.5, 165);
      ctx.closePath();
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(components.inlet.x, components.inlet.y);
      ctx.beginPath();
      ctx.rect(0, 0, components.inlet.width, components.inlet.height);
      ctx.fillStyle = '#6b7280';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(-15, 0, 15, components.inlet.height);
      ctx.fillStyle = '#4b5563';
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-7.5, 22.5 + i*22.5, 4.5, 0, Math.PI*2);
        ctx.fillStyle = '#9ca3af';
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(components.outlet.x, components.outlet.y);
      ctx.beginPath();
      ctx.rect(0, 0, components.outlet.width, components.outlet.height);
      ctx.fillStyle = '#6b7280';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(0, -15, components.outlet.width, 15);
      ctx.fillStyle = '#4b5563';
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(15 + i*15, -7.5, 4.5, 0, Math.PI*2);
        ctx.fillStyle = '#9ca3af';
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(components.shaft.x, components.shaft.y);
      ctx.beginPath();
      ctx.rect(0, 0, components.shaft.length, components.shaft.diameter);
      const shaftGradient = ctx.createLinearGradient(0, 0, 0, components.shaft.diameter);
      shaftGradient.addColorStop(0, '#e5e7eb');
      shaftGradient.addColorStop(1, '#9ca3af');
      ctx.fillStyle = shaftGradient;
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(
        components.shaft.keyway.x,
        components.shaft.keyway.y,
        components.shaft.keyway.width,
        components.shaft.keyway.height
      );
      ctx.fillStyle = '#6b7280';
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.rect(30 + i*150, -11.25, 30, 60);
        ctx.fillStyle = '#e5e7eb';
        ctx.fill();
        ctx.stroke();
        for (let j = 0; j < 8; j++) {
          ctx.beginPath();
          ctx.arc(45 + i*150, 7.5 + j*6, 3, 0, Math.PI*2);
          ctx.fillStyle = '#1e293b';
          ctx.fill();
        }
      }
      ctx.restore();

      ctx.save();
      ctx.translate(components.impeller.x, components.impeller.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.arc(0, 0, components.impeller.hubDiameter/2, 0, Math.PI*2);
      const hubGradient = ctx.createRadialGradient(0, 0, 7.5, 0, 0, components.impeller.hubDiameter/2);
      hubGradient.addColorStop(0, '#e5e7eb');
      hubGradient.addColorStop(1, '#9ca3af');
      ctx.fillStyle = hubGradient;
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();
      for (let i = 0; i < components.impeller.vanes; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI*2) / components.impeller.vanes);
        ctx.beginPath();
        ctx.moveTo(components.impeller.hubDiameter/2, -3.75);
        ctx.quadraticCurveTo(
          components.impeller.hubDiameter/2 + 30, -6,
          components.impeller.hubDiameter/2 + components.impeller.vaneLength, 0
        );
        ctx.quadraticCurveTo(
          components.impeller.hubDiameter/2 + 30, 6,
          components.impeller.hubDiameter/2, 3.75
        );
        ctx.closePath();
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(components.impeller.hubDiameter/2 + 15, -2.25);
        ctx.quadraticCurveTo(
          components.impeller.hubDiameter/2 + 37.5, -3.75,
          components.impeller.hubDiameter/2 + components.impeller.vaneLength - 7.5, 0
        );
        ctx.quadraticCurveTo(
          components.impeller.hubDiameter/2 + 37.5, 3.75,
          components.impeller.hubDiameter/2 + 15, 2.25
        );
        ctx.closePath();
        ctx.fillStyle = '#64748b';
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, components.impeller.diameter/2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(156, 163, 175, 0.7)';
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(components.seal.x, components.seal.y);
      ctx.beginPath();
      ctx.rect(0, 0, components.seal.width, components.seal.diameter);
      ctx.fillStyle = '#e5e7eb';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(-11.25, -7.5, 11.25, components.seal.diameter + 15);
      ctx.fillStyle = '#d1d5db';
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-5.625, 11.25 + i*11.25, 3, 0, Math.PI*2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(components.seal.width/2, components.seal.diameter/2, components.seal.faces.diameter/2, 0, Math.PI*2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.translate(components.seal.width/2, components.seal.diameter/2);
      ctx.rotate(angle * 1.1);
      ctx.beginPath();
      ctx.arc(0, 0, components.seal.faces.diameter/2, 0, Math.PI*2);
      ctx.fillStyle = activeSeal === 'selected' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(34, 197, 94, 0.9)';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(components.seal.width/2, components.seal.diameter/2, components.seal.faces.diameter/2 + 2.25, 0, Math.PI*2);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(3.75, 7.5 + i*11.25);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(3.75, 3.75, 7.5, 3.75, 9, 0);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
      drawFlushLine(ctx, currentSeal.flushPlan);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.8;
      flowParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fillStyle = `rgba(100, 200, 255, ${p.alpha})`;
        ctx.fill();
      });
      leakageParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255, 100, 100, ${p.alpha})`;
        ctx.fill();
      });
      ctx.restore();

      ctx.save();
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText('Pump Casing', components.casing.x + components.casing.width/2, components.casing.y + components.casing.height + 15);
      ctx.fillText('Inlet', components.inlet.x - 30, components.inlet.y + components.inlet.height/2);
      ctx.fillText('Outlet', components.outlet.x + components.outlet.width/2, components.outlet.y - 7.5);
      ctx.fillText('Impeller', components.impeller.x, components.impeller.y - 75);
      ctx.fillText('Shaft', components.shaft.x + components.shaft.length/2, components.shaft.y - 15);
      ctx.fillText('Seal', components.seal.x + components.seal.width + 60, components.seal.y + components.seal.diameter/2);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Suction →', components.inlet.x + components.inlet.width/2, components.inlet.y - 7.5);
      ctx.fillText('↑ Discharge', components.outlet.x + components.outlet.width/2, components.outlet.y + components.outlet.height + 15);
      ctx.fillText('Flush →', components.seal.x + components.seal.width + 60, components.seal.y - 7.5);
      ctx.restore();

      angle += (deltaTime / 1000) * (Math.PI*2) * (shaftSpeed / 60);
      updateParticles(currentSeal.flushPlan);
      requestAnimationFrame(drawPump);
    }

    const animationId = requestAnimationFrame(drawPump);
    return () => cancelAnimationFrame(animationId);
  }, [tableEntries, activeSeal, shaftSpeed]);

  return (
    <div className="flex flex-col items-center bg-gray-100 rounded-xl p-4 w-full max-w-4xl mx-auto">
      <div className="flex justify-between w-full mb-4 gap-4">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeSeal === 'selected' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveSeal('selected')}
          >
            Selected ({selected.type}, {selected.flushPlan})
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeSeal === 'recommended' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveSeal('recommended')}
          >
            Recommended ({recommended.type}, {recommended.flushPlan})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <h3 className="font-bold text-sm text-gray-800 mb-2">Seal Specifications</h3>
          <div className="space-y-1 text-xs">
            <p><span className="font-medium">Type:</span> {currentSeal.type}</p>
            <p><span className="font-medium">Flush Plan:</span> {currentSeal.flushPlan}</p>
            <p><span className="font-medium">Leakage:</span> {['Zero', 'Low', 'Moderate', 'High'][currentSeal.leakage]}</p>
            <p><span className="font-medium">Reliability:</span> {['High', 'Moderate', 'Low'][currentSeal.reliability]}</p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm">
          <h3 className="font-bold text-sm text-gray-800 mb-2">Operating Conditions</h3>
          <div className="space-y-1 text-xs">
            <p><span className="font-medium">Pressure:</span> {entry.pressure || 'N/A'} bar</p>
            <p><span className="font-medium">Temperature:</span> {entry.temperature || 'N/A'} °C</p>
            <p><span className="font-medium">Speed:</span> {shaftSpeed} RPM</p>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="border border-gray-300 rounded-xl shadow-lg bg-white w-full"
      />

      <div className="mt-4 text-center">
        <p className="font-semibold text-sm text-gray-800 mb-1">Centrifugal Pump with API {currentSeal.flushPlan}</p>
        <p className="text-xs text-gray-600">
          Blue particles show fluid flow | Red particles indicate leakage | Flush path varies by API plan
        </p>
      </div>
    </div>
  );
}

export default RealisticPumpSimulation;