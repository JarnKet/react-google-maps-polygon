import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
	APIProvider,
	Map as GoogleMap,
	ControlPosition,
	MapControl,
} from "@vis.gl/react-google-maps";
import { useGeolocation } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UndoRedoControl } from "@/components/maps/undo-redo-control";
import { useDrawingManager } from "@/components/maps/use-drawing-manager";
import { Polygon } from "@/components/maps";
import { usePolygonStore } from "@/store/usePolygonStore";

interface PresetColor {
	name: string;
	value: string;
}

interface ColorSelectorProps {
	selectedColor: string;
	onColorChange: (color: string) => void;
}

interface PolygonFormData {
	coordinates: google.maps.LatLngLiteral[];
	name: string;
	price: number;
	color: string;
}

interface PolygonCompleteData {
	coordinates: google.maps.LatLngLiteral[];
	polygon: google.maps.Polygon;
}

const PRESET_COLORS: PresetColor[] = [
	{ name: "Sky Blue", value: "#87CEEB" },
	{ name: "Mint Green", value: "#98FF98" },
	{ name: "Light Coral", value: "#F08080" },
	{ name: "Lavender", value: "#E6E6FA" },
	{ name: "Peach", value: "#FFE5B4" },
	{ name: "Light Yellow", value: "#FFFFE0" },
	{ name: "Light Pink", value: "#FFB6C1" },
	{ name: "Light Cyan", value: "#E0FFFF" },
	{ name: "Thistle", value: "#D8BFD8" },
	{ name: "Wheat", value: "#F5DEB3" },
];

const ColorSelector = ({
	selectedColor,
	onColorChange,
}: ColorSelectorProps) => {
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Input
					type="color"
					value={selectedColor}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						onColorChange(e.target.value)
					}
					className="w-16 h-8 p-0 overflow-hidden"
				/>
				<span className="text-sm text-gray-500">Selected: {selectedColor}</span>
			</div>
			<div className="grid grid-cols-5 gap-2">
				{PRESET_COLORS.map((color) => (
					<Button
						key={color.value}
						variant="outline"
						className="w-full h-8 p-0"
						style={{ backgroundColor: color.value }}
						onClick={() => onColorChange(color.value)}
						title={color.name}
					/>
				))}
			</div>
		</div>
	);
};

const AddPolygon = () => {
	const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
	const navigate = useNavigate();
	const locationState = useGeolocation();
	const polygons = usePolygonStore((state) => state.polygons);

	if (locationState.loading) {
		return <p>loading... (you may need to enable permissions)</p>;
	}

	const currentLocation = {
		lat: locationState.latitude || 0,
		lng: locationState.longitude || 0,
	};

	return (
		<div className="w-full h-screen py-4 space-y-4 overflow-hidden">
			<div className="w-[90%] mx-auto">
				<Button variant="outline" onClick={() => navigate(-1)}>
					Go Back
				</Button>
			</div>
			<Card className="w-[90%] h-[90%] mx-auto rounded-md">
				<CardHeader>
					<CardTitle>Google Maps</CardTitle>
					<CardDescription>
						Mark 3 or more points to create a polygon
					</CardDescription>
				</CardHeader>
				<CardContent>
					<APIProvider apiKey={GOOGLE_MAPS_KEY}>
						<GoogleMap
							className="w-full h-[70vh]"
							defaultCenter={currentLocation}
							defaultZoom={13}
							gestureHandling="greedy"
							disableDefaultUI={true}
						>
							<MapContent />
							{polygons.map((polygon) => (
								<Polygon
									key={polygon.id}
									paths={polygon.coordinates}
									name={polygon.name}
									price={polygon.price}
									fillColor={polygon.color}
									strokeColor={polygon.color}
								/>
							))}
						</GoogleMap>
					</APIProvider>
				</CardContent>
			</Card>
		</div>
	);
};

const MapContent = () => {
	const navigate = useNavigate();
	const { toast } = useToast();

	const [modal, setModal] = useState<boolean>(false);
	const [polygonData, setPolygonData] = useState<PolygonFormData>({
		coordinates: [],
		name: "",
		price: 0,
		color: PRESET_COLORS[0].value,
	});
	const [currentPolygon, setCurrentPolygon] =
		useState<google.maps.Polygon | null>(null);

	const savePolygon = usePolygonStore((state) => state.savePolygon);

	const handlePolygonComplete = useCallback((data: PolygonCompleteData) => {
		setModal(true);
		setPolygonData((prevData) => ({
			...prevData,
			coordinates: data.coordinates,
		}));
		setCurrentPolygon(data.polygon);
	}, []);

	const handleSavePolygon = () => {
		savePolygon({
			id: `polygon-${Date.now()}`,
			name: polygonData.name,
			price: Number(polygonData.price),
			coordinates: polygonData.coordinates,
			color: polygonData.color,
		});
		setModal(false);
		toast({
			title: "Polygon Saved",
			description: "The polygon was successfully saved.",
		});
		navigate(-1);
	};

	const handleCancelPolygon = () => {
		if (currentPolygon) {
			currentPolygon.setMap(null);
		}
		setModal(false);
		setPolygonData({
			coordinates: [],
			name: "",
			price: 0,
			color: PRESET_COLORS[0].value,
		});
	};

	const handleColorChange = (color: string) => {
		setPolygonData({ ...polygonData, color });
		if (currentPolygon) {
			currentPolygon.setOptions({
				fillColor: color,
				strokeColor: color,
			});
		}
	};

	const drawingManager = useDrawingManager({
		onPolygonComplete: handlePolygonComplete,
	});

	return (
		<>
			<MapControl position={ControlPosition.TOP_CENTER}>
				<UndoRedoControl drawingManager={drawingManager} />
			</MapControl>
			<AlertDialog open={modal} onOpenChange={setModal}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Save Polygon?</AlertDialogTitle>
						<AlertDialogDescription>
							Please enter the information about the Polygon Area
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="space-y-4">
						<div>
							<Label>Polygon Name</Label>
							<Input
								value={polygonData.name}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setPolygonData({ ...polygonData, name: e.target.value })
								}
							/>
						</div>
						<div>
							<Label>Polygon Price</Label>
							<Input
								min={0}
								type="number"
								value={polygonData.price}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setPolygonData({
										...polygonData,
										price: Number(e.target.value),
									})
								}
							/>
						</div>
						<div>
							<Label>Polygon Color</Label>
							<ColorSelector
								selectedColor={polygonData.color}
								onColorChange={handleColorChange}
							/>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCancelPolygon}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={
								polygonData.name === "" || Number(polygonData.price) <= 0
							}
							onClick={handleSavePolygon}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default AddPolygon;
