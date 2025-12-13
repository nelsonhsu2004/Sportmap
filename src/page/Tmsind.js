import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    MapContainer, 
    TileLayer, 
    Marker, 
    Popup, 
    useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "./markercluster.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import stores from "../stores.json";

// ------------------------------------------------------------------
// 距離計算（公尺）
// ------------------------------------------------------------------
const getDistance = (lat1, lng1, lat2, lng2) =>
    L.latLng(lat1, lng1).distanceTo(L.latLng(lat2, lng2));

// ------------------------------------------------------------------
// Map Event Updater
// ------------------------------------------------------------------
const MapEventUpdater = ({ allMarkers, setFilteredMarkers }) => {
    const map = useMapEvents({
        moveend: () => updateMarkersInView(map),
        zoomend: () => updateMarkersInView(map),
        load: () => updateMarkersInView(map)
    });

    const updateMarkersInView = useCallback((currentMap) => {
        const bounds = currentMap.getBounds();
        const hits = allMarkers.filter(marker =>
            bounds.contains(L.latLng(marker.lat, marker.lng))
        );
        setFilteredMarkers(hits);
    }, [allMarkers, setFilteredMarkers]);

    useEffect(() => {
        if (allMarkers.length > 0 && map) updateMarkersInView(map);
    }, [allMarkers, map, updateMarkersInView]);

    return null;
};

