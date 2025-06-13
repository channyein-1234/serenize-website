import { ReactSketchCanvas } from "react-sketch-canvas";
import { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import "../css/journalingpg.css";
import Navbar from "./navbar";
import Footer from "./footerpg";
import supabase from "./supabaseClient"; 


const stickers = [
  "/stickers/star.png",
  "/stickers/heart.png",
  "/stickers/smile.png",
];

const JournalEditor = () => {
  const canvasRef = useRef(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(10);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [canvasColor, setCanvasColor] = useState("#ffffff");
  const [bgImage, setBgImage] = useState();
  const [preserveAspectRatio] = useState("xMidYMid");
  const [placedStickers, setPlacedStickers] = useState([]);
  const [journals, setJournals] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleEraserClick = () => {
    setEraseMode(true);
    canvasRef.current?.eraseMode(true);
  };

  const handlePenClick = () => {
    setEraseMode(false);
    canvasRef.current?.eraseMode(false);
  };

  const handleStrokeWidthChange = (e) => setStrokeWidth(+e.target.value);
  const handleEraserWidthChange = (e) => setEraserWidth(+e.target.value);
  const handleStrokeColorChange = (e) => setStrokeColor(e.target.value);
  const handleCanvasColorChange = (e) => setCanvasColor(e.target.value);

  const handleUndoClick = () => canvasRef.current?.undo();
  const handleRedoClick = () => canvasRef.current?.redo();
  const handleClearClick = () => canvasRef.current?.clearCanvas();

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBgImage(reader.result);
    reader.readAsDataURL(file);
  };

  const addSticker = (src) => {
    const newSticker = {
      id: Date.now(),
      src,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
    };
    setPlacedStickers((prev) => [...prev, newSticker]);
  };

  const fetchJournals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("journaling")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setJournals(data);
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSaveCanvas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login to save your journal");
  
    try {
      const drawing = await canvasRef.current.exportPaths();
      const payload = {
        user_id: user.id,
        drawing,
        bg_image: bgImage,
        stickers: placedStickers,
      };
  
      if (editingId) {
        await supabase.from("journaling").update(payload).eq("id", editingId);
        setEditingId(null);
      } else {
        await supabase.from("journaling").insert(payload);
      }
  
      fetchJournals();
    } catch (error) {
      console.error("Failed to export canvas paths:", error);
      alert("Draw something on the canvas before saving.");
    }
  };
  

  const deleteJournal = async (id) => {
    await supabase.from("journaling").delete().eq("id", id);
    fetchJournals();
  };

  const editJournal = (journal) => {
    setEditingId(journal.id);
    setBgImage(journal.bg_image);
    setPlacedStickers(journal.stickers || []);
    canvasRef.current.clearCanvas();
    canvasRef.current.loadPaths(journal.drawing || []);
  };

  return (
    <div>
      <Navbar />
      <div className="editor-container">
        <div className="sticker-panel">
          <h2>Stickers</h2>
          <div className="sticker-scroll">
            {stickers.map((src, index) => (
              <img key={index} src={src} alt="sticker" onClick={() => addSticker(src)} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h1>Tools</h1>
          <div className="tools-container">
            <div className="picker">
              <label>Stroke</label>
              <input type="color" value={strokeColor} onChange={handleStrokeColorChange} />
              <label>Canvas</label>
              <input type="color" value={canvasColor} onChange={handleCanvasColorChange} />
              <label>BG</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="tools">
              <button disabled={!eraseMode} onClick={handlePenClick}>Pen</button>
              <button disabled={eraseMode} onClick={handleEraserClick}>Eraser</button>
              <button onClick={handleUndoClick}>Undo</button>
              <button onClick={handleRedoClick}>Redo</button>
              <button onClick={handleClearClick}>Clear</button>
            </div>

            <div className="sizing">
              <label>Stroke Width</label>
              <input type="range" min="1" max="20" value={strokeWidth} disabled={eraseMode} onChange={handleStrokeWidthChange} />
              <label>Eraser Width</label>
              <input type="range" min="1" max="20" value={eraserWidth} disabled={!eraseMode} onChange={handleEraserWidthChange} />
            </div>
          </div>

          <h2 className="mt-4">Canvas</h2>
          <div className="canvas-wrapper">
            <ReactSketchCanvas
              ref={canvasRef}
              strokeColor={strokeColor}
              canvasColor={canvasColor}
              strokeWidth={strokeWidth}
              eraserWidth={eraserWidth}
              backgroundImage={bgImage}
              preserveBackgroundImageAspectRatio={preserveAspectRatio}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}
            />
            {placedStickers.map((sticker) => (
              <Rnd
                key={sticker.id}
                default={{ x: sticker.x, y: sticker.y, width: sticker.width, height: sticker.height }}
                bounds="parent"
                style={{ zIndex: 2 }}
              >
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <img src={sticker.src} alt="sticker" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  <button
                    onClick={() => setPlacedStickers((prev) => prev.filter((s) => s.id !== sticker.id))}
                    style={{
                      position: "absolute", top: -10, right: -10, backgroundColor: "red", color: "white",
                      border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer",
                      fontSize: 12, lineHeight: "20px", textAlign: "center", padding: 0,
                    }}
                    title="Delete"
                  >×</button>
                </div>
              </Rnd>
            ))}
          </div>

          <div className="save-btn-container">
            <button onClick={handleSaveCanvas} className="save-button">
              {editingId ? "Save Journal Changes" : "Save Journal"}
            </button>
          </div>

          <div className="journal-carousel">
            <h2>My Journals</h2>
            <div className="carousel-scroll">
              {journals.map((j) => (
                <div key={j.id} className="journal-card">
                  <img src={j.bg_image} alt="Journal" className="journal-thumb" />
                  <div className="card-actions">
                    <button onClick={() => editJournal(j)}>Edit</button>
                    <button onClick={() => deleteJournal(j.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JournalEditor;
