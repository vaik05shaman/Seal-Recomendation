import React, { useRef, useEffect } from 'react';

function SimulationSection({ sidebarData }) {
  const canvasRef = useRef(null);
  const { spindleSpeed = 1000, feedRate = 0.2, depthOfCut = 1 } = sidebarData || {};

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let angle = 0;
    let lastTime = performance.now();

    function draw(timestamp) {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Draw rotating workpiece (circle)
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, 2 * Math.PI);
      ctx.strokeStyle = 'gray';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw a marker (stripe) on the workpiece
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(80, 0); // line from center to circumference
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // Draw cutting tool
      ctx.fillStyle = 'red';
      ctx.fillRect(80 + 10, -depthOfCut * 10, 10, depthOfCut * 20);

      ctx.restore();

      // Update rotation angle based on spindle speed (RPM)
      angle += (spindleSpeed / 60) * (2 * Math.PI) * (deltaTime / 1000);

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }, [spindleSpeed, feedRate, depthOfCut]);

  return (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg h-full w-full">
        <div className=' flex flex-col items-center justify-center'>
                <div>Spindle Speed: {spindleSpeed} RPM</div>
                <div>Feed Rate: {feedRate} mm/rev</div>
                <div>Depth of Cut: {depthOfCut} mm</div>
          
        </div>
      <canvas ref={canvasRef} width={500} height={400} />
    </div>
  );
}

export default SimulationSection;
