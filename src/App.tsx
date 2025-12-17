import React, { useState, useEffect, useMemo } from "react";
import {
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Database,
  Plus,
  LayoutGrid,
  Save,
  X,
  BookOpen,
  Copy,
  Shirt,
  Tag,
  Calendar,
  Users,
  Palette,
  Box,
  Filter,
  Download,
  RefreshCw,
  Calculator,
  List,
  Trash2,
  Wifi,
  ChevronDown,
  Check,
  Edit2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// --- TYPES ---
interface ComboboxProps {
  label?: string;
  name: string;
  value: string | number;
  onChange: (e: any) => void;
  options: (string | number)[];
  placeholder?: string;
  icon?: React.ElementType;
  required?: boolean;
  disabled?: boolean;
}

interface TransactionData {
  tempId?: number | string;
  rowIndex?: number;
  year?: string;
  date: string;
  id: string;
  order: string;
  pantsCode: string;
  shirtCode: string;
  color: string;
  group: string;
  quantity: string | number;
  displayDate?: string;
}

interface MasterDataItem {
  type: string;
  value: string;
}

// --- CUSTOM ICONS ---
const PantsIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path
      d="M4 22V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v18l-6-4-2 1.5L10 18l-6 4z"
      style={{ display: "none" }}
    />
    <path d="M6 2L4 22h6v-8h4v8h6L18 2H6z" />
  </svg>
);

