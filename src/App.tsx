import { useState } from "react";
import { GoogleMap, LoadScript, Polygon, Marker } from "@react-google-maps/api";

interface LatLng {
	lat: number;
	lng: number;
}

interface PolygonData {
	name: string;
	coordinates: LatLng[];
	markers: LatLng[];
}

const App = () => {
	const GOOGLE_MAPS_KEY = "AIzaSyDdxCKVSzSf5K_ys6fM7mB9eOwKTcYr_Sk";

	const [polygonPaths, setPolygonPaths] = useState<LatLng[]>([]); // เก็บพิกัด Polygon
	const [markers, setMarkers] = useState<LatLng[]>([]); // เก็บหมุดที่ปัก

	// ฟังก์ชันเพิ่มหมุดเมื่อคลิกบนแผนที่
	const handleMapClick = (event: google.maps.MapMouseEvent) => {
		if (!event.latLng) return;

		const newMarker: LatLng = {
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
		};

		// อัปเดตหมุดใหม่
		setMarkers((current) => [...current, newMarker]);
		setPolygonPaths((current) => [...current, newMarker]);

		console.log("Polygon Paths:", [...polygonPaths, newMarker]); // Log polygon paths
	};

	// ฟังก์ชันลบหมุดล่าสุด
	const handleUndoLastMarker = () => {
		setMarkers((current) => current.slice(0, -1)); // ลบหมุดสุดท้ายออก
		setPolygonPaths((current) => current.slice(0, -1)); // ลบพิกัดสุดท้ายออกจาก Polygon
	};

	// ฟังก์ชันส่งข้อมูล Polygon ไปยัง API
	const handleSavePolygon = async (): Promise<void> => {
		if (polygonPaths.length < 3) {
			alert("กรุณาปักหมุดอย่างน้อย 3 จุดเพื่อสร้าง Polygon");
			return;
		}

		try {
			const data: PolygonData = {
				name: "My Polygon Area",
				coordinates: polygonPaths,
				markers: markers,
			};

			console.log(data, "data");

			// const response = await axios.post(
			//   "https://{{API_URL}}/api/polygon-areas",
			//   data,
			// );
			// if (response.status === 201) {
			//   alert("บันทึก Polygon สำเร็จ");
			// } else {
			//   alert("เกิดข้อผิดพลาดในการบันทึก Polygon");
			// }
		} catch (error) {
			console.error("Error saving polygon:", error);
			alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
		}
	};

	return (
		<div className="w-full h-screen overflow-hidden ">
			<div className="w-[90%] h-[90%] mx-auto py-4 rounded-md shadow-md">
				<LoadScript googleMapsApiKey={GOOGLE_MAPS_KEY}>
					<GoogleMap
						mapContainerStyle={{ width: "100%", height: "100%" }}
						center={{ lat: 40.758896, lng: -73.98513 }}
						zoom={14}
						onClick={handleMapClick}
					>
						{/* แสดงหมุดที่ปัก */}
						{markers.map((marker) => (
							<Marker key={`${marker.lat}-${marker.lng}`} position={marker} />
						))}

						{/* แสดง Polygon ถ้ามี 3 จุดขึ้นไป */}
						{polygonPaths.length >= 3 && (
							<Polygon
								paths={polygonPaths}
								options={{
									fillColor: "blue",
									fillOpacity: 0.4,
									strokeColor: "blue",
									strokeOpacity: 0.8,
									strokeWeight: 2,
								}}
							/>
						)}
					</GoogleMap>
				</LoadScript>
			</div>

			<div
				className="flex items-center justify-center w-full gap-4 p-2 bg-white rounded shadow "
				style={{ marginTop: "10px" }}
			>
				<button
					type="button"
					onClick={handleUndoLastMarker}
					className="p-2 border"
				>
					Undo Last Marker
				</button>

				<button
					type="button"
					onClick={handleSavePolygon}
					className="p-2 border"
				>
					Save Polygon Area
				</button>
			</div>
		</div>
	);
};

export default App;
