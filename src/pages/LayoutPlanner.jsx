// LayoutPlanner.jsx – finale Version mit persistenter Zwischenablage
import { useEffect, useState } from 'react';
import styles from './LayoutPlanner.module.css';
import { useTranslation } from "react-i18next";
import ObjectCatalogPopup from '../components/ObjectCatalogPopup';

export default function LayoutPlanner() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [layoutName, setLayoutName] = useState('');

  const [objects, setObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [layoutStates, setLayoutStates] = useState({});
  const [hoverCell, setHoverCell] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [selectedSavedLayout, setSelectedSavedLayout] = useState('');

  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const forceEnglish = localStorage.getItem("forceEnglishObjectNames") === "true";
  const cellSize = 32;

  const [showPopup, setShowPopup] = useState(false);
  const [popupCoords, setPopupCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.button === 1) {
        e.preventDefault();
  
        const popupWidth = 400;
        const popupHeight = 400;
  
        const x = Math.min(e.clientX, window.innerWidth - popupWidth - 10);
        const y = Math.min(e.clientY, window.innerHeight - popupHeight - 10);
  
        setPopupCoords({ x, y });
        setShowPopup(true);
      }
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const cloneLayout = (layout) => JSON.parse(JSON.stringify(layout));
  const replacePlacedObjects = (newList, recordHistory = true) => {
    const current = layoutStates[currentLayoutKey] || [];
    if (recordHistory) {
      setUndoStack(prev => [...prev, cloneLayout(current)]);
      setRedoStack([]);
    }
    setLayoutStates(prev => ({ ...prev, [currentLayoutKey]: newList }));
  };

  function handleUndo() {
    const current = layoutStates[currentLayoutKey] || [];
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, cloneLayout(current)]);
    replacePlacedObjects(previous, false);
  }

  function handleRedo() {
    const current = layoutStates[currentLayoutKey] || [];
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, cloneLayout(current)]);
    replacePlacedObjects(next, false);
  }

  function handleResetLayout() {
    const confirmReset = window.confirm(`❗ ${t("resetmsg")}`);
    if (!confirmReset) return;
  
    replacePlacedObjects([], true); // leeres Layout, neue Undo-Stufe
  }

  useEffect(() => {
    window.api.readJsonFile('buildings.json').then(setBuildings).catch(console.error);
    window.api.readJsonFile('objects.json').then(setObjects).catch(console.error);
    window.api.listLayouts().then(setSavedLayouts).catch(console.error);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'r' || e.key === 'R') && selectedObjectId) {
        setRotation((prev) => (prev + 90) % 360);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId]);

  const getLayoutKey = (buildingId, floorIndex) => `${buildingId}-${floorIndex}`;
  const building = buildings[selectedBuildingIndex];
  const floor = building?.floors?.[currentFloor];
  const grid = floor?.grid;
  const currentLayoutKey = building ? getLayoutKey(building.id, currentFloor) : '';
  const placedObjects = layoutStates[currentLayoutKey] || [];
  

  const getLocalizedText = (obj, field) => {
    const value = obj[field];
    if (typeof value === 'object') {
      if (forceEnglish && field === 'name') {
        return value['en'] || '???';
      }
      return value[currentLang] || value['en'] || '???';
    }
    return value;
  };
  

  const sortedObjects = [...objects].sort((a, b) =>
    getLocalizedText(a, "name").localeCompare(getLocalizedText(b, "name"))
  );

  const selectedObjectBase = objects.find(o => o.id === selectedObjectId);
  const selectedObject = selectedObjectBase
    ? rotation % 180 === 0
      ? selectedObjectBase
      : { ...selectedObjectBase, width: selectedObjectBase.height, height: selectedObjectBase.width }
    : null;

  const handlePlace = (row, col) => {
    if (!selectedObject || !canPlaceObject(row, col, selectedObject)) return;
    const newObj = {
      ...selectedObject,
      pos: { row, col },
      buildingId: building.id,
      floorIndex: currentFloor
    };
    replacePlacedObjects([...placedObjects, newObj]);
  };

  const isOccupied = (r, c) => placedObjects.some(o => {
    const { row, col } = o.pos;
    for (let dr = 0; dr < o.height; dr++) {
      for (let dc = 0; dc < o.width; dc++) {
        if (r === row + dr && c === col + dc) return true;
      }
    }
    return false;
  });

  const canPlaceObject = (row, col, obj) => {
    for (let dr = 0; dr < obj.height; dr++) {
      for (let dc = 0; dc < obj.width; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r >= grid.length || c >= grid[0].length || isOccupied(r, c) || ['wall', 'blocked'].includes(grid[r][c]?.type)) {
          return false;
        }
      }
    }
    return true;
  };

  const getObjectAt = (r, c) => placedObjects.find(o => {
    const { row, col } = o.pos;
    return r >= row && r < row + o.height && c >= col && c < col + o.width;
  });

  const handleStoreLayout = async () => {
    const layoutData = {
      layoutName,
      buildingId: building.id,
      floorIndex: currentFloor,
      objects: placedObjects
    };
    const filename = layoutName.trim().replace(/[^a-z0-9_\-]/gi, '_').toLowerCase() || 'unnamed';
    try {
      await window.api.writeJsonFile(`layouts/${filename}.json`, layoutData);
      alert("✅ Layout gespeichert!");
    } catch (err) {
      console.error(err);
      alert("❌ Layout konnte nicht gespeichert werden.");
    }
  };

  const handleSaveLayout = async () => {
    const layoutData = {
      layoutName,
      buildingId: building.id,
      floorIndex: currentFloor,
      objects: placedObjects
    };
    const filePath = await window.api.showSaveDialog(`layout_${building.name}.json`);
    if (filePath) {
      await window.api.writeFile(filePath, JSON.stringify(layoutData, null, 2));
      alert("✅ Layout exportiert!");
    }
  };

  const handleLoadLayout = async () => {
    const filePath = await window.api.showOpenDialog('json');
    if (!filePath) return;
    try {
      const raw = await window.api.readFile(filePath);
      const data = JSON.parse(raw);
      const bIdx = buildings.findIndex(b => b.id === data.buildingId);
      if (bIdx === -1) return alert("❌ Gebäude nicht gefunden");
      setSelectedBuildingIndex(bIdx);
      setCurrentFloor(data.floorIndex ?? 0);
      setLayoutStates(prev => ({ ...prev, [getLayoutKey(data.buildingId, data.floorIndex ?? 0)]: data.objects ?? [] }));
      setLayoutName(data.layoutName ?? '');
    } catch (err) {
      console.error(err);
      alert("❌ Layout konnte nicht geladen werden.");
    }
  };

  const handleLoadSavedLayout = async (name) => {
    if (!name) return;
    try {
      const data = await window.api.readLayoutFile(name);
      const bIdx = buildings.findIndex(b => b.id === data.buildingId);
      if (bIdx === -1) return alert("❌ Gebäude nicht gefunden");
      setSelectedBuildingIndex(bIdx);
      setCurrentFloor(data.floorIndex ?? 0);
      setLayoutStates(prev => ({ ...prev, [getLayoutKey(data.buildingId, data.floorIndex ?? 0)]: data.objects ?? [] }));
      setLayoutName(data.layoutName ?? name);
    } catch (err) {
      console.error(err);
      alert("❌ Fehler beim Laden");
    }
  };

  if (!building || !floor || buildings.length === 0 || objects.length === 0) return <div>{t("load")}</div>;

  return (
    <div className={styles.container}>
      {/* Toolbar: Reihe 1 */}
      <div className={styles.toolbar}>
        <label>{t("building")}</label>
        <select className={styles.input} value={selectedBuildingIndex} onChange={e => {
          setSelectedBuildingIndex(parseInt(e.target.value));
          setCurrentFloor(0);
        }}>
          {buildings.map((b, i) => <option key={b.id} value={i}>{b.name}</option>)}
        </select>

        <label>{t("floor")}</label>
        <select className={styles.input} value={currentFloor} onChange={e => setCurrentFloor(parseInt(e.target.value))}>
          {building.floors.map((f, i) => <option key={i} value={i}>{f.floorName}</option>)}
        </select>
      </div>

      {/* Toolbar: Reihe 2 */}
      <div className={styles.toolbar}>
      <input
            type="text"
            placeholder={t("layoutname")}
            value={layoutName}
            onChange={e => setLayoutName(e.target.value)}
            className={styles.input}
          />
        <button onClick={handleStoreLayout}>💾 {t("layoutSave")}</button>
        <select className={styles.input} value={selectedSavedLayout} onChange={(e) => {
          const name = e.target.value;
          setSelectedSavedLayout(name);
          handleLoadSavedLayout(name);
        }}>
          <option value="">{t("loadSavedLayout")}</option>
          {savedLayouts.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        <button onClick={handleSaveLayout}>📤 {t("layoutExport")}</button>
        <button onClick={handleLoadLayout}>📂 {t("layoutLoad")}</button>
      </div>

      {/* Toolbar: Reihe 3 */}
      <div className={styles.toolbar}>

      <button onClick={() => {
          setPopupCoords({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 });
          setShowPopup(true);
        }}>📦 {t("openCatalog")}</button>
        
        <button onClick={() => setRotation((prev) => (prev + 90) % 360)}>🔄 {t("turn")}</button>

        <button onClick={handleUndo} disabled={undoStack.length === 0}>⬅️ {t("undo")}</button>
        <button onClick={handleRedo} disabled={redoStack.length === 0}>➡️ {t("redo")}</button>
        <button onClick={handleResetLayout}>🧹 {t("reset")}</button>

      </div>

      {/* Grid + Vorschau */}
      <div className={styles.gridWrapper} style={{ width: grid[0].length * cellSize, height: grid.length * cellSize }}>
        <div className={styles.gridBackground} style={{ gridTemplateColumns: `repeat(${grid[0].length}, ${cellSize}px)`, gridTemplateRows: `repeat(${grid.length}, ${cellSize}px)` }}>
          {grid.flatMap((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`${styles.cell} ${styles[cell.type] || ''}`}
                title={cell.type}
                onClick={() => handlePlace(rIdx, cIdx)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  const obj = getObjectAt(rIdx, cIdx);
                  if (obj) replacePlacedObjects(placedObjects.filter(o => o !== obj));
                }}
                onMouseEnter={() => setHoverCell({ row: rIdx, col: cIdx })}
                onMouseLeave={() => setHoverCell(null)}
              ></div>
            ))
          )}
        </div>

        <div className={styles.objectLayer}>
          {placedObjects.map((obj, i) => (
            <div
            key={`obj-${i}`}
            className={styles.objectBlock}
            style={{
              top: obj.pos.row * cellSize,
              left: obj.pos.col * cellSize,
              width: obj.width * cellSize,
              height: obj.height * cellSize,
              backgroundColor: obj.color
            }}
            title={getLocalizedText(obj, 'name')}
          >
            <span className={styles.objectLabel}>{getLocalizedText(obj, 'name')}</span>
          </div>
          ))}
          {hoverCell && selectedObject && canPlaceObject(hoverCell.row, hoverCell.col, selectedObject) && (
            <div className={`${styles.objectBlock} ${styles.previewObject}`} style={{ top: hoverCell.row * cellSize, left: hoverCell.col * cellSize, width: selectedObject.width * cellSize, height: selectedObject.height * cellSize, backgroundColor: selectedObject.color }}>
              {getLocalizedText(selectedObject, 'name')[0]}
            </div>
          )}
        </div>
      </div>
      
      {showPopup && (
    <ObjectCatalogPopup
      x={popupCoords.x}
      y={popupCoords.y}
      objects={objects}
      onSelect={(id) => {
        setSelectedObjectId(id);
        setShowPopup(false);
      }}
      onClose={() => setShowPopup(false)}
    />
  )}
    </div>
  );
}