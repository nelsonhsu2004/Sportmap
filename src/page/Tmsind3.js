import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    MapContainer, 
    TileLayer, 
    Marker, 
    Popup, 
    useMapEvents // ⭐ 引入 useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "./markercluster.css";
import MarkerClusterGroup from "react-leaflet-cluster";

// 處理 Leaflet 預設 Icon 遺失問題
// delete L.Icon.Default.prototype._get
// L.Icon.Default.mergeOptions({
//     iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//     iconUrl: require('leaflet/dist/images/marker-icon.png'),
//     shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });


// ------------------------------------------------------------------
// ⭐ 核心組件：監聽地圖事件並篩選標記點
// ------------------------------------------------------------------
const MapEventUpdater = ({ allMarkers, setFilteredMarkers }) => {
    
    const map = useMapEvents({
        // ... (事件監聽邏輯不變)
        moveend: () => {
            updateMarkersInView(map);
        },
        zoomend: () => {
            updateMarkersInView(map);
        },
        load: () => {
             updateMarkersInView(map);
        }
    });

    // ⭐ 1. 使用 useCallback 穩定化函式
    const updateMarkersInView = useCallback((currentMap) => {
        // 獲取當前地圖的可視邊界 (Bounds)
        const bounds = currentMap.getBounds();
        
        // 篩選 markers：如果標記點的經緯度在邊界範圍內則保留
        const hits = allMarkers.filter(marker => {
            const latLng = L.latLng(marker.lat, marker.lng);
            return bounds.contains(latLng);
        });

        // 更新 State，觸發 TmsInd 組件重新渲染
        setFilteredMarkers(hits);
        console.log(`地圖更新：當前視窗內有 ${hits.length} 筆資料`);
    }, [allMarkers, setFilteredMarkers]); // 依賴項為 allMarkers 和 setFilteredMarkers

    // ⭐ 2. 處理 markers 載入後的首次篩選
    useEffect(() => {
        if (allMarkers.length > 0) {
            // 首次載入時，確保地圖實例已準備好
            if (map) { 
                updateMarkersInView(map); 
            }
        }
    }, [allMarkers, map, updateMarkersInView]); // 依賴項加入 map 和穩定後的 updateMarkersInView

    return null;
};
// const MapEventUpdater = ({ allMarkers, setFilteredMarkers }) => {
//     // 建立事件處理函式
//     const updateMarkersInView = (map) => {
//         // 獲取當前地圖的可視邊界 (Bounds)
//         const bounds = map.getBounds();
        
//         // 篩選 markers：如果標記點的經緯度在邊界範圍內則保留
//         const hits = allMarkers.filter(marker => {
//             const latLng = L.latLng(marker.lat, marker.lng);
//             return bounds.contains(latLng);
//         });

//         // 更新 State，觸發 TmsInd 組件重新渲染
//         setFilteredMarkers(hits);
//         console.log(`地圖更新：當前視窗內有 ${hits.length} 筆資料`);
//     };

//     // 使用 useMapEvents 監聽地圖事件
//     const map = useMapEvents({
//         // 監聽移動結束事件 (用戶平移地圖)
//         moveend: () => {
//             updateMarkersInView(map);
//         },
//         // 監聽縮放結束事件 (用戶縮放地圖)
//         zoomend: () => {
//             updateMarkersInView(map);
//         },
//         // 第一次載入時也執行一次篩選
//         load: () => {
//              updateMarkersInView(map);
//         }
//     });
    
//     // 確保 markers 載入完成後也執行一次篩選
//     useEffect(() => {
//         if (allMarkers.length > 0) {
//             updateMarkersInView(map);
//         }
//     }, [allMarkers]);


//     return null; // 此組件只負責邏輯，不渲染任何內容
// };

