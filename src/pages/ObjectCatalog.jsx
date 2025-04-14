import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import styles from './ObjectCatalog.module.css';

export default function ObjectCatalog() {
  const [objects, setObjects] = useState([]);
  const [form, setForm] = useState({
    id: '',
    name: {},
    description: {},
    width: 1,
    height: 1,
    color: '#cccccc'
  });
  const [editMode, setEditMode] = useState(false);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedObjectIds, setSelectedObjectIds] = useState([]);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    window.api.readJsonFile('objects.json')
      .then(setObjects)
      .catch(console.error);
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'width' || name === 'height') {
      setForm({ ...form, [name]: parseInt(value) });
    } else if (name === 'name' || name === 'description') {
      setForm({
        ...form,
        [name]: {
          ...form[name],
          [currentLang]: value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => {
    setForm({
      id: '',
      name: {},
      description: {},
      width: 1,
      height: 1,
      color: '#cccccc'
    });
    setEditMode(false);
  };

  const saveToFile = async (data) => {
    try {
      await window.api.writeJsonFile('objects.json', data);
      console.log("💾 Datei gespeichert!");
    } catch (err) {
      console.error("❌ Fehler beim Speichern:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let updatedList;
    if (editMode) {
      updatedList = objects.map((o) => (o.id === form.id ? form : o));
    } else {
      const newObj = {
        ...form,
        id: 'obj_' + Date.now()
      };
      updatedList = [...objects, newObj];
    }
    setObjects(updatedList);
    await saveToFile(updatedList);
    resetForm();
  };

  const handleEdit = (obj) => {
    setForm(obj);
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    const updated = objects.filter((o) => o.id !== id);
    setObjects(updated);
    await saveToFile(updated);
    if (form.id === id) resetForm();
  };

  const handleExportObjects = async () => {
    const dataToExport = objects.filter(obj => selectedObjectIds.includes(obj.id));
    const blob = JSON.stringify(dataToExport, null, 2);
    const filePath = await window.api.showSaveDialog("schedule1_objects_export.json");
    if (filePath) {
      await window.api.writeFile(filePath, blob);
      setExportDialogOpen(false);
      setSelectedObjectIds([]);
      alert("✅ Objekte exportiert!");
    }
  };

  const handleImportObjects = async () => {
    const filePath = await window.api.showOpenDialog('json');
    if (!filePath) return;

    try {
      const raw = await window.api.readFile(filePath);
      const imported = JSON.parse(raw);
      if (!Array.isArray(imported)) {
        alert("❌ Ungültiges Format – erwartet wurde ein Array.");
        return;
      }

      const merged = [...objects];
      for (const newObj of imported) {
        const index = merged.findIndex(o => o.id === newObj.id);
        if (index !== -1) {
          merged[index] = newObj;
        } else {
          merged.push(newObj);
        }
      }

      setObjects(merged);
      await saveToFile(merged);
      alert("✅ Objekte importiert!");
    } catch (err) {
      console.error("❌ Fehler beim Import:", err);
      alert("❌ Import fehlgeschlagen – siehe Konsole.");
    }
  };

  const getLocalizedText = (obj, field) => {
    const value = obj[field];
    if (typeof value === 'object') {
      return value[currentLang] || value['en'] || '???';
    }
    return value;
  };

  const filteredObjects = [...objects]
  .filter((obj) => getLocalizedText(obj, "name").toLowerCase().includes(filterText.toLowerCase()))
  .sort((a, b) => getLocalizedText(a, "name").localeCompare(getLocalizedText(b, "name")));

  return (
    <div className={styles.container}>
      <h2>Objekt-Katalog</h2>

      <div className={styles.toolbar}>
        <button className={styles.button} onClick={() => setExportDialogOpen(true)}>{t("objectsexportdo")}</button>
        <button className={styles.button} onClick={handleImportObjects}>{t("objectsimport")}</button>
      </div>

      {exportDialogOpen && (
        <div className={styles.exportDialog}>
          <h4>{t("objectsexport")}</h4>
          <ul>
            {objects.map((obj) => (
              <li key={obj.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedObjectIds.includes(obj.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedObjectIds([...selectedObjectIds, obj.id]);
                      } else {
                        setSelectedObjectIds(selectedObjectIds.filter(id => id !== obj.id));
                      }
                    }}
                  />
                  {getLocalizedText(obj, "name")}
                </label>
              </li>
            ))}
          </ul>
          <button className={styles.button} onClick={handleExportObjects}>{t("export")}</button>
          <button className={styles.button} onClick={() => setExportDialogOpen(false)}>{t("cancel")}</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="name"
          placeholder={t("objectForm.name") + ` (${currentLang.toUpperCase()})`}
          value={form.name?.[currentLang] || ""}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          name="description"
          placeholder={t("objectForm.description") + ` (${currentLang.toUpperCase()})`}
          value={form.description?.[currentLang] || ""}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="number"
          name="width"
          min="1"
          value={form.width}
          onChange={handleChange}
          required
          className={styles.input}
          placeholder={t("objectForm.width")}
        />
        <input
          type="number"
          name="height"
          min="1"
          value={form.height}
          onChange={handleChange}
          required
          className={styles.input}
          placeholder={t("objectForm.height")}
        />
        <input
          type="color"
          name="color"
          value={form.color}
          onChange={handleChange}
          title={t("objectForm.color")}
        />
        <button className={styles.button} type="submit">
          {editMode ? t("save") : t("add")}
        </button>
        {editMode && (
          <button className={styles.button} type="button" onClick={resetForm}>
            {t("cancel")}
          </button>
        )}
     </form>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder={t("objectForm.filter") || "🔍 Filter..."}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className={styles.input}
      />
      </form>

              <ul className={styles.objectList}>
          {filteredObjects.map((obj) => (
            <li key={obj.id} className={styles.objectItem}>
              <div>
                <strong>{getLocalizedText(obj, "name")}</strong> ({obj.width}x{obj.height}) –
                <span className={styles.objectColor} style={{ backgroundColor: obj.color }}>{obj.color}</span>
                <br />
                <em>{getLocalizedText(obj, "description")}</em>
              </div>
              <div>
                <button className={styles.button} onClick={() => handleEdit(obj)}>{t("edit")}</button>
                <button className={styles.button} onClick={() => handleDelete(obj.id)}>{t("delete")}</button>
              </div>
            </li>
          ))}
          </ul>
    </div>
  );
}