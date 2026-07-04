const fs = require('fs');
let code = fs.readFileSync('app/admin/master-data/page.js', 'utf8');

// 1. Change daftar_matkul to mata_kuliah
code = code.replace(/paket\.daftar_matkul/g, 'paket.mata_kuliah');

// 2. Add selectedCPMK state
code = code.replace(/const \[selectedMatkul, setSelectedMatkul\] = useState\(null\);/g, 'const [selectedMatkul, setSelectedMatkul] = useState(null);\n  const [selectedCPMK, setSelectedCPMK] = useState(null);\n  const [showIndikatorModal, setShowIndikatorModal] = useState(false);\n  const [indikatorText, setIndikatorText] = useState("");');

// 3. Replace the UI rendering for CPMK
const oldUIRegex = /<div className="flex-1 space-y-3">[\s\S]*?<\/div>/;

const newUI = `<div className="flex-1 space-y-4">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Daftar CPMK & Indikator Harian:</p>
                      {!mk.cpmk || mk.cpmk.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">Belum ada CPMK</p>
                      ) : (
                        mk.cpmk.map((c, i) => (
                          <div key={c._id || i} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-300 dark:border-slate-600 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">C{i+1}</div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-800 dark:text-slate-100 font-bold leading-snug">{c.nama_cpmk}</p>
                              </div>
                              <button 
                                onClick={() => { setSelectedCPMK({ paketId: mk.paketId, matkulId: mk.matkulId, cpmkId: c._id, nama_cpmk: c.nama_cpmk }); setShowIndikatorModal(true); }}
                                className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900 border border-slate-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md transition-colors"
                              >
                                + Indikator
                              </button>
                            </div>
                            
                            {/* Indikator List */}
                            <div className="pl-9 space-y-2">
                              {!c.indikator || c.indikator.length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">Belum ada indikator kegiatan harian.</p>
                              ) : (
                                c.indikator.map((ind, j) => (
                                  <div key={j} className="flex items-start gap-2 border-l-2 border-indigo-200 dark:border-indigo-800 pl-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 mt-1.5 shrink-0" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{ind}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>`;

code = code.replace(oldUIRegex, newUI);

fs.writeFileSync('app/admin/master-data/page.js', code);
console.log('UI Master Data updated');
