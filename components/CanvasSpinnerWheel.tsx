import { useRef, useEffect, useState, useCallback } from "react";

interface WheelItem {
  id: number;
  label: string;
  color: string;
  textColor?: string;
}

interface CanvasSpinnerWheelProps {
  items: WheelItem[];
  size?: number;
  duration?: number;
  onSpinComplete?: (item: WheelItem) => void;
  onButtonClick?: () => void;
  autoSpinTrigger?: number;
}

export default function CanvasSpinnerWheel({
  items,
  size = 500,
  duration = 5000,
  onSpinComplete,
  onButtonClick,
  autoSpinTrigger = 0,
}: CanvasSpinnerWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const isSpinningRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const prevTriggerRef = useRef(autoSpinTrigger);

  // Draw the wheel on canvas
  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas || items.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const centerX = canvas.width / 2 / dpr;
      const centerY = canvas.height / 2 / dpr;
      const radius = Math.min(centerX, centerY) - 10;

      // Clear canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Apply rotation
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      const segmentAngle = (2 * Math.PI) / items.length;

      // Draw segments
      items.forEach((item, index) => {
        const startAngle = index * segmentAngle - Math.PI / 2;
        const endAngle = startAngle + segmentAngle;

        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();

        // Draw segment border (skip for many items to avoid black overlap)
        if (items.length <= 50) {
          ctx.strokeStyle = "#000";
          ctx.lineWidth = items.length > 20 ? 1 : 3;
          ctx.stroke();
        }

        // Draw text only if segments are large enough
        if (items.length <= 100) {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(startAngle + segmentAngle / 2);

          // Calculate font size based on item count
          let fontSize = 16;
          if (items.length > 50) fontSize = 9;
          else if (items.length > 30) fontSize = 11;
          else if (items.length > 20) fontSize = 12;
          else if (items.length > 12) fontSize = 14;

          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillStyle = item.textColor || "#000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Truncate label based on item count
          let maxChars = 12;
          if (items.length > 50) maxChars = 3;
          else if (items.length > 30) maxChars = 4;
          else if (items.length > 20) maxChars = 6;
          else if (items.length > 12) maxChars = 8;

          const label =
            item.label.length > maxChars
              ? item.label.slice(0, maxChars) + ".."
              : item.label;

          // Position text in center of segment
          const textRadius = radius * 0.65;
          ctx.fillText(label, textRadius, 0);
          ctx.restore();
        }
      });

      ctx.restore();

      // Draw center circle (button)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI);
      ctx.fillStyle = "#b94220";
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw "SPIN" text
      ctx.font = `bold ${Math.floor(radius * 0.08)}px Arial`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SPIN", centerX, centerY);

      // Draw pointer (fixed at top)
      const pointerSize = radius * 0.12;
      ctx.beginPath();
      ctx.moveTo(centerX, 5);
      ctx.lineTo(centerX - pointerSize / 2, pointerSize + 5);
      ctx.lineTo(centerX + pointerSize / 2, pointerSize + 5);
      ctx.closePath();
      ctx.fillStyle = "#b94220";
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [items]
  );

  // Setup canvas with proper DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    drawWheel(rotationRef.current);
  }, [size, drawWheel]);

  // Redraw when items change
  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [items, drawWheel]);

  // Handle auto spin trigger
  useEffect(() => {
    if (autoSpinTrigger > 0 && autoSpinTrigger !== prevTriggerRef.current) {
      spin();
    }
    prevTriggerRef.current = autoSpinTrigger;
  }, [autoSpinTrigger]);

  const spin = useCallback(() => {
    if (isSpinningRef.current || items.length < 2) return;

    isSpinningRef.current = true;
    setIsSpinning(true);

    // Random winner index
    const winnerIndex = Math.floor(Math.random() * items.length);
    const segmentAngle = 360 / items.length;

    // Calculate target rotation
    // We need the winner segment to land at the top (pointer position)
    // Add multiple full rotations for effect (20-30 spins)
    const fullRotations = 20 + Math.random() * 10;
    const targetSegmentRotation =
      360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const targetRotation =
      rotationRef.current + fullRotations * 360 + targetSegmentRotation;

    const startRotation = rotationRef.current;
    const totalRotation = targetRotation - startRotation;
    const startTime = performance.now();

    // Cubic ease-out for smooth deceleration
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      rotationRef.current = startRotation + totalRotation * eased;
      drawWheel(rotationRef.current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Normalize rotation to 0-360
        rotationRef.current = rotationRef.current % 360;
        if (rotationRef.current < 0) rotationRef.current += 360;

        isSpinningRef.current = false;
        setIsSpinning(false);

        if (onSpinComplete) {
          onSpinComplete(items[winnerIndex]);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [items, duration, drawWheel, onSpinComplete]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpinningRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const distance = Math.sqrt(x * x + y * y);
    const radius = size / 2 - 10;

    // Check if clicked on center button
    if (distance <= radius * 0.15) {
      if (onButtonClick) {
        onButtonClick();
      }
      spin();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        cursor: isSpinning ? "default" : "pointer",
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    />
  );
}
