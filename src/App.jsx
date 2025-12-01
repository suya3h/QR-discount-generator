import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function DiscountScratchCard() {
  const [step, setStep] = useState('form');
  const [customerName, setCustomerName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [discount, setDiscount] = useState(0);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const generateDiscount = () => {

     const weighted = [
    5, 5, 5, 5, 5,        // 5% very common
    10, 10, 10, 10,       // 10% common
    15, 15, 15,           // 15% medium
    16,                   // rare
    17,                   // rare
    18,                   // rare
    19,                   // rare
    20                    // very rare
  ];

  const index = Math.floor(Math.random() * weighted.length);
  return weighted[index];
};
  

  const handleSubmit = () => {
    if (customerName && billAmount && parseFloat(billAmount) > 0) {
      const newDiscount = generateDiscount();
      setDiscount(newDiscount);
      setStep('scratch');
      setScratchPercentage(0);
    }
  };

  useEffect(() => {
    if (showConfetti && confettiCanvasRef.current) {
      const canvas = confettiCanvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const confettiPieces = [];
      const confettiCount = 150;
      const colors = ['#6B8E23', '#8B4513', '#FFDAB9', '#FFD700', '#FF6347', '#6B4423'];

      for (let i = 0; i < confettiCount; i++) {
        confettiPieces.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          w: Math.random() * 10 + 5,
          h: Math.random() * 10 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedY: Math.random() * 3 + 2,
          speedX: Math.random() * 2 - 1,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 10 - 5
        });
      }

      let animationId;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confettiPieces.forEach((piece) => {
          ctx.save();
          ctx.translate(piece.x + piece.w / 2, piece.y + piece.h / 2);
          ctx.rotate((piece.rotation * Math.PI) / 180);
          ctx.fillStyle = piece.color;
          ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
          ctx.restore();

          piece.y += piece.speedY;
          piece.x += piece.speedX;
          piece.rotation += piece.rotationSpeed;

          if (piece.y > canvas.height) {
            piece.y = -20;
            piece.x = Math.random() * canvas.width;
          }
        });

        animationId = requestAnimationFrame(animate);
      };

      animate();

      setTimeout(() => {
        setShowConfetti(false);
        cancelAnimationFrame(animationId);
      }, 4000);

      return () => cancelAnimationFrame(animationId);
    }
  }, [showConfetti]);

  useEffect(() => {
    if (step === 'scratch' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = 280;
      canvas.height = 180;

      ctx.fillStyle = '#6B7280';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎁 SCRATCH HERE 🎁', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '13px Arial';
      ctx.fillText('Scratch to reveal!', canvas.width / 2, canvas.height / 2 + 20);
    }
  }, [step]);

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 20, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }
    
    const percentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
    setScratchPercentage(percentage);
    
    if (percentage > 50) {
      setShowConfetti(true);
      setTimeout(() => setStep('result'), 500);
    }
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (isDrawing) {
      scratch(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (isDrawing) {
      const touch = e.touches[0];
      scratch(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const handleReset = () => {
    setStep('form');
    setCustomerName('');
    setBillAmount('');
    setDiscount(0);
    setScratchPercentage(0);
  };

  const originalAmount = parseFloat(billAmount) || 0;
  const discountAmount = (originalAmount * discount) / 100;
  const finalAmount = originalAmount - discountAmount;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #8B7355 0%, #6B8E23 50%, #FFDAB9 100%)'}}>

      {showConfetti && (
        <canvas
          ref={confettiCanvasRef}
          className="fixed inset-0 pointer-events-none z-50"
        />
      )}

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-8 left-5 text-5xl transform -rotate-12">🍃</div>
        <div className="absolute top-16 right-5 text-6xl transform rotate-45">🍃</div>
        <div className="absolute bottom-16 left-5 text-7xl transform rotate-12">🍃</div>
        <div className="absolute bottom-8 right-8 text-5xl transform -rotate-45">🍃</div>
        
        <div className="absolute top-32 left-1/4 text-3xl">🫓</div>
        <div className="absolute top-48 right-1/4 text-3xl">☕</div>
        <div className="absolute bottom-32 left-1/3 text-3xl">🍛</div>
        <div className="absolute bottom-48 right-1/3 text-2xl">🥥</div>
      </div>

      <div className="absolute bottom-4 left-4 text-4xl opacity-20">👥</div>
      <div className="absolute top-4 right-4 text-3xl opacity-20">☕👫</div>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.3)', fontFamily: 'Georgia, serif'}}>
          Yaariyan
        </h1>
        <p className="text-white text-xs md:text-sm" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
          South Indian Café
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative z-10 mx-4" style={{backgroundColor: 'rgba(255, 250, 240, 0.98)', marginTop: '80px'}}>
        {step === 'form' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="bg-gradient-to-br from-amber-700 to-yellow-800 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-3 shadow-lg">
                <span className="text-3xl">🍽️</span>
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{color: '#6B4423'}}>
                Win Your Discount!
              </h1>
              <p className="text-gray-700 text-sm">
                Get 5-20% off your bill instantly
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-base"
                  placeholder="Enter bill amount"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full text-white font-bold py-4 rounded-lg transform active:scale-95 transition-all duration-200 shadow-lg text-base"
                style={{background: 'linear-gradient(135deg, #6B4423 0%, #8B7355 100%)'}}
              >
                Get My Discount Card
              </button>
            </div>
          </div>
        )}

        {step === 'scratch' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="text-5xl mb-3 animate-pulse">☕</div>
              <h2 className="text-xl font-bold mb-2" style={{color: '#6B4423'}}>
                Hello, {customerName}!
              </h2>
              <p className="text-gray-700 text-sm">
                Scratch the card below to reveal your discount
              </p>
            </div>

            <div className="relative mx-auto" style={{ width: '280px', height: '180px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl">
                <div className="text-center">
                  <p className="text-white text-5xl font-bold mb-1">
                    {discount}%
                  </p>
                  <p className="text-white text-base font-semibold">
                    OFF!
                  </p>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="absolute inset-0 rounded-2xl cursor-pointer"
                style={{ touchAction: 'none' }}
              />
            </div>

            <div className="text-center text-sm text-gray-600">
              {scratchPercentage < 50 && "Keep scratching..."}
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original Bill:</span>
                <span className="font-semibold">₹{originalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-3 shadow-lg" style={{background: 'linear-gradient(135deg, #6B8E23 0%, #556B2F 100%)'}}>
                <span className="text-white text-3xl font-bold">{discount}%</span>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{color: '#6B4423'}}>
                Congratulations, {customerName}!
              </h2>
              <p className="text-gray-700 text-sm">
                You got {discount}% off!
              </p>
            </div>

            <div className="rounded-xl p-5 space-y-3" style={{background: 'linear-gradient(135deg, #FFDAB9 0%, #FFE4C4 100%)'}}>
              <div className="flex justify-between items-center pb-2 border-b" style={{borderColor: '#D2B48C'}}>
                <span className="text-gray-700 text-sm">Original Amount:</span>
                <span className="text-lg font-semibold" style={{color: '#6B4423'}}>
                  ₹{originalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b" style={{borderColor: '#D2B48C'}}>
                <span className="font-medium text-sm" style={{color: '#6B8E23'}}>Discount ({discount}%):</span>
                <span className="text-lg font-semibold" style={{color: '#6B8E23'}}>
                  -₹{discountAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-base font-bold" style={{color: '#6B4423'}}>Amount to Pay:</span>
                <span className="text-2xl font-bold" style={{color: '#8B4513'}}>
                  ₹{finalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full text-white font-bold py-4 rounded-lg transform active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-base"
              style={{background: 'linear-gradient(135deg, #6B4423 0%, #8B7355 100%)'}}
            >
              <RefreshCw className="w-5 h-5" />
              New Customer
            </button>
          </div>
        )}
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-white opacity-80">
  Developed by <span className="font-semibold">Suyash</span>
</div>

    </div>
  );
}
