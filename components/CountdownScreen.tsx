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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#ccf137",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        overflow: "hidden",
      }}
    >
      {/* Top Left - RAFFLE TIME banner */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          left: "-320px",
          animation: `
            popIn 0.5s ease-out 0.2s both,
            floatUpDown 2.5s ease-in-out 0.7s infinite
          `,
        }}
      >
        <img
          src={"./assets/raffe.png"}
          alt="raffle_time"
          style={{
            height: "auto",
            maxWidth: "1200px",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Top Right - LIVE badge & Logo placeholder */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: "40px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          animation: "popIn 0.5s ease-out 0.4s both",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            color: "#E74C3C",
            padding: "8px 16px",
            borderRadius: "5px",
            fontWeight: "bold",
            fontSize: "clamp(14px, 2vw, 20px)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "#E74C3C",
              borderRadius: "50%",
              animation: "pulse 1s ease-in-out infinite",
            }}
          />
          LIVE
        </div>
        {/* Logo placeholder - replace with your image */}
        <div
          style={{
            color: "#000",
            fontWeight: "bold",
            fontSize: "clamp(20px, 3vw, 32px)",
          }}
        >
          LINK PADEL
        </div>
      </div>

      {/* Center Right - Padel racket image placeholder */}
      <div
        style={{
          position: "absolute",
          right: "0%",
          top: "0%",
          transform: "translateY(-50%)",
          animation:
            "popIn 0.5s ease-out 0.8s both, floatUpDown 3s ease-in-out 0.7s infinite",
        }}
      >
        <img
          src={"./assets/Box.png"}
          alt="Box"
          style={{
            height: "auto",
            maxWidth: "1500px",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Left side - Prize info */}
      <div
        style={{
          position: "absolute",
          left: "-50px",
          top: "35%",
          transform: "translateY(-50%)",
          animation:
            "slideInLeft 0.5s ease-out 0.6s both,floatUpDown 2s ease-in-out 0.7s infinite",
        }}
      >
        <img
          src={"./assets/bagi.png"}
          alt="bagi"
          style={{
            height: "auto",
            maxWidth: "900px",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Total Voucher count */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "120px",
          transform: "translateX(-50%)",
          textAlign: "center",
          animation: "popIn 0.5s ease-out 1.2s both",
        }}
      >
        <div
          style={{
            fontSize: "clamp(40px, 8vw, 80px)",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {totalItems}
        </div>
        <div
          style={{
            fontSize: "clamp(14px, 2vw, 20px)",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          TOTAL VOUCHER
        </div>
      </div>

      {/* Timer display */}
      <div
        style={{
          position: "absolute",
          left: "40px",
          bottom: "40px",
          animation: "popIn 0.5s ease-out 0.3s both",
        }}
      >
        <div
          style={{
            color: "#000",
            marginBottom: "10px",
          }}
          className="font-bold text-3xl"
        >
          AKAN DIMULAI DALAM :
        </div>
        <div
          style={{
            backgroundColor: "#000",
            color: "#fff",
            padding: "15px 25px",
            fontSize: "clamp(32px, 6vw, 64px)",
            fontWeight: "bold",
            fontFamily: "monospace",
            borderRadius: "10px",
            animation: "timerPulse 1s ease-in-out infinite",
            minWidth: "280px",
            textAlign: "center",
          }}
        >
          {formatTime(remainingSeconds)}
        </div>
      </div>

      {/* Cancel button - small X icon */}
      <button
        onClick={onCancel}
        style={{
          position: "absolute",
          bottom: "70px",
          left: "20px",
          width: "40px",
          height: "40px",
          fontSize: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.5,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
      >
        ✕
      </button>

      {/* Sponsor bar placeholder */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#000",
          padding: "15px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "30px",
          animation: "slideUp 0.5s ease-out 1.5s both",
        }}
      >
        <span style={{ color: "#666", fontSize: "14px" }}>Sponsored by</span>
        {/* Replace with sponsor logos */}
        <span style={{ color: "#fff", fontWeight: "bold" }}>BRI</span>
        <span style={{ color: "#fff", fontWeight: "bold" }}>CRYSTALIN</span>
        <span style={{ color: "#fff", fontWeight: "bold" }}>POCARI</span>
        <span style={{ color: "#fff", fontWeight: "bold" }}>KRISBOW</span>
      </div>

      <style jsx>{`
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
