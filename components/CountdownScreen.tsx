interface CountdownScreenProps {
  remainingSeconds: number;
  totalItems: number;
  onCancel: () => void;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CountdownScreen({
  remainingSeconds,
  totalItems,
  onCancel,
}: CountdownScreenProps) {
  return (
    <div className="countdown-container">
      {/* Top Left - RAFFLE TIME banner */}
      <div className="raffle-banner">
        <img
          src={"./assets/raffe.webp"}
          alt="raffle_time"
        />
      </div>

      {/* Top Right - LIVE badge & Logo placeholder */}
      <div className="live-badge">
        <img
          src={"./assets/live.webp"}
          alt="Live"
        />
      </div>

      {/* Center Right - Padel racket image placeholder */}
      <div className="box-image">
        <img
          src={"./assets/BoxNew.webp"}
          alt="Box"
        />
      </div>

      {/* Left side - Prize info */}
      <div className="bagi-image">
        <img
          src={"./assets/bagi.webp"}
          alt="bagi"
        />
      </div>

      {/* Total Voucher count */}
      <div className="voucher-count">
        <div className="voucher-number">{totalItems}</div>
        <div className="voucher-label">
          TOTAL <br /> VOUCHER
        </div>
      </div>

      {/* Timer display */}
      <div className="timer-section">
        <div className="timer-label">
          AKAN DIMULAI DALAM :
        </div>
        <div className="timer-display">
          {formatTime(remainingSeconds)}
        </div>
      </div>

      {/* Cancel button - small X icon */}
      <button
        onClick={onCancel}
        className="cancel-button"
      >
        ✕
      </button>

      {/* Bottom sponsor bar */}
      <div className="sponsor-bar">
        <img
          src={"./assets/bar.webp"}
          alt="bar"
        />
      </div>

      <style jsx>{`
        .countdown-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccf137;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          overflow: hidden;
        }

        /* RAFFLE TIME banner */
        .raffle-banner {
          position: absolute;
          top: -3vw;
          left: -15vw;
          animation: popIn 0.5s ease-out 0.2s both,
            floatUpDown 2.5s ease-in-out 0.7s infinite;
        }
        .raffle-banner img {
          height: auto;
          width: 60vw;
          max-width: 1200px;
          min-width: 300px;
          object-fit: contain;
        }

        /* LIVE badge */
        .live-badge {
          position: absolute;
          top: -3vw;
          right: -3vw;
          display: flex;
          align-items: center;
          gap: 20px;
          z-index: 10;
          animation: popIn 0.5s ease-out 0.4s both;
        }
        .live-badge img {
          height: auto;
          width: 25vw;
          max-width: 500px;
          min-width: 150px;
          object-fit: contain;
        }

        /* Box/Padel image */
        .box-image {
          position: absolute;
          right: 0;
          top: 0;
          transform: translateY(-25%);
          animation: popIn 0.5s ease-out 0.8s both,
            floatUpDown 3s ease-in-out 0.7s infinite;
        }
        .box-image img {
          height: auto;
          width: 78vw;
          max-width: 1500px;
          min-width: 400px;
          object-fit: contain;
        }

        /* Bagi-bagi raket image */
        .bagi-image {
          position: absolute;
          left: -2vw;
          top: 35%;
          transform: translateY(-50%);
          animation: popIn 0.5s ease-out 0.2s both,
            floatUpDown 2s ease-in-out 0.7s infinite;
        }
        .bagi-image img {
          height: auto;
          width: 45vw;
          max-width: 900px;
          min-width: 250px;
          object-fit: contain;
        }

        /* Voucher count */
        .voucher-count {
          position: absolute;
          left: 40%;
          bottom: 12vh;
          transform: translateX(-50%);
          text-align: center;
          animation: popIn 0.5s ease-out 1.2s both;
          display: flex;
          flex-direction: row;
          gap: 1vw;
          align-items: center;
        }
        .voucher-number {
          color: #b94220;
          font-weight: bold;
          font-size: clamp(2rem, 5vw, 4.5rem);
        }
        .voucher-label {
          text-align: left;
          color: black;
          font-weight: 600;
          font-size: clamp(1rem, 2vw, 1.875rem);
          text-transform: uppercase;
        }

        /* Timer section */
        .timer-section {
          position: absolute;
          left: 1vw;
          bottom: 5vh;
          animation: popIn 0.5s ease-out 0.3s both;
        }
        .timer-label {
          color: #000;
          margin-bottom: 8px;
          font-weight: bold;
          font-size: clamp(0.875rem, 1.5vw, 1.25rem);
        }
        .timer-display {
          background-color: #000;
          color: #fff;
          padding: clamp(6px, 1vw, 12px) clamp(12px, 2vw, 20px);
          font-size: clamp(1.25rem, 3vw, 2.5rem);
          font-weight: bold;
          font-family: monospace;
          border-radius: 8px;
          animation: timerPulse 1s ease-in-out infinite;
          min-width: clamp(120px, 15vw, 200px);
          text-align: center;
        }

        /* Cancel button */
        .cancel-button {
          position: absolute;
          top: 20px;
          left: 20px;
          width: clamp(30px, 4vw, 40px);
          height: clamp(30px, 4vw, 40px);
          font-size: clamp(14px, 2vw, 20px);
          background-color: rgba(0, 0, 0, 0.3);
          color: #fff;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.5;
          transition: opacity 0.2s ease;
          z-index: 100;
        }
        .cancel-button:hover {
          opacity: 1;
        }

        /* Sponsor bar */
        .sponsor-bar {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          animation: slideUp 0.5s ease-out 0.6s both;
        }
        .sponsor-bar img {
          height: auto;
          width: 100%;
          max-width: 100vw;
          object-fit: contain;
        }

        /* Tablet breakpoint */
        @media (max-width: 1024px) {
          .raffle-banner {
            top: -2vw;
            left: -20vw;
          }
          .raffle-banner img {
            width: 70vw;
          }

          .live-badge {
            top: -2vw;
            right: -5vw;
          }
          .live-badge img {
            width: 30vw;
          }

          .box-image {
            right: -5vw;
            top: 5%;
          }
          .box-image img {
            width: 80vw;
          }

          .bagi-image {
            left: -5vw;
            top: 30%;
          }
          .bagi-image img {
            width: 55vw;
          }

          .voucher-count {
            left: 30%;
            bottom: 10vh;
          }
        }

        /* Mobile breakpoint */
        @media (max-width: 768px) {
          .raffle-banner {
            top: 0;
            left: -25vw;
          }
          .raffle-banner img {
            width: 80vw;
            min-width: 250px;
          }

          .live-badge {
            top: 0;
            right: -8vw;
          }
          .live-badge img {
            width: 35vw;
            min-width: 120px;
          }

          .box-image {
            right: -10vw;
            top: 10%;
            transform: translateY(0);
          }
          .box-image img {
            width: 90vw;
            min-width: 300px;
          }

          .bagi-image {
            left: -8vw;
            top: 25%;
          }
          .bagi-image img {
            width: 65vw;
            min-width: 200px;
          }

          .voucher-count {
            left: 25%;
            bottom: 12vh;
            gap: 2vw;
          }

          .timer-section {
            left: 2vw;
            bottom: 8vh;
          }
        }

        /* Small mobile breakpoint */
        @media (max-width: 480px) {
          .raffle-banner {
            top: 2vw;
            left: -30vw;
          }
          .raffle-banner img {
            width: 90vw;
          }

          .live-badge {
            top: 2vw;
            right: -10vw;
          }
          .live-badge img {
            width: 40vw;
          }

          .box-image {
            right: -15vw;
            top: 15%;
          }
          .box-image img {
            width: 100vw;
          }

          .bagi-image {
            left: -10vw;
            top: 22%;
          }
          .bagi-image img {
            width: 75vw;
          }

          .voucher-count {
            left: 20%;
            bottom: 15vh;
            flex-direction: column;
            gap: 0;
          }
          .voucher-label {
            text-align: center;
          }

          .timer-section {
            left: 3vw;
            bottom: 10vh;
          }

          .cancel-button {
            top: 10px;
            left: 10px;
          }
        }

        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          70% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateY(-50%) translateX(-100px);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(100%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(-50%) translateY(0px);
          }
          50% {
            transform: translateY(-50%) translateY(-20px);
          }
        }
        @keyframes floatUpDown {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes timerPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
