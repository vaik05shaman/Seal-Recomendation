import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

function GraphSection({ tableEntries }) {
  // Return null if no valid data
  if (!tableEntries || !Array.isArray(tableEntries) || tableEntries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 mb-5 text-xs text-gray-600">
        No data available for graph.
      </div>
    );
  }

  const entry = tableEntries[0];
  const metricMap = { Zero: 0, Low: 1, Moderate: 2, High: 3 };

  // Compute data dynamically based on entry
  const data = useMemo(() => {
    // Base metrics
    const reliability = metricMap[entry.reliability] ?? 2;
    const performance = metricMap[entry.performance] ?? 2;
    const leakage = metricMap[entry.leakageRate] ?? 1;
    const compliance = entry.complianceNotes?.length ? 3 : 1;

    // Additional metrics influenced by parameters
    const temperature = parseFloat(entry.temperature) || 0;
    const pressure = parseFloat(entry.pressure) || 0;
    const tempImpact = temperature > 260 ? 3 : temperature > 150 ? 2 : 1;
    const pressureImpact = pressure > 50 ? 3 : pressure > 20 ? 2 : 1;

    return [
      {
        x: ['Reliability', 'Performance', 'Leakage', 'Compliance', 'Temp Impact', 'Pressure Impact'],
        y: [reliability, performance, leakage, compliance, tempImpact, pressureImpact],
        type: 'bar',
        name: 'Recommended',
        marker: { color: '#3b82f6' },
      },
      {
        x: ['Reliability', 'Performance', 'Leakage', 'Compliance', 'Temp Impact', 'Pressure Impact'],
        y: [
          metricMap[entry.preferredReliability] ?? 2,
          metricMap[entry.preferredPerformance] ?? 2,
          metricMap[entry.preferredLeakage] ?? 1,
          entry.complianceNotes?.length ? 3 : 1,
          tempImpact,
          pressureImpact,
        ],
        type: 'bar',
        name: 'Preferred',
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
    height: 250,
    font: { size: 10 },
    showlegend: true,
    legend: { x: 1, y: 1, xanchor: 'right', font: { size: 10 } },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 mb-5">
      <Plot data={data} layout={layout} style={{ width: '100%' }} />
    </div>
  );
}

export default React.memo(GraphSection);