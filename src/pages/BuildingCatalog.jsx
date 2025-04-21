import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import styles from './BuildingCatalog.module.css';

const CELL_TYPES_BASE = [
  { key: 'floor', labelKey: 'cell.floor', color: '#3c593c' },
  { key: 'empty', labelKey: 'cell.empty', color: '#222' },
  { key: 'wall', labelKey: 'cell.wall', color: '#555' },
  { key: 'blocked', labelKey: 'cell.blocked', color: '#a33' },
  { key: 'water', labelKey: 'cell.water', color: '#3399cc' },
  { key: 'entrance', labelKey: 'cell.entrance', color: '#ffaa00' },
  { key: 'stairs-up', labelKey: 'cell.stairsUp', color: '#8bc34a' },
  { key: 'stairs-down', labelKey: 'cell.stairsDown', color: '#c2185b' },
  { key: 'marker', labelKey: 'cell.marker', color: '#999' }
];

export default function BuildingCatalog() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeTool, setActiveTool] = useState('floor');
  const [isPainting, setIsPainting] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 5 });
  const [markerEdit, setMarkerEdit] = useState(null);
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [buildingNameEdit, setBuildingNameEdit] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExports, setSelectedExports] = useState([]);

  const { t } = useTranslation();
  const CELL_TYPES = CELL_TYPES_BASE.map(cell => ({
    ...cell,
    label: t(cell.labelKey)
  }));

  useEffect(() => {
    window.api.readJsonFile('buildings.json')
      .then(setBuildings)
      .catch(console.error);
  }, []);

  const handleSave = async (updatedBuildings) => {
    setBuildings(updatedBuildings);
    try {
      await window.api.writeJsonFile('buildings.json', updatedBuildings);
      console.log("💾 Gebäude gespeichert!");
    } catch (err) {
      console.error("❌ Fehler beim Speichern:", err);
    }
  };

  const createGrid = (rows, cols, defaultType = 'floor') =>
    Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({ type: defaultType }))
    );

  const handleAddBuilding = () => {
    const newBuilding = {
      id: 'bld_' + Date.now(),
      name: buildingNameEdit || 'Neues Gebäude',
      floors: [{
        floorName: "EG",
        grid: createGrid(gridSize.rows, gridSize.cols)
      }]
    };
    const updated = [...buildings, newBuilding];
    handleSave(updated);
    setSelectedBuilding(newBuilding);
    setActiveFloorIndex(0);
    setBuildingNameEdit(newBuilding.name);
  };

  const handleDeleteBuilding = (buildingId) => {
    const updated = buildings.filter(b => b.id !== buildingId);
    handleSave(updated);
    if (selectedBuilding?.id === buildingId) {
      setSelectedBuilding(null);
    }
  };

  const handleAddFloor = () => {
    if (!selectedBuilding) return;
    const nextNumber = selectedBuilding.floors.length + 1;
    const newFloor = {
      floorName: `Etage ${nextNumber}`,
      grid: createGrid(gridSize.rows, gridSize.cols)
    };
    const updated = buildings.map(b =>
      b.id === selectedBuilding.id ? { ...b, floors: [...b.floors, newFloor] } : b
    );
    handleSave(updated);
    setSelectedBuilding({ ...selectedBuilding, floors: [...selectedBuilding.floors, newFloor] });
  };

  const resizeGrid = (floorIndex) => {
    if (!selectedBuilding) return;
    const newGrid = createGrid(gridSize.rows, gridSize.cols);
    const updatedFloors = [...selectedBuilding.floors];
    updatedFloors[floorIndex] = { ...updatedFloors[floorIndex], grid: newGrid };
    const updatedBuilding = { ...selectedBuilding, floors: updatedFloors };
    const updatedAll = buildings.map(b =>
      b.id === updatedBuilding.id ? updatedBuilding : b
    );
    handleSave(updatedAll);
    setSelectedBuilding(updatedBuilding);
  };

  const paintCell = (floorIndex, rowIndex, colIndex) => {
    const updatedFloors = [...selectedBuilding.floors];
    const newCell = activeTool === 'marker' ? { type: 'marker', label: '' } : { type: activeTool };
    updatedFloors[floorIndex].grid[rowIndex][colIndex] = newCell;
    const updatedBuilding = { ...selectedBuilding, floors: updatedFloors };
    const updatedAll = buildings.map(b =>
      b.id === updatedBuilding.id ? updatedBuilding : b
    );
    handleSave(updatedAll);
    setSelectedBuilding(updatedBuilding);
    if (activeTool === 'marker') {
      setMarkerEdit({ floorIndex, rowIndex, colIndex });
    }
  };

  const updateMarkerLabel = (text) => {
    const { floorIndex, rowIndex, colIndex } = markerEdit;
    const updatedFloors = [...selectedBuilding.floors];
    updatedFloors[floorIndex].grid[rowIndex][colIndex] = {
      type: 'marker',
      label: text
    };
    const updatedBuilding = { ...selectedBuilding, floors: updatedFloors };
    const updatedAll = buildings.map(b =>
      b.id === updatedBuilding.id ? updatedBuilding : b
    );
    handleSave(updatedAll);
    setSelectedBuilding(updatedBuilding);
  };

  const handleExport = async () => {
    if (!selectedExports.length) return;
    const dataToExport = buildings.filter(b => selectedExports.includes(b.id));
    const blob = JSON.stringify(dataToExport, null, 2);
    const filePath = await window.api.showSaveDialog("schedule1_buildings_export.json");
    if (filePath) {
      await window.API.writeFile(filePath, blob);
      setExportDialogOpen(false);
      setSelectedExports([]);
      alert("✅ Gebäude exportiert!");
    }
  };

  const handleImport = async () => {
    const filePath = await window.api.showOpenDialog('json');
    if (!filePath) return;

    try {
      const raw = await window.api.readFile(filePath);
      const imported = JSON.parse(raw);
      if (!Array.isArray(imported)) {
        alert("❌ Ungültiges Format – erwartet wurde ein Array.");
        return;
      }

      const merged = [...buildings];
      for (const newBld of imported) {
        const index = merged.findIndex(b => b.id === newBld.id);
        if (index !== -1) merged[index] = newBld;
        else merged.push(newBld);
      }

      handleSave(merged);
      alert("✅ Gebäude importiert!");
    } catch (err) {
      console.error("❌ Fehler beim Import:", err);
      alert("❌ Import fehlgeschlagen – siehe Konsole.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>{t("buildingCatalog")}</h2>

      {exportDialogOpen && (
        <div className={styles.exportDialog}>
          <h4>{t("buildingexport")}</h4>
          <ul>
            {buildings.map((b) => (
              <li key={b.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedExports.includes(b.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExports([...selectedExports, b.id]);
                      } else {
                        setSelectedExports(selectedExports.filter(id => id !== b.id));
                      }
                    }}
                  />
                  {b.name}
                </label>
              </li>
            ))}
          </ul>
          <button className={styles.button} onClick={handleExport}>{t("export")}</button>
          <button className={styles.button} onClick={() => setExportDialogOpen(false)}>{t("cancel")}</button>
        </div>
      )}

      <button className={styles.button} onClick={handleImport}>{t("buildingimport")}</button>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          value={buildingNameEdit}
          onChange={(e) => setBuildingNameEdit(e.target.value)}
          onBlur={() => {
            const updated = buildings.map(b =>
              b.id === selectedBuilding.id ? { ...b, name: buildingNameEdit } : b
            );
            handleSave(updated);
            setSelectedBuilding({ ...selectedBuilding, name: buildingNameEdit });
          }}
          placeholder="Gebäudename"
        />
        <select
          className={styles.select}
          value={activeFloorIndex}
          onChange={(e) => {
            const idx = parseInt(e.target.value);
            setActiveFloorIndex(idx);
            const grid = selectedBuilding?.floors?.[idx]?.grid;
            if (grid) {
              setGridSize({ rows: grid.length, cols: grid[0]?.length || 0 });
            }
          }}
        >
          {selectedBuilding?.floors?.map((f, i) => (
            <option key={i} value={i}>{f.floorName}</option>
          ))}
        </select>
        <select
          className={styles.select}
          value={activeTool}
          onChange={(e) => setActiveTool(e.target.value)}
        >
          {CELL_TYPES.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: '#aaa' }}>
            {t("rows")}:
            <input
              className={styles.input}
              type="number"
              value={gridSize.rows}
              onChange={(e) => setGridSize({ ...gridSize, rows: parseInt(e.target.value) })}
              style={{ width: '60px', marginLeft: '0.25rem' }}
            />
          </label>
          <label style={{ fontSize: '0.8rem', color: '#aaa' }}>
            {t("columns")}:
            <input
              className={styles.input}
              type="number"
              value={gridSize.cols}
              onChange={(e) => setGridSize({ ...gridSize, cols: parseInt(e.target.value) })}
              style={{ width: '60px', marginLeft: '0.25rem' }}
            />
          </label>
        </div>
        <button className={styles.button} onClick={handleAddBuilding}>{t("addBuilding")}</button>
        {selectedBuilding && (
          <>
            <button className={styles.button} onClick={() => resizeGrid(activeFloorIndex)}>{t("resizeGrid")}</button>
            <button className={styles.button} onClick={handleAddFloor}>{t("addFloor")}</button>
          </>
        )}
        <button className={styles.button} onClick={() => setExportDialogOpen(true)}>{t("buildingexportdo")}</button>
      </div>

      <div className={styles.legend}>
        {CELL_TYPES.map((type) => (
          <div key={type.key} className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: type.color }} />
            <span>{type.label}</span>
          </div>
        ))}
      </div>

      <ul>
        {buildings.map((b) => (
          <li key={b.id}>
            <strong>{b.name}</strong>
            <button className={styles.button} onClick={() => {
              setSelectedBuilding(b);
              setActiveFloorIndex(0);
              setBuildingNameEdit(b.name);
            }}>{t("edit")}</button>
            <button className={styles.button} onClick={() => handleDeleteBuilding(b.id)}>{t("delete")}</button>
          </li>
        ))}
      </ul>

      {selectedBuilding && selectedBuilding.floors.map((floor, fIdx) => (
        <div key={fIdx}>
          <input
            className={styles.input}
            value={floor.floorName}
            onChange={(e) => {
              const updatedFloors = [...selectedBuilding.floors];
              updatedFloors[fIdx].floorName = e.target.value;
              const updatedBuilding = { ...selectedBuilding, floors: updatedFloors };
              const updatedAll = buildings.map(b =>
                b.id === updatedBuilding.id ? updatedBuilding : b
              );
              handleSave(updatedAll);
              setSelectedBuilding(updatedBuilding);
            }}
          />
          <div
            className={styles.grid}
            style={{
              gridTemplateColumns: `repeat(${floor.grid[0].length}, 30px)`
            }}
            onMouseDown={() => setIsPainting(true)}
            onMouseUp={() => setIsPainting(false)}
            onMouseLeave={() => setIsPainting(false)}
          >
            {floor.grid.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={styles.cell}
                  style={{ backgroundColor: CELL_TYPES.find(t => t.key === cell.type)?.color || '#333' }}
                  onMouseEnter={() => isPainting && paintCell(fIdx, rIdx, cIdx)}
                  onClick={() => paintCell(fIdx, rIdx, cIdx)}
                  title={cell.type === 'marker' && cell.label ? cell.label : cell.type}
                >
                  {markerEdit &&
                    markerEdit.floorIndex === fIdx &&
                    markerEdit.rowIndex === rIdx &&
                    markerEdit.colIndex === cIdx ? (
                    <input
                      autoFocus
                      value={cell.label}
                      onChange={(e) => updateMarkerLabel(e.target.value)}
                      onBlur={() => setMarkerEdit(null)}
                      style={{ fontSize: '10px', width: '100%', height: '100%', border: 'none', textAlign: 'center' }}
                    />
                  ) : cell.type[0]}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