// ------------------------------------------------------------------
// ⭐ 主組件
// ------------------------------------------------------------------
function TmsInd(){
    
    // 儲存所有從 API 獲取的標記點
    const [allMarkers, setAllMarkers] = useState([]); 
    // ⭐ 儲存「當前地圖視窗內」的標記點
    const [filteredMarkers, setFilteredMarkers] = useState([]); 

    //const [result,setResult] = useState(null);

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

    // 1. 抓取資料並設定 allMarkers
    useEffect(() => {
        const fetchData = async () => {
            try {
                let apiUrl ="http://localhost:5000/tmsind";
                const response = await fetch(apiUrl);
                const data = await response.json();  
                //setResult(data);
                
                // 儲存所有標記點
                setAllMarkers(data.map(item => ({
                    lat: Number(item.Latitude),
                    lng: Number(item.Longitude),
                    sportType: item.SportType1,
                    rawType: item.SportType,
                    company : item.CompanyName1,
                    phone :item.Tel,
                    address :item.Address1
                })));
                
            } catch (error) {
                console.error("抓取資料失敗", error);
            }
        };
        fetchData();
    }, []);
    

    // 2. 依據類別取得 Icon
    const getDivIcon = (type) => {
        // ... (Icon 函式內容不變，使用 allMarkers 顏色)
        const category = categories.find(c => c.type === type);
        const color = category ? category.color : "#7f8c8d";
        
        return L.divIcon({
            className: "custom-div-icon",
            html: `
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="
                        background-color: ${color};
                        color: white;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 12px;
                        white-space: nowrap;
                        margin-top: 2px;
                    ">
                        ${type}
                    </div>
                </div>
            `,
            iconSize: [50, 30],
            iconAnchor: [25, 15],
            popupAnchor: [0, -15]
        });
    };


    // 3. 點擊按鈕時處理地圖平移 (邏輯不變，仍然移動到該類別第一個點)
    const handleCategoryClick = (type) => {
        const hits = allMarkers.filter(m => m.sportType === type);

        if (hits.length === 0) {
            alert(`找不到 ${type} 類別的資料`);
            setFilteredMarkers([]);
            return;
        }

        const first = hits[0];
        const map = mapRef.current;
        if (map) {
            // 平移到第一個點並放大
            map.setView([first.lat, first.lng], 15);
        }
        setFilteredMarkers(hits);

        console.log(`搜尋完成, 移動到 ${type} 的第一個點`);
    };


    return(
    <div className="App">
        <div className="banner" style={{ marginBottom: '2px' }}>
            <p>運動產業群聚分佈</p>
        </div>

        {/* 上半部卡片 - 類別按鈕 (保持 100% 寬度) */}
        <div className="card">
            <label>選擇想要查看的產業</label>
            <div>
                {categories.map((category) => {
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
                            value={category.type}
                            onClick={() => {
                                handleCategoryClick(category.type);
                            }}
                        >
                            {category.type} ({count})
                        </button>
                    )
                })}
            </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ⭐ 響應式佈局容器：地圖 (70%) + 結果列表 (30%) */}
        {/* ------------------------------------------------------------- */}
        <div 
            className="MapAndResultsContainer"
            style={{ 
                // 這是核心佈局：使用 Flexbox
                display: 'flex', 
                flexDirection: 'row', // 電腦模式：橫向
                flexWrap: 'wrap',     // 允許在手機模式下換行
                marginTop: '20px', 
                gap: '20px', // 間隔
            }}
        >
            
            {/* 1. 地圖區塊 (大螢幕佔 70%) */}
            <div 
                className="MapContainerWrapper"
                style={{ 
                    height: "500px", 
                    // ⭐ 電腦模式下佔用 70% 寬度
                    flex: '3', // 70% (3/4 ≈ 75% 已經很接近) 或使用 '0 0 70%'
                    minWidth: '60%', // 確保在拉伸時有最小寬度
                    // 在手機模式下，flex-wrap 會讓它自動變成 100%
                }}
            >
                <MapContainer
                    center={[25.033964, 121.562321]}
                    zoom={12}
                    // 這裡的 style 必須讓地圖填滿 MapContainerWrapper 
                    style={{ width: "100%", height: "100%" }} 
                    ref={mapRef} 
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapEventUpdater 
                        allMarkers={allMarkers} 
                        setFilteredMarkers={setFilteredMarkers} 
                    />
                    <MarkerClusterGroup chunkedLoading>
                        {allMarkers.map((marker, index) => (
                            <Marker
                                key={index}
                                position={[marker.lat, marker.lng]} 
                                icon={getDivIcon(marker.sportType)}                             
                            >
                                <Popup>
                                    📍<b>類別: {marker.sportType}</b><br/>
                                    公司: {marker.company || '未提供'}<br/> 
                                    電話: {marker.phone || '未提供'}<br/> 
                                    地址: {marker.address || '未提供'}
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>

            {/* 2. 下半部/右側結果顯示區 (大螢幕佔 30%) */}
            <div 
                className="result" 
                style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    // ⭐ 電腦模式下佔用 30% 寬度
                    flex: '1', // 30%
                    minWidth: '300px', // 確保結果欄位不會太窄
                    // 在手機模式下，flex-wrap 會讓它自動變成 100%
                }}
            >
                <p style={{ fontWeight: 'bold' }}>📍 地圖視窗內前 3 筆結果 ({filteredMarkers.length} 筆)</p>
                
                <div className="result-list" style={{ 
                    // 垂直排列列表項
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px', 
                    marginTop: '10px' 
                }}>
                    {filteredMarkers.slice(0, 3).map((marker, index) => (
                        <div 
                            className="result-item" 
                            key={index}
                            style={{ 
                                border: '1px solid #ddd', 
                                padding: '10px', 
                                borderRadius: '5px',
                                backgroundColor: '#f9f9f9'
                            }}
                        >
                            <h4 style={{ color: '#333', margin: '5px 0', fontSize: '14px' }}>
                                {index + 1}. **{marker.company || '未提供公司名稱'}**
                            </h4>
                            <p style={{ margin: '3px 0' }}><strong>類別:</strong> {marker.sportType || '未提供類別'}</p>
                            <p style={{ margin: '3px 0' }}><strong>地址:</strong> {marker.address || '未提供地址'}</p>
                            <p style={{ margin: '3px 0' }}><strong>電話:</strong> {marker.phone || '未提供電話'}</p>
                        </div>
                    ))}
                    
                    {/* 如果沒有結果，顯示提示 */}
                    {allMarkers.length > 0 && filteredMarkers.length === 0 && (
                        <p style={{ color: '#e74c3c', marginTop: '10px' }}>
                            請移動地圖或縮放，查看視窗內的結果。
                        </p>
                    )}
                </div>
            </div>
            
        </div>
        {/* {result} */}
    </div>
    );
}

export default TmsInd;