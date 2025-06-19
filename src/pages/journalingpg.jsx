import { ReactSketchCanvas } from "react-sketch-canvas";
import { useCallback, useEffect, useState, useRef } from "react";
import { Rnd } from "react-rnd";
import "../css/journalingpg.css";
import Navbar from "./navbar";
import Footer from "./footerpg";
import supabase from "./supabaseClient";


const stickers = ["/stickers/star.png"];
const JournalPreviewGrid = ({ journals, loadJournalForEdit, deleteJournal }) => {
  // Store refs for multiple canvases, keyed by journal id
  const canvasRefs = useRef({});

  useEffect(() => {
    journals.forEach((journal) => {
      const ref = canvasRefs.current[journal.id];
      if (ref && journal.entry?.drawings) {
        ref.clearCanvas();
        ref.loadPaths(journal.entry.drawings);
      }
    });
  }, [journals]);

  return (
    <div className="journal-preview-container" style={{ marginTop: "30px" }}>
      <h2>Saved Journals</h2>
      <div className="journal-grid">
        {journals.length === 0 ? (
          <p>No journals found.</p>
        ) : (
          journals.map((journal) => (
            <div key={journal.id} className="journal-preview">
              <div
                className="canvas-wrapper"
                
              >
                <ReactSketchCanvas
                  ref={(el) => {
                    if (el) {
                      canvasRefs.current[journal.id] = el;
                    }
                  }}
                  strokeColor="#000"
                  strokeWidth={3}
                  canvasColor="#fff"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                />
                {journal.entry?.stickers?.map((s) => (
                  <Rnd
                    key={s.id}
                    default={{ x: s.x, y: s.y, width: s.width, height: s.height }}
                    bounds="parent"
                    disableDragging
                    enableResizing={false}
                    style={{ zIndex: 2 }}
                  >
                    <img
                      src={s.src}
                      alt="sticker"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        pointerEvents: "none",
                      }}
                    />
                  </Rnd>
                ))}
                {journal.entry?.textBoxes?.map((t) => (
                  <Rnd
                    key={t.id}
                    default={{ x: t.x, y: t.y, width: t.width, height: t.height }}
                    bounds="parent"
                    disableDragging
                    enableResizing={false}
                    style={{ zIndex: 2 }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        padding: "4px",
                        backgroundColor: "#fff",
                        overflow: "hidden",
                        fontSize: "14px",
                        border: "1px solid #ccc",
                      }}
                    >
                      {t.text}
                    </div>
                  </Rnd>
                ))}
              </div>

              <div className="journal-actions">
                <button className="journal-edit" onClick={() => loadJournalForEdit(journal)}>Edit</button>
                <button className="journal-delete" onClick={() => deleteJournal(journal.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


const JournalEditor = () => {
  const canvasRef = useRef(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [eraserWidth, setEraserWidth] = useState(10);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [canvasColor, setCanvasColor] = useState("#ffffff");
  const [bgImage, setBgImage] = useState(null);
  const [placedStickers, setPlacedStickers] = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);
  const [user, setUser] = useState(null);
  const [journals, setJournals] = useState([]);
const [editingJournalId, setEditingJournalId] = useState(null);

  // Fetch authenticated user on mount
useEffect(() => {
  const fetchUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      alert("Error fetching user");
      return;
    }
    setUser(user);
  };

  fetchUser();
}, []);

// Save or update journal entry
const handleSaveCanvas = async () => {
  if (!user) {
    alert("User not loaded yet");
    return;
  }

  try {
    const drawingPaths = await canvasRef.current.exportPaths();

    const journalEntry = {
      drawings: drawingPaths,
      stickers: placedStickers,
      textBoxes: textBoxes,
    };

    let response;
    if (editingJournalId) {
      // Update existing journal
      response = await supabase
        .from("journaling")
        .update({
          entry: journalEntry,
          updated_at: new Date(),
        })
        .eq("id", editingJournalId)
        .select();
    } else {
      // Insert new journal
      response = await supabase
        .from("journaling")
        .insert([
          {
            user_id: user.id,
            entry: journalEntry,
            created_at: new Date(),
          },
        ])
        .select();
    }

    const { error } = response;
    if (error) {
      console.error("Supabase save error:", error);
      alert("Failed to save journal: " + error.message);
      return;
    }

    alert(editingJournalId ? "Journal updated!" : "Journal saved!");
    setEditingJournalId(null);
    fetchJournals();
  } catch (error) {
    console.error("Unexpected error saving journal:", error);
    alert("Failed to save journal due to unexpected error.");
  }
};

// Fetch all journals for the current user
const fetchJournals = useCallback(async () => {
  if (!user) return;

  const { data, error } = await supabase
    .from("journaling")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching journals:", error);
    return;
  }

  setJournals(data);
}, [user]);
  
useEffect(() => {
  if (user) fetchJournals();
}, [user, fetchJournals]); 

//////


// Load a journal into the editor for editing
const loadJournalForEdit = (journal) => {
  if (!journal?.entry) return;

  canvasRef.current.clearCanvas();
  canvasRef.current.loadPaths(journal.entry.drawings || []);
  setPlacedStickers(journal.entry.stickers || []);
  setTextBoxes(journal.entry.textBoxes || []);
  setEditingJournalId(journal.id);
};

// Delete a journal entry by ID
const deleteJournal = async (id) => {
  if (window.confirm("Are you sure you want to delete this journal?")) {
    const { error } = await supabase.from("journaling").delete().eq("id", id);
    if (error) {
      alert("Failed to delete journal: " + error.message);
      return;
    }
    alert("Journal deleted");
    fetchJournals();
  }
};

  
  

  // Toggle pen mode
  const handlePenClick = () => {
    setEraseMode(false);
    canvasRef.current?.eraseMode(false);
  };

  // Toggle eraser mode
  const handleEraserClick = () => {
    setEraseMode(true);
    canvasRef.current?.eraseMode(true);
  };

  // Upload background image
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBgImage(reader.result);
    reader.readAsDataURL(file);
  };

  // Add new sticker at default position & size
  const addSticker = (src) => {
    setPlacedStickers((prev) => [
      ...prev,
      {
        id: Date.now(),
        src,
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      },
    ]);
  };

  // Add new text box at default position & size
  const addTextBox = () => {
    setTextBoxes((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "Write here...",
        x: 100,
        y: 100,
        width: 200,
        height: 100,
      },
    ]);
  };


  return (
    <div className="page-container">
      <Navbar />
      <div className="editor-container">
        {/* Sticker selection panel */}
        <div className="sticker-panel">
          <h2>Stickers</h2>
          <div className="sticker-scroll">
            {stickers.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="sticker"
                className="sticker-thumb"
                onClick={() => addSticker(src)}
                style={{ cursor: "pointer", margin: "5px" }}
              />
            ))}
          </div>
        </div>

        {/* Main editor and tools */}
        <div className="journal-container" >
          <h1>Tools</h1>
          <div className="tools-container">
            <div className="picker">
              <label>Stroke Color</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                disabled={eraseMode}
              />
              <label>Canvas Color</label>
              <input
                type="color"
                value={canvasColor}
                onChange={(e) => setCanvasColor(e.target.value)}
              />
              <label>Background Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="tools">
              <button disabled={!eraseMode} onClick={handlePenClick}>
                Pen
              </button>
              <button disabled={eraseMode} onClick={handleEraserClick}>
                Eraser
              </button>
              <button onClick={() => canvasRef.current?.undo()}>Undo</button>
              <button onClick={() => canvasRef.current?.redo()}>Redo</button>
              <button onClick={() => canvasRef.current?.clearCanvas()}>Clear</button>
              <button onClick={addTextBox}>Add Text</button>
            </div>

            <div className="sizing">
              <label>Stroke Width</label>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(+e.target.value)}
                disabled={eraseMode}
              />
              <label>Eraser Width</label>
              <input
                type="range"
                min="1"
                max="20"
                value={eraserWidth}
                onChange={(e) => setEraserWidth(+e.target.value)}
                disabled={!eraseMode}
              />
            </div>
          </div>

          {/* Canvas and overlays container */}
          <div className="canvas-wrapper" style={{  border: "1px solid #ccc" }}>
            <ReactSketchCanvas
              ref={canvasRef}
              strokeColor={strokeColor}
              canvasColor={canvasColor}
              strokeWidth={strokeWidth}
              eraserWidth={eraserWidth}
              backgroundImage={bgImage}
              preserveBackgroundImageAspectRatio="xMidYMid"
              style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, zIndex: 1 }}
            />

            {/* Stickers draggable and resizable */}
            {placedStickers.map((s) => (
              <Rnd
                key={s.id}
                default={{ x: s.x, y: s.y, width: s.width, height: s.height }}
                onDragStop={(e, d) =>
                  setPlacedStickers((prev) =>
                    prev.map((p) => (p.id === s.id ? { ...p, x: d.x, y: d.y } : p))
                  )
                }
                onResizeStop={(e, dir, ref, delta, pos) =>
                  setPlacedStickers((prev) =>
                    prev.map((p) =>
                      p.id === s.id
                        ? {
                            ...p,
                            width: parseInt(ref.style.width, 10),
                            height: parseInt(ref.style.height, 10),
                            x: pos.x,
                            y: pos.y,
                          }
                        : p
                    )
                  )
                }
                bounds="parent"
                style={{ zIndex: 2 }}
                lockAspectRatio
              >
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <img
                    src={s.src}
                    alt="sticker"
                    style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
                  />
                  <button
                    className="delete-btn"
                    onClick={() =>
                      setPlacedStickers((prev) => prev.filter((p) => p.id !== s.id))
                    }
                    
                    aria-label="Delete sticker"
                  >
                    ×
                  </button>
                </div>
              </Rnd>
            ))}

            {/* Text boxes draggable and resizable */}
            {textBoxes.map((t) => (
              <Rnd
                key={t.id}
                default={{ x: t.x, y: t.y, width: t.width, height: t.height }}
                onDragStop={(e, d) =>
                  setTextBoxes((prev) =>
                    prev.map((b) => (b.id === t.id ? { ...b, x: d.x, y: d.y } : b))
                  )
                }
                onResizeStop={(e, dir, ref, delta, pos) =>
                  setTextBoxes((prev) =>
                    prev.map((b) =>
                      b.id === t.id
                        ? {
                            ...b,
                            width: parseInt(ref.style.width, 10),
                            height: parseInt(ref.style.height, 10),
                            x: pos.x,
                            y: pos.y,
                          }
                        : b
                    )
                  )
                }
                bounds="parent"
                style={{ zIndex: 2 }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <textarea
                    value={t.text}
                    onChange={(e) => {
                      const text = e.target.value;
                      setTextBoxes((prev) =>
                        prev.map((b) => (b.id === t.id ? { ...b, text } : b))
                      );
                    }}
                    
                  />
                  <button
                    className="delete-btn"
                    onClick={() =>
                      setTextBoxes((prev) => prev.filter((b) => b.id !== t.id))
                    }
                    
                    aria-label="Delete text box"
                  >
                    ×
                  </button>
                </div>
              </Rnd>
            ))}
          </div>

          {/* Save button */}
          <div className="save-btn-container" style={{ marginTop: "15px" }}>
            <button onClick={handleSaveCanvas} className="save-button">Save Journal
            </button>
          </div>

          {/* journal preview  */}
          <JournalPreviewGrid 
            journals={journals} 
            loadJournalForEdit={loadJournalForEdit} 
            deleteJournal={deleteJournal} 
          /> 
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JournalEditor;