// --- COMPONENT: COMBOBOX ---
const Combobox = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  required,
  disabled,
}: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const filteredOptions = options.filter((opt) =>
    opt.toString().toLowerCase().includes(value.toString().toLowerCase())
  );
  const showOptions = value === "" ? options : filteredOptions;

  return (
    <div className="relative group">
      {label && (
        <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none z-10">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full ${
            Icon ? "pl-10" : "px-4"
          } pr-10 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm disabled:bg-slate-100 disabled:text-slate-400`}
        />
        <div className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none">
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && showOptions.length > 0 && (
          <ul className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 no-scrollbar">
            {showOptions.map((option, idx) => (
              <li
                key={idx}
                className="px-4 py-3 text-base text-slate-700 hover:bg-blue-50 active:bg-blue-100 cursor-pointer border-b border-slate-50 last:border-0 flex items-center justify-between"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange({ target: { name: name, value: option } });
                  setIsOpen(false);
                }}
              >
                <span>{option}</span>
                {value === option && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("input");
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [scriptUrl, setScriptUrl] = useState("");

  // Form Data
  const [formData, setFormData] = useState<TransactionData>({
    date: new Date().toISOString().split("T")[0],
    id: "",
    order: "",
    pantsCode: "",
    shirtCode: "",
    color: "",
    group: "",
    quantity: "",
  });

  // Data Management State
  const [localData, setLocalData] = useState<TransactionData[]>([]);
  const [fetchedData, setFetchedData] = useState<TransactionData[]>([]);
  const [masterData, setMasterData] = useState<MasterDataItem[]>([]);

  // Status
  const [isFetching, setIsFetching] = useState(false);
  const [syncStatus, setSyncStatus] = useState("ready");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Editing State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Config & Filter State
  const [configInput, setConfigInput] = useState({
    type: "pantsCode",
    value: "",
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [filterId, setFilterId] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [selectedYears, setSelectedYears] = useState([
    new Date().getFullYear().toString(),
  ]);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // --- HAM XOA BO LOC ---
  const clearFilters = () => {
    setFilterId("");
    setFilterCode("");
    setFilterGroup("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  // --- MÃ SCRIPT ---
  const googleScriptCode = `function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var params = e.parameter || {};
  
  if (e.postData) {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action || 'saveTransaction'; 

    if (action == 'saveTransaction') {
      var dateParts = postData.date.split('-'); 
      var year = dateParts[0]; 
      var formattedDate = "'" + dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
      
      var sheet = ss.getSheetByName(year);
      if (!sheet) {
        sheet = ss.insertSheet(year);
        sheet.appendRow(["Ngày nhập", "Mã", "Đơn", "Code Quần", "Code Áo", "Màu", "Nhóm", "SL"]);
      }
      sheet.appendRow([
        formattedDate, postData.id, postData.order, postData.pantsCode, 
        postData.shirtCode, postData.color, postData.group, postData.quantity
      ]);
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action == 'saveConfig') {
      var configSheet = ss.getSheetByName('DanhMuc');
      if (!configSheet) {
        configSheet = ss.insertSheet('DanhMuc');
        configSheet.appendRow(["Loại", "Giá trị"]);
      }
      configSheet.appendRow([postData.type, postData.value]);
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action == 'updateQuantity') {
      var sheet = ss.getSheetByName(postData.year);
      if (sheet) {
        sheet.getRange(postData.rowIndex, 8).setValue(postData.quantity);
        return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Sheet not found" })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (params.action == 'getMasterData') {
    var configSheet = ss.getSheetByName('DanhMuc');
    var data = [];
    if (configSheet) {
      var rows = configSheet.getDataRange().getValues();
      if (rows.length > 1) {
        rows.shift();
        data = rows.map(function(r) { return { type: r[0], value: r[1] }; });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  if (params.action == 'getData') {
    var years = params.years.split(',');
    var resultData = [];
    years.forEach(function(year) {
      var sheet = ss.getSheetByName(year);
      if (sheet) {
        var rows = sheet.getDataRange().getValues();
        for (var i = 1; i < rows.length; i++) {
          var r = rows[i];
          resultData.push({
            rowIndex: i + 1,
            year: year,
            date: r[0], id: r[1], order: r[2], 
            pantsCode: r[3], shirtCode: r[4], 
            color: r[5], group: r[6], quantity: r[7]
          });
        }
      }
    });
    return ContentService.createTextOutput(JSON.stringify(resultData)).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  // --- LOGIC ---
  const getSuggestions = (masterType: string | null) => {
    if (masterType)
      return masterData
        .filter((m) => m.type === masterType)
        .map((m) => m.value)
        .sort();
    return [];
  };

  const suggestions = useMemo(
    () => ({
      pantsCode: getSuggestions("pantsCode"),
      shirtCode: getSuggestions("shirtCode"),
      color: getSuggestions("color"),
      group: getSuggestions("group"),
    }),
    [masterData]
  );

  const parseDate = (dateStr: any) => {
    if (!dateStr) return null;
    const str = String(dateStr);
    if (str.includes("-")) return new Date(str);
    if (str.includes("/")) {
      const parts = str.split("/");
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return new Date(str);
  };

  const allDisplayData = [...localData, ...fetchedData].sort(
    (a: any, b: any) => b.tempId - a.tempId
  );

  const filteredData = allDisplayData.filter((item) => {
    const matchId = filterId
      ? String(item.id).toLowerCase().includes(filterId.toLowerCase())
      : true;
    const matchGroup = filterGroup
      ? String(item.group).toLowerCase().includes(filterGroup.toLowerCase())
      : true;
    const pCode = String(item.pantsCode || "").toLowerCase();
    const sCode = String(item.shirtCode || "").toLowerCase();
    const searchCode = filterCode.toLowerCase();
    const matchCode = filterCode
      ? pCode.includes(searchCode) || sCode.includes(searchCode)
      : true;

    let itemYear = item.year;
    if (!itemYear && item.date) {
      const dStr = String(item.date);
      if (dStr.includes("-")) itemYear = dStr.split("-")[0];
      else if (dStr.includes("/")) itemYear = dStr.split("/")[2];
    }
    const matchYear = selectedYears.includes(String(itemYear));

    let matchDateRange = true;
    if (filterStartDate || filterEndDate) {
      const itemDateObj = parseDate(item.date);
      if (itemDateObj) {
        itemDateObj.setHours(0, 0, 0, 0);
        if (filterStartDate) {
          const start = new Date(filterStartDate);
          start.setHours(0, 0, 0, 0);
          if (itemDateObj < start) matchDateRange = false;
        }
        if (filterEndDate && matchDateRange) {
          const end = new Date(filterEndDate);
          end.setHours(0, 0, 0, 0);
          if (itemDateObj > end) matchDateRange = false;
        }
      }
    }
    return matchId && matchGroup && matchCode && matchYear && matchDateRange;
  });

  const totalQuantity = filteredData.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterId,
    filterCode,
    filterGroup,
    filterStartDate,
    filterEndDate,
    selectedYears,
  ]);

  // --- EFFECTS & SYNC ---
  useEffect(() => {
    const scriptId = "tailwind-cdn-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
    const savedUrl = localStorage.getItem("google_script_url");
    if (savedUrl) {
      setScriptUrl(savedUrl);
      fetchMasterData(savedUrl);
    } else setShowGuide(true);
  }, []);

  useEffect(() => {
    let interval: any;
    if (scriptUrl) {
      if (fetchedData.length === 0) fetchData(true);
      interval = setInterval(() => fetchData(true), 30000);
    }
    return () => clearInterval(interval);
  }, [scriptUrl, selectedYears]);

  // --- API CALLS ---
  const fetchMasterData = async (url: string) => {
    if (!url) return;
    try {
      const res = await fetch(`${url}?action=getMasterData`);
      const data = await res.json();
      if (Array.isArray(data)) setMasterData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async (isAuto = false) => {
    if (!scriptUrl || selectedYears.length === 0) return;

    // Đánh dấu mốc thời gian bắt đầu tải
    const fetchStartTime = Date.now();

    if (!isAuto) {
      setIsFetching(true);
      setSyncStatus("syncing");
    }
    try {
      const url = `${scriptUrl}?action=getData&years=${selectedYears.join(
        ","
      )}`;
      const response = await fetch(url);
      const data = await response.json();
      const formattedData = data.map((d: any, index: number) => ({
        ...d,
        tempId: `server-${index}`,
      }));
      setFetchedData(formattedData);

      // FIX LỖI X2 DỮ LIỆU:
      // Xóa các dữ liệu tạm (Local) nếu chúng đã được nhập TRƯỚC khi quá trình tải bắt đầu.
      // Giữ lại các dữ liệu tạm MỚI nhập trong lúc đang tải (để không bị mất).
      setLocalData((prev) =>
        prev.filter((item) => {
          const itemTime = typeof item.tempId === "number" ? item.tempId : 0;
          return itemTime > fetchStartTime;
        })
      );

      await fetchMasterData(scriptUrl);
      if (!isAuto) {
        setSyncStatus("complete");
        setTimeout(() => setSyncStatus("ready"), 3000);
      }
    } catch (error) {
      if (!isAuto) {
        console.error(error);
        alert("Lỗi kết nối.");
        setSyncStatus("ready");
      }
    } finally {
      if (!isAuto) setIsFetching(false);
    }
  };

  // --- HANDLERS ---
  const handleSaveConfig = async (e: any) => {
    e.preventDefault();
    if (!configInput.value.trim() || !scriptUrl) return;
    setIsSavingConfig(true);
    try {
      await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "saveConfig",
          type: configInput.type,
          value: configInput.value.trim(),
        }),
      });
      setMasterData((prev) => [
        ...prev,
        { type: configInput.type, value: configInput.value.trim() },
      ]);
      setConfigInput((prev) => ({ ...prev, value: "" }));
    } catch (e) {
      alert("Lỗi khi lưu");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!scriptUrl) {
      setShowSettings(true);
      return;
    }
    setStatus("submitting");
    try {
      await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...formData, action: "saveTransaction" }),
      });
      setStatus("success");
      const year = formData.date.split("-")[0];
      // Thêm tempId là thời gian thực để phân biệt với dữ liệu Server
      const newRecord = {
        ...formData,
        year: year,
        tempId: Date.now(),
        displayDate: formData.date.split("-").reverse().join("/"),
      };
      setLocalData((prev) => [newRecord, ...prev]);
      setFormData((prev) => ({
        ...prev,
        id: "",
        order: "",
        pantsCode: "",
        shirtCode: "",
        quantity: "",
      }));
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setStatus("error");
      setErrorMessage("Lỗi kết nối.");
    }
  };

  const handleUpdateQuantity = async () => {
    if (!editingItem || !scriptUrl) return;
    if (!editingItem.rowIndex) {
      alert(
        "Dữ liệu này vừa nhập và chưa được đồng bộ từ Sheet về.\nVui lòng bấm nút 'Đồng bộ' trước khi sửa!"
      );
      setEditingItem(null);
      return;
    }
    setIsUpdating(true);
    try {
      await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateQuantity",
          year: editingItem.year,
          rowIndex: editingItem.rowIndex,
          quantity: editingItem.quantity,
        }),
      });
      setFetchedData((prev) =>
        prev.map((item) =>
          item.year === editingItem.year &&
          item.rowIndex === editingItem.rowIndex
            ? { ...item, quantity: editingItem.quantity }
            : item
        )
      );
      setEditingItem(null);
      alert("Đã gửi lệnh cập nhật số lượng!");
    } catch (error) {
      alert("Lỗi khi cập nhật.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUrlSave = (url: string) => {
    setScriptUrl(url);
    localStorage.setItem("google_script_url", url);
    setShowSettings(false);
    fetchMasterData(url);
  };
  const handleChange = (e: any) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const toggleYear = (year: string) =>
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã copy mã Script V4!");
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold leading-tight truncate whitespace-nowrap">
                QL Móc Pro
              </h1>
              <p className="text-xs text-slate-400 truncate hidden md:block">
                Hệ thống nhập kho
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className={`flex items-center gap-2 px-2 py-1.5 md:px-3 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium transition-all`}
            >
              {syncStatus === "syncing" && (
                <>
                  <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
                  <span className="text-yellow-100 hidden md:inline">
                    Syncing...
                  </span>
                </>
              )}
              {syncStatus === "complete" && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-100 hidden md:inline">Done</span>
                </>
              )}
              {syncStatus === "ready" && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300 hidden md:inline">Ready</span>
                </>
              )}
            </div>
            <div
              className={`flex items-center gap-2 px-2 py-1.5 md:px-3 rounded-full text-xs font-bold transition-all shadow-lg ${
                scriptUrl
                  ? "bg-green-600 text-white shadow-green-900/30"
                  : "bg-red-600 text-white animate-pulse"
              }`}
            >
              <Wifi className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {scriptUrl ? "Đã kết nối" : "Ngắt kết nối"}
              </span>
            </div>
            <button
              onClick={() => fetchData(false)}
              disabled={isFetching}
              className="flex items-center gap-2 px-2 py-1.5 md:px-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden md:inline">Đồng bộ</span>
            </button>
            <div className="h-6 w-px bg-slate-700 mx-0.5 md:mx-1"></div>
            <button
              onClick={() => setShowGuide(true)}
              className="p-1.5 md:p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Hướng dẫn"
            >
              <BookOpen className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 md:p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors relative"
              title="Cài đặt"
            >
              <Settings className="h-5 w-5" />
              {!scriptUrl && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("input")}
            className={`py-3 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "input"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500"
            }`}
          >
            <Plus className="h-4 w-4" />{" "}
            <span className="hidden xs:inline">Nhập Kho</span>
            <span className="xs:hidden">Nhập</span>
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`py-3 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "data"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500"
            }`}
          >
            <LayoutGrid className="h-4 w-4" /> Data{" "}
            <span className="hidden xs:inline">Đã Nhập</span>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-1">
              {filteredData.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`py-3 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "config"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500"
            }`}
          >
            <List className="h-4 w-4" /> Cấu Hình{" "}
            <span className="hidden xs:inline">Data</span>
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full ml-1">
              {masterData.length}
            </span>
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === "input" && (
          <div className="flex flex-col lg:flex-row gap-6 animate-fade-in-up">
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center rounded-t-xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Thông tin chi tiết
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  {new Date().toLocaleDateString("vi-VN")}
                </span>
              </div>
              <form
                id="hookForm"
                onSubmit={handleSubmit}
                className="p-4 md:p-6 space-y-4 md:space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">
                      NGÀY NHẬP
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        name="date"
                        required
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-lg text-base md:text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">
                      MÃ
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="id"
                        required
                        value={formData.id}
                        onChange={handleChange}
                        placeholder="M001"
                        className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg text-base md:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">
                      ĐƠN HÀNG
                    </label>
                    <input
                      type="text"
                      name="order"
                      required
                      value={formData.order}
                      onChange={handleChange}
                      placeholder="Đơn hàng..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base md:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs font-bold text-blue-800 uppercase block mb-3">
                    Chọn Code (Từ Danh Mục)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Combobox
                        label="Code Móc Quần"
                        name="pantsCode"
                        value={formData.pantsCode}
                        onChange={handleChange}
                        options={suggestions.pantsCode}
                        placeholder="Chọn Code Quần..."
                        icon={PantsIcon}
                      />
                    </div>
                    <div>
                      <Combobox
                        label="Code Móc Áo"
                        name="shirtCode"
                        value={formData.shirtCode}
                        onChange={handleChange}
                        options={suggestions.shirtCode}
                        placeholder="Chọn Code Áo..."
                        icon={Shirt}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Combobox
                      label="MÀU MÓC"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      options={suggestions.color}
                      placeholder="Đen, Trắng..."
                      icon={Palette}
                      required
                    />
                  </div>
                  <div>
                    <Combobox
                      label="NHÓM NHẬN"
                      name="group"
                      value={formData.group}
                      onChange={handleChange}
                      options={suggestions.group}
                      placeholder="Tổ may..."
                      icon={Users}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                      SỐ LƯỢNG
                    </label>
                    <div className="relative">
                      <Box className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="number"
                        name="quantity"
                        required
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg text-base md:text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="lg:w-72 flex flex-col gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <button
                  type="submit"
                  form="hookForm"
                  disabled={status === "submitting"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:bg-blue-300 text-sm md:text-base"
                >
                  {status === "submitting" ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {status === "submitting" ? "Đang lưu..." : "Lưu Dữ Liệu"}
                </button>
              </div>
              {status === "success" && (
                <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold">Đã nhập kho!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ... (Các phần Tab Data và Config giữ nguyên như cũ) ... */}
        {activeTab === "data" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <span className="text-sm font-bold text-slate-700 whitespace-nowrap flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" /> Chọn Năm:
                </span>
                {["2024", "2025", "2026"].map((year) => (
                  <label
                    key={year}
                    className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-bold border transition-all select-none ${
                      selectedYears.includes(year)
                        ? "bg-blue-100 text-blue-700 border-blue-300"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedYears.includes(year)}
                      onChange={() => toggleYear(year)}
                    />{" "}
                    {year}
                  </label>
                ))}
              </div>
              <button
                onClick={() => fetchData(false)}
                disabled={isFetching}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:bg-indigo-300"
              >
                {isFetching ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isFetching ? "Đang tải..." : "Tải Dữ Liệu"}
              </button>
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Bộ Lọc
                  </h3>
                  {(filterId ||
                    filterCode ||
                    filterGroup ||
                    filterStartDate ||
                    filterEndDate) && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors animate-fade-in"
                    >
                      <X className="h-3 w-3" /> Xóa bộ lọc
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Lọc Mã..."
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Lọc Code..."
                    value={filterCode}
                    onChange={(e) => setFilterCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Lọc Nhóm..."
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-sm outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">
                      TỪ NGÀY
                    </label>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-sm outline-none text-slate-600 appearance-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">
                      ĐẾN NGÀY
                    </label>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-base md:text-sm outline-none text-slate-600 appearance-none"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:w-72 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-5 text-white flex flex-col justify-center">
                <div className="flex items-center gap-2 opacity-80 mb-1">
                  <Calculator className="h-5 w-5" />
                  <span className="text-sm font-medium">Tổng SL (Đã lọc)</span>
                </div>
                <div className="text-4xl font-bold tracking-tight">
                  {totalQuantity.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-sm text-left relative">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3">Ngày</th>
                      <th className="px-4 py-3">Mã</th>
                      <th className="px-4 py-3">Đơn</th>
                      <th className="px-4 py-3">Code Quần</th>
                      <th className="px-4 py-3">Code Áo</th>
                      <th className="px-4 py-3">Màu</th>
                      <th className="px-4 py-3">Nhóm</th>
                      <th className="px-4 py-3 text-right">SL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => (
                        <tr key={index} className="hover:bg-blue-50 group">
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.displayDate ||
                              (item.date && String(item.date).split("T")[0])}
                          </td>
                          <td className="px-4 py-3 font-medium text-blue-600 whitespace-nowrap">
                            {item.id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.order}
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {item.pantsCode || "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {item.shirtCode || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.color}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.group}
                          </td>
                          <td className="px-4 py-3 text-right font-bold whitespace-nowrap flex items-center justify-end gap-2">
                            {editingItem &&
                            editingItem.tempId === item.tempId ? (
                              <div className="flex items-center gap-1">
                                <input
                                  autoFocus
                                  type="number"
                                  className="w-20 px-2 py-1 border border-blue-500 rounded text-right focus:outline-none"
                                  value={editingItem.quantity}
                                  onChange={(e) =>
                                    setEditingItem({
                                      ...editingItem,
                                      quantity: e.target.value,
                                    })
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && handleUpdateQuantity()
                                  }
                                />
                                <button
                                  onClick={handleUpdateQuantity}
                                  disabled={isUpdating}
                                  className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="p-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                  <XCircle className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span>{item.quantity}</span>
                                <button
                                  onClick={() =>
                                    setEditingItem({
                                      tempId: item.tempId,
                                      rowIndex: item.rowIndex,
                                      year: item.year,
                                      quantity: item.quantity,
                                    })
                                  }
                                  className="opacity-0 group-hover:opacity-100 p-1 text-blue-400 hover:text-blue-600 transition-opacity"
                                  title="Sửa số lượng"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-12 text-center text-slate-400"
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* THANH PHÂN TRANG */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Trang {currentPage} / {totalPages} ({filteredData.length}{" "}
                    dòng)
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-600"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-600"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "config" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg p-6 text-white mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6" /> Quản Lý Danh Mục (Master Data)
              </h2>
              <p className="text-sm opacity-90 mt-1">
                Dữ liệu bạn thêm ở đây sẽ được đồng bộ lên Google Sheet và hiển
                thị ở mọi máy khi nhập liệu.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-500" /> Thêm Dữ Liệu Mẫu
                </h3>
                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">
                      LOẠI DỮ LIỆU
                    </label>
                    <select
                      value={configInput.type}
                      onChange={(e) =>
                        setConfigInput({ ...configInput, type: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base md:text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="pantsCode">Code Quần</option>
                      <option value="shirtCode">Code Áo</option>
                      <option value="color">Màu Sắc</option>
                      <option value="group">Nhóm Nhận</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">
                      GIÁ TRỊ (Tên/Mã)
                    </label>
                    <input
                      type="text"
                      value={configInput.value}
                      onChange={(e) =>
                        setConfigInput({
                          ...configInput,
                          value: e.target.value,
                        })
                      }
                      placeholder="VD: Đen, Tổ 1..."
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base md:text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg flex justify-center items-center gap-2 disabled:bg-slate-400"
                  >
                    {isSavingConfig ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}{" "}
                    Lưu vào Danh Mục
                  </button>
                </form>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: "pantsCode",
                    title: "Code Quần",
                    icon: PantsIcon,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    id: "shirtCode",
                    title: "Code Áo",
                    icon: Shirt,
                    color: "text-indigo-600",
                    bg: "bg-indigo-50",
                  },
                  {
                    id: "color",
                    title: "Màu Sắc",
                    icon: Palette,
                    color: "text-pink-600",
                    bg: "bg-pink-50",
                  },
                  {
                    id: "group",
                    title: "Nhóm Nhận",
                    icon: Users,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                ].map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <div
                      className={`px-4 py-3 border-b border-slate-100 flex items-center gap-2 ${category.bg}`}
                    >
                      <category.icon className={`h-4 w-4 ${category.color}`} />
                      <span className={`text-sm font-bold ${category.color}`}>
                        {category.title}
                      </span>
                      <span className="ml-auto text-xs bg-white px-2 py-0.5 rounded-full text-slate-500 border">
                        {
                          masterData.filter((m) => m.type === category.id)
                            .length
                        }
                      </span>
                    </div>
                    <div className="p-2 max-h-48 overflow-y-auto">
                      <ul className="space-y-1">
                        {masterData
                          .filter((m) => m.type === category.id)
                          .map((item, idx) => (
                            <li
                              key={idx}
                              className="text-sm px-3 py-1.5 bg-slate-50 rounded text-slate-700 hover:bg-slate-100 flex justify-between group"
                            >
                              {item.value}
                            </li>
                          ))}
                        {masterData.filter((m) => m.type === category.id)
                          .length === 0 && (
                          <p className="text-xs text-slate-400 text-center py-4 italic">
                            Chưa có dữ liệu mẫu
                          </p>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* KHOẢNG TRẮNG NÉ QUẢNG CÁO */}
      <div className="h-32 w-full bg-transparent"></div>

      {showGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 p-4 flex justify-between items-center sticky top-0">
              <h2 className="text-white font-bold flex gap-2">
                <BookOpen className="h-5 w-5" /> Cập nhật Script (V4 - Quan
                Trọng)
              </h2>
              <button onClick={() => setShowGuide(false)}>
                <X className="text-white" />
              </button>
            </div>
            <div className="p-6 text-sm text-slate-700 space-y-4">
              <p className="font-bold text-red-600 bg-red-50 p-3 rounded border border-red-200">
                Bạn cần cập nhật mã Script mới V4 để sử dụng tính năng "Sửa Số
                Lượng"!
              </p>
              <div className="bg-slate-800 text-slate-200 p-3 rounded-lg relative font-mono text-xs max-h-60 overflow-y-auto">
                <pre>{googleScriptCode}</pre>
                <button
                  onClick={() => copyToClipboard(googleScriptCode)}
                  className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
              <p>
                Sau khi cập nhật, nhớ bấm <b>Deploy {">"} New Deployment</b>.
              </p>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="font-bold mb-4">Kết nối Google Sheet</h3>
            <input
              type="text"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="URL Web App..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 hover:bg-slate-100 rounded"
              >
                Hủy
              </button>
              <button
                onClick={() => handleUrlSave(scriptUrl)}
                className="px-4 py-2 bg-blue-600 text-white rounded font-bold"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
