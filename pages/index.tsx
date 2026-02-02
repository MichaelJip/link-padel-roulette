import { useState, useRef, useEffect } from "react";
import CanvasSpinnerWheel from "@/components/CanvasSpinnerWheel";
import * as XLSX from "xlsx";
import Confetti from "react-confetti";
import {
  fetchLotteryItems,
  insertLotteryItems,
  deleteLotteryItem,
  deleteAllLotteryItems,
  LotteryItem,
} from "@/lib/supabase/lottery";
import CountdownScreen from "@/components/CountdownScreen";

const WHEEL_COLORS = ["#ccf137", "#b94220", "#ffff"];

interface WheelItem {
  id: number;
  label: string;
  color: string;
  textColor?: string;
  ticketCode?: string;
}

const initialItems: WheelItem[] = [
  { id: 1, label: "Prize 1", color: "#ccf137", textColor: "#000" },
  { id: 2, label: "Prize 2", color: "#b94220", textColor: "#000" },
  { id: 3, label: "Prize 3", color: "#ffff", textColor: "#000" },
  { id: 4, label: "Prize 4", color: "#ccf137", textColor: "#000" },
];

function mapLotteryToWheelItems(lotteryItems: LotteryItem[]): WheelItem[] {
  return lotteryItems.map((item, index) => ({
    id: item.id,
    label: item.name,
    color: WHEEL_COLORS[index % WHEEL_COLORS.length],
    textColor: "#000",
    ticketCode: item.code || undefined,
  }));
}