// ------------------------------------------------------------------
// 主組件
// ------------------------------------------------------------------
function TmsInd() {
    const [allMarkers, setAllMarkers] = useState([]);
    const [filteredMarkers, setFilteredMarkers] = useState([]);
    const [comments, setComments] = useState(() => {
        // 從 localStorage 讀取已保存的留言
        try {
            const saved = localStorage.getItem('storeComments');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    const [commentInput, setCommentInput] = useState({});
    const [expandedStore, setExpandedStore] = useState(null);
    const mapRef = useRef(null); 

    const categories = [
        { type: "健身房", color: "#e74c3c" },
        { type: "舞蹈", color: "#9b59b6" },
        { type: "游泳池", color: "#3498db" },
        { type: "溜冰", color: "#f1c40f" },
        { type: "武術", color: "#e67e22" },
        { type: "體適能", color: "#2ecc71" },
        { type: "瑜珈", color: "#1abc9c" },
        { type: "其他", color: "#7f8c8d" },
    ];

    // ------------------------------------------------------------------
    // 抓資料 + 計算最近用品店距離
    // ------------------------------------------------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/tmsind");
                const data = await response.json();

                setAllMarkers(data.map(item => {
                    const lat = Number(item.Latitude);
                    const lng = Number(item.Longitude);

                    let minDistance = Infinity;
                    let nearestStore = null;

                    stores.forEach(store => {
                        const d = getDistance(lat, lng, store.lat, store.lng);
                        if (d < minDistance) {
                            minDistance = d;
                            nearestStore = store;
                        }
                    });

                    return {
                        lat,
                        lng,
                        sportType: item.SportType1,
                        rawType: item.SportType,
                        company: item.CompanyName1,
                        phone: item.Tel,
                        address: item.Address1,
                        nearestStoreName: nearestStore?.name,
                        distanceToStore: minDistance,
                        nearestStoreLat: nearestStore?.lat,
                        nearestStoreLng: nearestStore?.lng
                    };
                }));

            } catch (error) {
                console.error("抓取資料失敗", error);
            }
        };

        fetchData();
    }, []);

    // ------------------------------------------------------------------
    // 留言自動儲存到 localStorage
    // ------------------------------------------------------------------
    useEffect(() => {
        try {
            localStorage.setItem('storeComments', JSON.stringify(comments));
            console.log('留言已保存到本地存儲:', comments);
        } catch (error) {
            console.error('保存留言到 localStorage 失敗:', error);
        }
    }, [comments]);

    // ------------------------------------------------------------------
    // Icon
    // ------------------------------------------------------------------
    const getDivIcon = (type) => {
        const category = categories.find(c => c.type === type);
        const color = category ? category.color : "#7f8c8d";

        return L.divIcon({
            className: "custom-div-icon",
            html: `<div style="display:flex;flex-direction:column;align-items:center;">
                        <div style="
                            background-color:${color};
                            color:white;
                            padding:2px 6px;
                            border-radius:4px;
                            font-size:12px;
                            white-space:nowrap;
                            margin-top:2px;">
                            ${type}
                        </div>
                    </div>`,
            iconSize: [50, 30],
            iconAnchor: [25, 15],
            popupAnchor: [0, -15]
        });
    };

    // 運動用品店 Marker（深藍N設計）
    const getStoreIcon = () => {
        return L.divIcon({
            className: "store-marker",
            html: `<div style="
                        width: 45px;
                        height: 45px;
                        background: #003d99;
                        border-radius: 22px;
                        color: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 28px;
                        font-weight: bold;
                        border: 3px solid white;
                        box-shadow: 0 0 8px rgba(0, 61, 153, 0.6);
                    ">N</div>`,
            iconSize: [45, 45],
            iconAnchor: [22, 45],
            popupAnchor: [0, -45]
        });
    };

    // ------------------------------------------------------------------
    // 類別點擊
    // ------------------------------------------------------------------
    const handleCategoryClick = (type) => {
        const hits = allMarkers.filter(m => m.sportType === type);
        if (!hits.length) {
            alert(`找不到 ${type} 類別的資料`);
            setFilteredMarkers([]);
            return;
        }
        const first = hits[0];
        mapRef.current?.setView([first.lat, first.lng], 15);
        setFilteredMarkers(hits);
    };

    // 點擊最近用品店
    const moveToStore = (lat, lng) => {
        mapRef.current?.setView([lat, lng], 16);
    };

    // ------------------------------------------------------------------
    // 留言功能
    // ------------------------------------------------------------------
    // Google Apps Script - 儲存留言
    const saveCommentToSheet = async (storeName, storeAddress, comment) => {
        const key = `${storeName}-${storeAddress}`;
        
        try {
            // 替換為你的 Google Apps Script 部署 URL
            const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxX-nbYltS9_tNu7Wov-l1UC_nGbjkJzeAnbe8RvvgJCfwRReC8Nxr7q7mpCUeq29MyJQ/exec';

            console.log('開始發送留言到 Google Sheet...', { storeName, storeAddress, comment });

            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp: new Date().toLocaleString('zh-TW'),
                    storeName: storeName,
                    storeAddress: storeAddress,
                    comment: comment
                })
            });

            console.log('回應狀態:', response.status, response.statusText);

            // 由於使用 no-cors 模式，無法直接讀取回應內容
            // 所以直接認為成功並本地儲存
            setComments(prev => ({
                ...prev,
                [key]: [...(prev[key] || []), {
                    timestamp: new Date().toLocaleString('zh-TW'),
                    text: comment
                }]
            }));
            setCommentInput(prev => ({ ...prev, [key]: '' }));
            alert('✅ 留言已儲存！');
            
        } catch (error) {
            console.error('儲存留言失敗:', error);
            
            // 失敗時仍然本地儲存
            setComments(prev => ({
                ...prev,
                [key]: [...(prev[key] || []), {
                    timestamp: new Date().toLocaleString('zh-TW'),
                    text: comment
                }]
            }));
            setCommentInput(prev => ({ ...prev, [key]: '' }));
            
            // 提示用戶
            alert(`⚠️ 儲存失敗: ${error.message}\n\n但留言已保存到本地。`);
        }
    };

    // 處理留言提交
    const handleCommentSubmit = (storeName, storeAddress) => {
        const key = `${storeName}-${storeAddress}`;
        const inputText = commentInput[key] || '';
        
        if (!inputText.trim()) {
            alert('請輸入留言內容');
            return;
        }

        saveCommentToSheet(storeName, storeAddress, inputText);
    };

    // ------------------------------------------------------------------
    // JSX
    // ------------------------------------------------------------------
    return (
        <div className="App">
            <div className="banner" style={{ marginBottom: '3px', paddingTop: '20px', paddingBottom: '20px' }}>
                <p style={{ 
                    fontSize: '32px',
                    fontWeight: 'bold',
                    margin: '0',
                    color: '#fff',
                    letterSpacing: '2px',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    textAlign: 'center'
                }}>運動產業群聚分佈</p>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '0px', padding: '0 15px' }}>
                {/* 左邊：卡片和地圖 */}
                <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* 頂部卡片 */}
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div className="card" style={{ flex: '1' }}>
                            <label style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#1a1a1a',
                                letterSpacing: '1px',
                                display: 'block',
                                marginBottom: '15px',
                                paddingBottom: '10px',
                                borderBottom: '2px solid #003d99'
                            }}>選擇想要查看的產業</label>
                            <div>
                                {categories.map(category => {
                                    const count = filteredMarkers.filter(m => m.sportType === category.type).length;
                                    return (
                                        <button
                                            key={category.type}
                                            style={{
                                                backgroundColor: category.color,
                                                color: "#fff",
                                                border: "none",
                                                padding: "8px 16px",
                                                margin: "5px",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => handleCategoryClick(category.type)}
                                        >
                                            {category.type} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="card" style={{ flex: '1' }}>
                            <label style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#1a1a1a',
                                letterSpacing: '1px',
                                display: 'block',
                                marginBottom: '15px',
                                paddingBottom: '10px',
                                borderBottom: '2px solid #003d99'
                            }}>運動用品店</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {stores.slice(0, 2).map((store, index) => {
                                    const storeKey = `${store.name}-${store.address}`;
                                    const isExpanded = expandedStore === storeKey;
                                    const storeComments = comments[storeKey] || [];

                                    return (
                                        <div key={`store-${index}`} style={{ borderBottom: '1px solid #eee' }}>
                                            <div 
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: isExpanded ? '#f0f4ff' : 'white'
                                                }}
                                                onClick={() => {
                                                    moveToStore(store.lat, store.lng);
                                                    setExpandedStore(isExpanded ? null : storeKey);
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isExpanded) e.currentTarget.style.backgroundColor = '#f0f4ff';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isExpanded) e.currentTarget.style.backgroundColor = 'white';
                                                }}
                                            >
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: '#003d99',
                                                    borderRadius: '20px',
                                                    color: 'white',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                    border: '2px solid white',
                                                    boxShadow: '0 0 6px rgba(0, 61, 153, 0.5)',
                                                    flexShrink: 0
                                                }}>N</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', fontSize: '13px' }}>{store.name}</p>
                                                    <p style={{ margin: '0', fontSize: '11px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📍 {store.address || '地址未提供'}</p>
                                                </div>
                                                <span style={{ fontSize: '12px', color: '#003d99', fontWeight: 'bold' }}>
                                                    💬 {storeComments.length}
                                                </span>
                                            </div>

                                            {/* 展開的留言區域 */}
                                            {isExpanded && (
                                                <div style={{
                                                    padding: '15px',
                                                    backgroundColor: '#f9f9f9',
                                                    borderTop: '1px solid #eee'
                                                }}>
                                                    {/* 留言輸入框 */}
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <textarea
                                                            placeholder="在此輸入您的留言..."
                                                            value={commentInput[storeKey] || ''}
                                                            onChange={(e) => setCommentInput(prev => ({ ...prev, [storeKey]: e.target.value }))}
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd',
                                                                fontSize: '11px',
                                                                fontFamily: 'inherit',
                                                                boxSizing: 'border-box',
                                                                minHeight: '60px',
                                                                resize: 'vertical'
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleCommentSubmit(store.name, store.address)}
                                                            style={{
                                                                marginTop: '8px',
                                                                padding: '6px 12px',
                                                                backgroundColor: '#003d99',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                width: '100%',
                                                                transition: 'background-color 0.3s'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = '#002d6d';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = '#003d99';
                                                            }}
                                                        >
                                                            📤 提交留言
                                                        </button>
                                                    </div>

                                                    {/* 留言列表 */}
                                                    {storeComments.length > 0 && (
                                                        <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                                                            <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 'bold', color: '#1a1a1a' }}>
                                                                留言紀錄 ({storeComments.length})
                                                            </p>
                                                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                                {storeComments.map((comment, idx) => (
                                                                    <div key={idx} style={{
                                                                        backgroundColor: 'white',
                                                                        padding: '8px',
                                                                        marginBottom: '8px',
                                                                        borderRadius: '4px',
                                                                        border: '1px solid #eee'
                                                                    }}>
                                                                        <p style={{ margin: '0 0 4px 0', fontSize: '10px', color: '#999' }}>
                                                                            {comment.timestamp}
                                                                        </p>
                                                                        <p style={{ margin: '0', fontSize: '11px', color: '#333', lineHeight: '1.4', wordBreak: 'break-word' }}>
                                                                            {comment.text}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 地圖 */}
                    <div className="MapContainerWrapper" style={{ height:"400px", flex: 1 }}>
                        <MapContainer center={[25.033964, 121.562321]} zoom={12} style={{ width:"100%", height:"100%" }} ref={mapRef}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapEventUpdater allMarkers={allMarkers} setFilteredMarkers={setFilteredMarkers} />

                        {/* 運動用品店 Marker - 始終顯示，不被Cluster影響 */}
                        {stores.map((store, i) => (
                            <Marker
                                key={`store-${i}`}
                                position={[store.lat, store.lng]}
                                icon={getStoreIcon()}
                            >
                                <Popup>
                                    🏬 <b>{store.name}</b><br/>
                                    地址：{store.address || '未提供'}
                                </Popup>
                            </Marker>
                        ))}

                        <MarkerClusterGroup>
                            {/* 產業點 */}
                            {allMarkers.map((m, i) => (
                                <Marker key={i} position={[m.lat, m.lng]} icon={getDivIcon(m.sportType)}>
                                    <Popup>
                                        📍 <b>{m.company}</b><br/>
                                        類別：{m.sportType}<br/>
                                        地址：{m.address}<br/>
                                        <hr/>
                                        🏪 最近用品店：<span
                                            style={{textDecoration:"underline", color:"#1abc9c", cursor:"pointer"}}
                                            onClick={() => moveToStore(m.nearestStoreLat, m.nearestStoreLng)}
                                        >
                                            {m.nearestStoreName}
                                        </span><br/>
                                        📏 距離：{(m.distanceToStore/1000).toFixed(2)} km
                                    </Popup>
                                </Marker>
                            ))}
                        </MarkerClusterGroup>
                    </MapContainer>
                    </div>
                </div>

                {/* 右邊：結果列表 */}
                <div className="result" style={{ fontSize:'12px', color:'#666', flex:'1', minWidth:'280px', height: '800px', overflow:'auto', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontWeight:'bold', marginTop: '0', marginBottom: '15px', fontSize: '14px' }}>📍 地圖視窗內前 5 筆結果 ({filteredMarkers.length} 筆)</p>
                    <div className="result-list" style={{ display:'flex', flexDirection:'column', gap:'10px', flex: 1, overflow: 'auto' }}>
                        {filteredMarkers.slice(0,5).map((m,i)=>(
                            <div key={i} style={{ border:'1px solid #ddd', padding:'10px', borderRadius:'5px', background:'#f9f9f9', cursor:'pointer' }}
                                 onClick={() => mapRef.current?.setView([m.lat, m.lng], 16)}>
                                <h4 style={{ margin:'5px 0' }}>{i+1}. {m.company}</h4>
                                <p style={{ margin: '3px 0' }}>類別：{m.sportType}</p>
                                <p style={{ margin: '3px 0' }}>最近用品店：<span
                                    style={{textDecoration:"underline", color:"#1abc9c", cursor:"pointer"}}
                                    onClick={() => moveToStore(m.nearestStoreLat, m.nearestStoreLng)}
                                >
                                    {m.nearestStoreName}
                                </span></p>
                                <p style={{ margin: '3px 0' }}>距離：{(m.distanceToStore/1000).toFixed(2)} km</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TmsInd;
