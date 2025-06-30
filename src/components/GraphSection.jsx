import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

function GraphSection({ tableEntries }) {
  // Return placeholder if no valid data
  if (!tableEntries || !Array.isArray(tableEntries) || tableEntries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6 text-xs text-gray-600">
        No data available for graph.
      </div>
    );
  }

  // Use the latest entry for dynamic updates
  const entry = tableEntries[tableEntries.length - 1];
  const metricMap = { Zero: 0, Low: 1, Moderate: 2, High: 3, '0 ppm': 0, '1-5 ppm': 1, '2-8 ppm': 2, '5-10 ppm': 3 };

  // Compute data dynamically with proper error handling
  const data = useMemo(() => {
    console.log('GraphSection: Computing data for entry:', entry);

    // Recommended metrics with fallback values
    const reliability = metricMap[entry.reliability] ?? 2;
    const performance = metricMap[entry.performance] ?? reliability; // Fallback to reliability
    const leakage = metricMap[entry.leakageRate] ?? 1;
    const temperature = parseFloat(entry.temperature) || 0;
    const pressure = parseFloat(entry.suctionPressure) || 0;
    const tempImpact = temperature > 260 ? 3 : temperature > 150 ? 2 : 1;
    const pressureImpact = pressure > 50 ? 3 : pressure > 20 ? 2 : 1;

    // Preferred metrics with fallback values
    const preferredReliability = metricMap[entry.preferredReliability] ?? reliability;
    const preferredPerformance = metricMap[entry.preferredPerformance] ?? performance;
    const preferredLeakage = metricMap[entry.preferredLeakage] ?? leakage;

    return [
      {
        x: ['Reliability', 'Performance', 'Leakage', 'Temp Impact', 'Pressure Impact'],
        y: [reliability, performance, leakage, tempImpact, pressureImpact],
        type: 'bar',
        name: 'Recommended',
        marker: { color: '#3b82f6' },
      },
      {
        x: ['Reliability', 'Performance', 'Leakage', 'Temp Impact', 'Pressure Impact'],
        y: [preferredReliability, preferredPerformance, preferredLeakage, tempImpact, pressureImpact],
        type: 'bar',
        name: 'Current',
        marker: { color: '#22c55e' },
      },
    ];
  }, [entry]);

  const layout = {
    title: { text: 'Seal Metrics Comparison', font: { size: 14 } },
    barmode: 'group',
    xaxis: { title: 'Metrics', tickfont: { size: 10 } },
    yaxis: {
      title: 'Rating',
      tickvals: [0, 1, 2, 3],
      ticktext: ['Zero', 'Low', 'Moderate', 'High'],
      range: [0, 3.5],
      tickfont: { size: 10 },
    },
    margin: { t: 40, b: 60, l: 60, r: 20 },
    height: 300,
    font: { size: 10 },
    showlegend: true,
    legend: { x: 1, y: 1, xanchor: 'right', font: { size: 10 } },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      <Plot data={data} layout={layout} style={{ width: '100%' }} config={{ responsive: true }} />
    </div>
  );
}

export default GraphSection;