export default function Home() {
  const [items, setItems] = useState<WheelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [wheelSize, setWheelSize] = useState(700);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadItems() {
      setIsLoading(true);
      const lotteryItems = await fetchLotteryItems();
      if (lotteryItems.length >= 2) {
        setItems(mapLotteryToWheelItems(lotteryItems));
      } else {
        setItems(initialItems);
      }
      setIsLoading(false);
    }
    loadItems();
  }, []);

  useEffect(() => {
    const updateWheelSize = () => {
      const width = window.innerWidth - 280; // Account for sidebar
      const height = window.innerHeight;
      const minDimension = Math.min(width, height);
      const size = Math.min(700, minDimension - 120);
      setWheelSize(Math.max(280, size));
    };

    updateWheelSize();
    window.addEventListener("resize", updateWheelSize);
    return () => window.removeEventListener("resize", updateWheelSize);
  }, []);

  // Timer states
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Timer countdown effect
  useEffect(() => {
    if (isCountingDown && remainingSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && remainingSeconds === 0) {
      setIsCountingDown(false);
      setIsRevealing(true);
      // Hide reveal animation after it completes
      setTimeout(() => setIsRevealing(false), 1500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isCountingDown, remainingSeconds]);

  const startTimer = () => {
    const totalSeconds = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
    if (totalSeconds <= 0) {
      alert("Please set a valid time!");
      return;
    }
    setRemainingSeconds(totalSeconds);
    setIsCountingDown(true);
    setShowTimerModal(false);
  };

  const cancelTimer = () => {
    setIsCountingDown(false);
    setRemainingSeconds(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = event.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
        header: 1,
        defval: "",
      });

      // ✅ STRONG header detection
      const firstRow = rows[0]?.map((v: string) =>
        String(v).toLowerCase().trim(),
      );

      const hasHeader =
        firstRow?.includes("name") && firstRow?.includes("code");

      const dataRows = hasHeader ? rows.slice(1) : rows;

      const parsedItems = dataRows
        .map((row) => {
          const colA = String(row[0] ?? "").trim();
          const colB = String(row[1] ?? "").trim();

          if (!colA) return null;

          return {
            name: normalize(colA),
            code: colB || undefined,
          };
        })
        .filter(Boolean) as { name: string; code?: string }[];

      if (parsedItems.length < 2) {
        alert("Excel must have at least 2 items!");
        return;
      }

      const savedItems = await insertLotteryItems(parsedItems);

      if (savedItems.length > 0) {
        setItems(mapLotteryToWheelItems(savedItems));
      } else {
        alert("Failed to save items to database!");
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  function normalize(text: string) {
    return text.replace(/\s+/g, " ").trim();
  }

  // Volume: 0 = muted, 1 = full volume (adjust as needed)
  const SPIN_VOLUME = 0.3;
  const WIN_VOLUME = 0.5;

  const playSpinSound = () => {
    if (spinSoundRef.current) {
      spinSoundRef.current.volume = SPIN_VOLUME;
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play();
    }
  };

  const stopSpinSound = () => {
    if (spinSoundRef.current) {
      spinSoundRef.current.pause();
      spinSoundRef.current.currentTime = 0;
    }
  };

  const playWinSound = () => {
    if (winSoundRef.current) {
      winSoundRef.current.volume = WIN_VOLUME;
      winSoundRef.current.currentTime = 0;
      winSoundRef.current.play();
    }
  };

  const handleButtonClick = () => {
    playSpinSound();
    setSpinTrigger((prev) => prev + 1);
  };

  const handleSpinComplete = (item: any) => {
    stopSpinSound();
    playWinSound();
    setWinner(item);
    setShowModal(true);
  };

  const deleteItem = async (id: number) => {
    if (items.length <= 2) {
      alert("You need at least 2 items on the wheel!");
      return;
    }
    const success = await deleteLotteryItem(id);
    if (success) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      alert("Failed to delete item from database!");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setWinner(null);
  };

  const deleteWinnerAndClose = async () => {
    if (winner) {
      await deleteItem(winner.id);
    }
    closeModal();
  };

  const handleDeleteAll = async () => {
    if (items.length === 0) {
      alert("No items to delete!");
      return;
    }
    if (confirm("Are you sure you want to delete all items?")) {
      const success = await deleteAllLotteryItems();
      if (success) {
        setItems([]);
      } else {
        alert("Failed to delete items from database!");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        paddingRight: "300px", // Account for sidebar
        position: "relative",
        background: "#ccf137",
      }}
    >
      <audio ref={spinSoundRef} src="/sounds/spin.mp3" />
      <audio ref={winSoundRef} src="/sounds/win.mp3" />

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <p style={{ color: "#fff", fontSize: "24px" }}>Loading...</p>
        </div>
      )}

      {/* Buttons - Bottom Left */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 100,
        }}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          ref={fileInputRef}
          onChange={handleImportExcel}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: "#6C5CE7",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Import from Excel
        </button>
        <button
          onClick={handleDeleteAll}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: "#D63031",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Delete All
        </button>
        <button
          onClick={() => setShowTimerModal(true)}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: "#00B894",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Set Timer
        </button>
      </div>

      <CanvasSpinnerWheel
        items={items}
        onSpinComplete={handleSpinComplete}
        onButtonClick={handleButtonClick}
        autoSpinTrigger={spinTrigger}
        size={wheelSize}
        duration={5000}
      />

      {/* Participants Sidebar - Right */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "280px",
          height: "100vh",
          backgroundColor: "#1a1a2e",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          boxShadow: "-5px 0 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #333",
          }}
        >
          <h3
            style={{
              margin: "0 0 5px 0",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Participants
          </h3>
          <p
            style={{
              margin: 0,
              color: "#ccf137",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Total: {items.length}
          </p>
        </div>

        {/* Search Box */}
        <div style={{ padding: "15px 20px" }}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 15px",
              fontSize: "14px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#2d2d44",
              color: "#fff",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        </div>

        {/* List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 10px 20px 10px",
          }}
        >
          {items
            .filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  marginBottom: "6px",
                  backgroundColor: "#2d2d44",
                  borderRadius: "8px",
                  borderLeft: `4px solid ${item.color}`,
                }}
              >
                <span
                  style={{
                    color: "#888",
                    fontSize: "12px",
                    marginRight: "10px",
                    minWidth: "30px",
                  }}
                >
                  #{index + 1}
                </span>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p
                    style={{
                      margin: 0,
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: "500",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.label}
                  </p>
                  {item.ticketCode && (
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        color: "#888",
                        fontSize: "11px",
                      }}
                    >
                      {item.ticketCode}
                    </p>
                  )}
                </div>
              </div>
            ))}
          {items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()),
          ).length === 0 && (
            <p
              style={{
                color: "#666",
                textAlign: "center",
                padding: "20px",
                fontSize: "14px",
              }}
            >
              {searchQuery ? "No results found" : "No participants yet"}
            </p>
          )}
        </div>
      </div>

      {/* Item list with delete buttons */}
      {/* <div style={{ marginTop: "20px" }}>
        <h3>Items on wheel:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                margin: "5px 10px",
                padding: "8px 12px",
                backgroundColor: item.color,
                borderRadius: "20px",
                color: "#fff",
              }}
            >
              {item.label}
              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  marginLeft: "10px",
                  background: "rgba(0,0,0,0.3)",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div> */}

      {/* Winner Modal */}
      {showModal && winner && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            padding: "20px",
            boxSizing: "border-box",
            overflow: "visible",
          }}
        >
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={300}
          />
          {/* Modal Card with Megaphone */}
          <div
            style={{
              // position: "relative",
              maxWidth: "500px",
              width: "90%",
              overflow: "visible",
            }}
          >
            <img
              src="/assets/mega.png"
              alt="Megaphone"
              style={{
                position: "absolute",
                top: "5%",
                left: "23%",
                width: "40%",
                height: "auto",
                transform: "rotate(0deg)",
                zIndex: 2,
              }}
            />
            <div
              style={{
                backgroundColor: "#b94220",
                padding: "clamp(40px, 6vw, 60px) clamp(30px, 5vw, 50px)",
                borderRadius: "30px",
                textAlign: "center",
                boxSizing: "border-box",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: "clamp(2.5rem, 8vw, 4rem)",
                  fontWeight: "bold",
                  color: "#fff",
                  textTransform: "uppercase",
                  margin: "0 0 10px 0",
                  fontStyle: "italic",
                  zIndex: 10
                }}
              >
                Selamat
              </h2>
              <p
                style={{
                  fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                  color: "#fff",
                  textTransform: "uppercase",
                  margin: "0 0 30px 0",
                }}
              >
                Kepada:
              </p>
              <p
                style={{
                  fontSize: "clamp(1.5rem, 5vw, 2rem)",
                  fontWeight: "bold",
                  color: "#fff",
                  textTransform: "uppercase",
                  margin: "0 0 20px 0",
                }}
              >
                {winner.label}
              </p>
              {/* White line separator */}
              <div
                style={{
                  height: "2px",
                  backgroundColor: "#fff",
                  margin: "0 auto 20px",
                  width: "80%",
                }}
              />
              <p
                style={{
                  fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                  fontWeight: "300",
                  color: "#fff",
                  textTransform: "uppercase",
                  margin: "0",
                }}
              >
                No Kode: {winner.ticketCode}
              </p>
            </div>
          </div>

          {/* Next Button - Outside the card */}
          <button
            onClick={deleteWinnerAndClose}
            style={{
              marginTop: "30px",
              padding: "15px 50px",
              fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
              fontWeight: "bold",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Timer Input Panel - Slide from Left */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: showTimerModal ? 0 : "-100%",
          width: "min(350px, 100vw)",
          height: "100vh",
          backgroundColor: "#ccf137",
          padding: "40px 20px",
          boxShadow: showTimerModal ? "5px 0 30px rgba(0,0,0,0.5)" : "none",
          transition: "left 0.4s ease-in-out",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            margin: "0 0 30px",
            color: "#fff",
            textAlign: "center",
            fontSize: "clamp(20px, 5vw, 28px)",
          }}
        >
          Set Timer
        </h2>
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#000",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              Hours
            </label>
            <input
              type="number"
              min="0"
              max="23"
              value={timerHours}
              onChange={(e) =>
                setTimerHours(Math.max(0, parseInt(e.target.value) || 0))
              }
              style={{
                width: "60px",
                padding: "12px",
                fontSize: "20px",
                textAlign: "center",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#2d2d44",
                color: "#fff",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#000",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              Minutes
            </label>
            <input
              type="number"
              min="0"
              max="59"
              value={timerMinutes}
              onChange={(e) =>
                setTimerMinutes(
                  Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
                )
              }
              style={{
                width: "60px",
                padding: "12px",
                fontSize: "20px",
                textAlign: "center",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#2d2d44",
                color: "#fff",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#000",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              Seconds
            </label>
            <input
              type="number"
              min="0"
              max="59"
              value={timerSeconds}
              onChange={(e) =>
                setTimerSeconds(
                  Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
                )
              }
              style={{
                width: "60px",
                padding: "12px",
                fontSize: "20px",
                textAlign: "center",
                border: "none",
                borderRadius: "10px",
                backgroundColor: "#2d2d44",
                color: "#fff",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={startTimer}
            style={{
              padding: "15px 24px",
              fontSize: "16px",
              backgroundColor: "#00B894",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Start Timer
          </button>
          <button
            onClick={() => setShowTimerModal(false)}
            style={{
              padding: "15px 24px",
              fontSize: "14px",
              backgroundColor: "black",
              color: "#fff",
              border: "2px solid #444",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      {/* Overlay when timer panel is open */}
      {showTimerModal && (
        <div
          onClick={() => setShowTimerModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* Fullscreen Countdown */}
      {isCountingDown && (
        <CountdownScreen
          remainingSeconds={remainingSeconds}
          totalItems={items.length}
          onCancel={cancelTimer}
        />
      )}

      {/* Reveal Animation */}
      {isRevealing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 3000,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {/* Left curtain */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "50%",
              height: "100%",
              backgroundColor: "#ccf137",
              animation: "slideLeft 1.2s ease-in-out forwards",
            }}
          />
          {/* Right curtain */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "50%",
              height: "100%",
              backgroundColor: "#ccf137",
              animation: "slideRight 1.2s ease-in-out forwards",
            }}
          />
          <style jsx>{`
            @keyframes slideLeft {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            @keyframes slideRight {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
