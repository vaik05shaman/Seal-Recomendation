import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function RightBar({ sidebarData }) {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const generateContext = () => {
    if (!sidebarData) return '';
    const {
      operation = 'Turning',
      spindleSpeed = 2500,
      depthOfCut = 2.5,
      feedRate = 0.2,
      toolOverhang = 40,
      material = 'Steel',
      toolType = 'Carbide',
    } = sidebarData;

    return `
      The current machining parameters in the ChatterLab project are:
      - Operation: ${operation}
      - Spindle Speed: ${spindleSpeed} RPM
      - Depth of Cut: ${depthOfCut} mm
      - Feed Rate: ${feedRate} mm/rev
      - Tool Overhang: ${toolOverhang} mm
      - Material: ${material}
      - Tool Type: ${toolType}

      The project includes the following graphs:
      - Vibration Over Time: Generated using a sinusoidal function (amplitude = sin(2 * π * spindleSpeed / 60 * t) * (1 + depthOfCut / 2)) with random noise, showing vibration amplitude over 2 seconds.
      - Stability Lobe Diagram: Plots stable depths of cut vs. spindle speeds (500–6000 RPM), with depths calculated as 2 + sin(RPM/1000) * 1.5, forming sinusoidal lobes.
      - Frequency Spectrum (FFT): Computes the FFT of the vibration signal, showing frequency components.
      - Surface Finish: Plots surface roughness vs. feed rate (0.1–0.5 mm/rev), where roughness = 0.5 + 2 * feed + random(0.1).
      - Chatter Risk Heatmap: Shows chatter risk for spindle speeds (500–10500 RPM) and depths (0.5–45 mm), where risk is high if depth > critical depth (a_critical = (2 * c * omega) / toolStiffness).

      The simulation visualizes a rotating workpiece (speed based on spindleSpeed) and a cutting tool positioned according to depthOfCut.
    `;
  };

  const isProjectRelated = (question) => {
    const keywords = [
      'graph', 'vibration', 'stability', 'lobe', 'fft', 'frequency', 'spectrum',
      'surface', 'finish', 'chatter', 'risk', 'heatmap', 'simulation', 'spindle',
      'speed', 'depth', 'cut', 'feed', 'rate', 'tool', 'overhang', 'material',
      'shape', 'value', 'why', 'how'
    ];
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'i');
    const isRelated = regex.test(question);
    console.log(`Question: "${question}" | Is Project-Related: ${isRelated}`);
    return isRelated;
  };

  async function generateAns() {
    if (!prompt.trim()) return; 

    console.log(`User Input Prompt: "${prompt}"`);

    setChatHistory((prev) => [...prev, { role: 'user', text: prompt }]);
    setLoading(true);

    try {
      let fullPrompt;
      if (isProjectRelated(prompt)) {
        const context = generateContext();
        fullPrompt = `
          ${context}
          
          User question: ${prompt}
          
          You are an expert in mechanical engineering and the ChatterLab project. Provide a clear, concise answer related to the project. If the question is about graph shapes, values, or the simulation, explain based on the provided parameters and graph generation logic. For chatter-related questions, use accurate machining insights. Avoid speculative answers and focus on the project's context.
        `;
      } else {
        fullPrompt = `
          You are Gemni, a friendly and knowledgeable chatbot. Answer the user's question in a clear, engaging, and concise manner. Provide accurate information and maintain a conversational tone.
          
          User question: ${prompt}
        `;
      }

      console.log(`Full Prompt Sent to API: "${fullPrompt}"`);

      const response = await axios({
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyD_kZThDDKRanOvlo7rQHLtmBIwqIyRqwU',
        method: 'post',
        data: {
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
        },
      });

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      console.log(`API Response: "${aiResponse}"`);

      setChatHistory((prev) => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error('Error generating response:', error);
      console.log(`Error Details: ${error.message}`);
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      setPrompt(''); // Clear input
    }
  }

  const handlePredefinedQuestion = (question) => {
    console.log(`Predefined Question Selected: "${question}"`);
    setPrompt(question);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateAns();
  };

  return (
    <div className="bg-blue-100 flex flex-col h-screen sm:h-screen md:h-screen lg:h-screen">
      {/* Header */}
      <div className="p-1 sm:p-2 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-black">Ask the AI</h2>
        <p className="text-base sm:text-lg text-gray-700">Ask about chatter, graphs, simulations, or anything else!</p>
      </div>

     
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-10 sm:p-6 md:p-8 lg:p-10 bg-white rounded-md border border-gray-200 mx-1 sm:mx-2 mb-1 sm:mb-2 shadow-lg"
      >
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-500 text-sm sm:text-base mt-20 sm:mt-16">
            Start the conversation by asking a question below!
          </div>
        )}
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } mb-6 sm:mb-4`}
          >
            <div
              className={`max-w-[95%] p-3 sm:p-4 rounded-md shadow-md text-sm sm:text-sm md:text-sm lg:text-sm ${
                message.role === 'user'
                  ? 'bg-blue-400 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-6 sm:mb-4">
            <div className="bg-gray-200 p-3 sm:p-4 rounded-md shadow-md text-sm sm:text-sm md:text-sm lg:text-sm text-gray-500 italic">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-1 sm:p-2 flex-shrink-0">
        <div className="flex flex-col gap-1 sm:gap-2 mb-2 sm:mb-3">
          {[
            'Why does the vibration graph look like that?',
            'Why is the stability lobe graph shaped like that?',
            'What affects the chatter risk in the heatmap?',
            'How does spindle speed affect the simulation?',
            'What is chatter in machining?',
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => handlePredefinedQuestion(question)}
              className="border px-2 sm:px-3 py-1 sm:py-2 rounded-md text-sm sm:text-sm text-left hover:bg-blue-200 transition cursor-pointer min-h-[40px] sm:min-h-[44px]"
            >
              {question}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1 sm:gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            className="w-full border rounded-md p-1 sm:p-2 text-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[40px] sm:min-h-[44px]"
            placeholder="Type your question..."
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className={`border bg-blue-400 border-blue-400 text-white p-1 sm:p-2 rounded-md w-full text-sm sm:text-sm font-bold ${
              loading || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } min-h-[40px] sm:min-h-[44px]`}
          >
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RightBar;