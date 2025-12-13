import React, { useState, useEffect,useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';  // Leaflet CSS
import "./markercluster.css";
import MarkerClusterGroup from "react-leaflet-cluster";


function TmsInd2(){
    
    //const [sportType, setSportType] = useState("");
    const [result, setResult] = useState(null);
    const [markers, setMarkers] = useState([]);

    const mapRef = useRef(null); // ⭐ 保存 map instance

    useEffect(() => {
        const fetchData = async () => {
            try {
                let apiUrl =''; 
                apiUrl ="http://localhost:5000/tmsind";
                const response = await fetch(apiUrl);
                const data = await response.json();  
                //console.log('data :' , data);              
                setResult(data);  // 假設 API 返回的是結果
                setMarkers(data.map(item => ({
                    lat: Number(item.Latitude),
                    lng: Number(item.Longitude),
                    sportType: item.SportType1,
                    rawType: item.SportType,
                    CompanyName1 : item.CompanyName1,
                    Tel :item.Tel,
                    Address1 :item.Address1
                })));
            } catch (error) {
                console.error("抓取資料失敗", error);
            }
        };

        fetchData();
    }, []);
    

    const categories = [
    { type: "健身房", color: "#e74c3c" },
    { type: "舞蹈", color: "#9b59b6" },
    { type: "游泳池", color: "#3498db" },
    { type: "溜冰", color: "#f1c40f" },
    { type: "武術", color: "#e67e22" },
    { type: "體適能", color: "#2ecc71" },
    { type: "瑜珈", color: "#1abc9c" },
    { type: "其他", color: "#7f8c8d" }, // 統一的 "其他"
    ];


    const getDivIcon = (type) => {
    const color = type === "健身房" ? "#e74c3c" :    // 紅色
              type === "舞蹈" ? "#9b59b6" :      // 紫色
              type === "游泳池" ? "#3498db" :    // 藍色
              type === "溜冰" ? "#f1c40f" :      // 黃色
              type === "武術" ? "#e67e22" :      // 橘色
              type === "體適能" ? "#2ecc71" :    // 綠色
              type === "瑜珈" ? "#1abc9c" :      // 青色
              "#7f8c8d";  

    // const iconUrl = type === "健身房" ? "https://cdn-icons-png.flaticon.com/512/684/684755.png" :
    //                 type === "游泳池" ? "https://cdn-icons-png.flaticon.com/512/684/684702.png" :
    //                 type === "舞蹈" ? "https://cdn-icons-png.flaticon.com/512/684/684901.png" :
    //                 "https://cdn-icons-png.flaticon.com/512/684/684705.png"; // 預設圖示
                       // 灰色（預設）

    return L.divIcon({
        className: "custom-div-icon",
        // html: `
        //     <div style="display: flex; flex-direction: column; align-items: center;">
        //          <img src="${iconUrl}" style="width:30px; height:30px;"/>
        //         <div style="
        //             background-color: ${color};
        //             color: white;
        //             padding: 2px 6px;
        //             border-radius: 4px;
        //             font-size: 12px;
        //             white-space: nowrap;
        //             margin-top: 2px;
        //         ">
        //             ${type}
        //         </div>
        //     </div>
        // `,
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



    // const handleUpdate =() =>{
    //     if (!sportType) return;
    //     const hits = markers.filter(m => m.sportType.includes(sportType));

    //     const count = hits.length;
    //     if (count === 0) {
    //         alert("找不到符合的類別");
    //     return;
    // }

    //     if (hits.length === 0) {
    //         alert("找不到符合的類別");
    //         return;
    //     }

    //     const first = hits[0];

    //     // ⭐ 移動地圖（panTo）
    //     const map = mapRef.current;
    //     if (map) {
    //         map.setView([first.lat, first.lng], 15);
    //     }

    //     console.log("搜尋完成, 移動到：", first);
    // };

    // 3. ⭐ 點擊按鈕時處理地圖平移的函式

    const handleCategoryClick = (type) => {
        // 篩選出該類別的所有標記點
        const hits = markers.filter(m => m.sportType === type);

        const count = hits.length;
        if (count === 0) {
            alert(`找不到 ${type} 類別的資料`);
            return;
        }

        // 取得第一個符合條件的標記點的經緯度
        const first = hits[0];
        
        // ⭐ 使用 mapRef.current 取得地圖實例並平移
        const map = mapRef.current;
        if (map) {
            // 平移到第一個點並放大
            map.setView([first.lat, first.lng], 15);
        }

        console.log(`搜尋完成, 移動到 ${type} 的第一個點:`, first);
    };


    return(
     <div className="App">
            <div className="banner" style={{ marginBottom: '2px' }}>
                <p>群聚分析</p>
            </div>

            {/* 上半部卡片 */}
            <div className="card">
                <label>選擇類別</label>            
            <div>
            {categories.map((category) => {
                const count = markers.filter(m => m.sportType === category.type).length;
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
                        // setSportType(category.type);
                        // handleUpdate();
                        handleCategoryClick(category.type);
                    }} // 設定選擇的類別
                    >
                    {category.type} ({count})
                </button>
                )
            }
            )}
            </div>

            {/* <button onClick={handleUpdate}>搜尋</button> */}
            </div>

            {/* 顯示地圖 */}
            <div style={{ height: "500px", marginTop: "20px" }}>
                <MapContainer
                    //center={[25.067, 121.5139]}
                    center={[25.033964, 121.562321]}
                    zoom={12}
                    style={{ width: "100%", height: "100%" }}
                    ref={mapRef}
                    //whenCreated={setMapInstance} 
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* ⭐ 加入 Marker Cluster */}
                    <MarkerClusterGroup chunkedLoading>
                        {markers.map((marker, index) => (
                            <Marker
                                key={index}
                                position={[marker.lat, marker.lng]}                                
                                icon={getDivIcon(marker.sportType)}  // ⭐ 用顏色分類
                            >
                                <Popup>
                                    <b>{marker.sportType}</b><br/>
                                    {marker.sportType}<br/>
                                    📍({marker.lat}, {marker.lng} ,{marker.CompanyName1},{marker.Tel},{marker.Address1}}
                                    {/* 📍({marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}) */}
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>

            {/* 下半部顯示結果 */}
            <div className="result">
                {result && <p>{JSON.stringify(result)}</p>}
            </div>
        </div>

    );



}

export default TmsInd2;