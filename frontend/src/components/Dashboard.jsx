import React, { useState, useEffect } from 'react';
import { BatteryCharging } from 'lucide-react';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState({ speed: 0, rpm: 0, battery: 80 });
  const [animatedSpeed, setAnimatedSpeed] = useState(0);
  const [animatedRPM, setAnimatedRPM] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => {
      console.log('Connected to server');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSensorData(data);
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
      setConnected(false);
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    let animationFrame;

    const animate = () => {
      setAnimatedSpeed(prevSpeed => {
        const diff = sensorData.speed - prevSpeed;
        return Math.abs(diff) < 0.2 ? sensorData.speed : prevSpeed + diff * 0.05;
      });

      setAnimatedRPM(prevRPM => {
        const diff = sensorData.rpm - prevRPM;
        return Math.abs(diff) < 0.2 ? sensorData.rpm : prevRPM + diff * 0.05;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, [sensorData.speed, sensorData.rpm]);

  const calculateGaugePosition = (value, max) => {
    const angle = (value / max) * 180 - 180;
    const radius = 80;
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  };

  const renderTicks = (max, step) => {
    const ticks = [];
    for (let i = 0; i <= max; i += step) {
      const { x, y } = calculateGaugePosition(i, max);
      ticks.push(
        <line
          key={i}
          x1={x * 0.9} y1={y * 0.9}
          x2={x} y2={y}
          stroke="#9CA3AF" strokeWidth="2"
        />
      );
    }
    return ticks;
  };

  return (
    // <div className="bg-gray-900 p-8 rounded-lg w-full max-w-3xl mx-auto my-8">
      <div className="bg-gray-900 p-8 rounded-lg w-full max-w-3xl mx-auto">

      {!connected && <div className="text-red-500 text-center mb-4">Connecting to server...</div>}

      <div className="grid grid-cols-2 gap-8">
        <div className="relative">
          <svg viewBox="-100 -100 200 200" className="w-full">
          {/* <svg viewBox="-150 -150 300 300" className="w-full"> */}
            <path d="M-90 0 A 90 90 0 0 1 90 0" fill="none" stroke="#374151" strokeWidth="8" />
            {/* <path d="M -130,50 A 150 150 0 0 1 50,-130" fill="none" stroke="#374151" strokeWidth="10" /> */}
            {renderTicks(140, 20)}
            <line
              x1="0" y1="0"
              x2={calculateGaugePosition(animatedSpeed, 140).x}
              y2={calculateGaugePosition(animatedSpeed, 140).y}
              stroke="#10B981" strokeWidth="4" strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="8" fill="#10B981" />
            <text x="0" y="40" textAnchor="middle" className="text-4xl font-bold" fill="#10B981">
              {Math.round(animatedSpeed)}
            </text>
            <text x="0" y="60" textAnchor="middle" className="text-sm" fill="#6B7280">KM/H</text>
          </svg>
        </div>

        <div className="relative">
          <svg viewBox="-100 -100 200 200" className="w-full">
            <path d="M-90 0 A 90 90 0 0 1 90 0" fill="none" stroke="#374151" strokeWidth="8" />
            {renderTicks(6000, 1000)}
            <line
              x1="0" y1="0"
              x2={calculateGaugePosition(animatedRPM, 6000).x}
              y2={calculateGaugePosition(animatedRPM, 6000).y}
              stroke="#F59E0B" strokeWidth="4" strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="8" fill="#F59E0B" />
            <text x="0" y="40" textAnchor="middle" className="text-4xl font-bold" fill="#F59E0B">
              {Math.round(animatedRPM)}
            </text>
            <text x="0" y="60" textAnchor="middle" className="text-sm" fill="#6B7280">RPM</text>
          </svg>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <BatteryCharging className="w-12 h-12 text-blue-500" />
        <div className="w-full max-w-xs bg-gray-700 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${sensorData.battery}%` }}
          />
        </div>
        <span className="text-blue-500 text-xl font-bold">{sensorData.battery}%</span>
      </div>
    </div>
  );
};

export default Dashboard;
