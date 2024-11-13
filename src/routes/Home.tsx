import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	APIProvider,
	Map as GoogleMap,
	Marker,
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
import { Polygon } from "@/components/maps";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Icons
import { PlusIcon } from "@radix-ui/react-icons";

// Stores
import { usePolygonStore } from "@/store/usePolygonStore";

const Home = () => {
	const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

	const navigate = useNavigate();
	const locationState = useGeolocation();
	const { toast } = useToast();
	const polygons = usePolygonStore((state) => state.polygons);
	const editPolygons = usePolygonStore((state) => state.editPolygons);
	const deletePolygon = usePolygonStore((state) => state.deletePolygon);
	const clearAllPolygons = usePolygonStore((state) => state.clearAllPolygons);

	const [open, setOpen] = useState(false); // Control drawer visibility
	const [selectedPolygon, setSelectedPolygon] = useState(null); // Store the selected polygon's details

	const [edit, setEdit] = useState(false);
	const [editData, setEditData] = useState({
		name: "",
		price: 0,
	});

	if (locationState.loading) {
		return <p>Loading... (you may need to enable permissions)</p>;
	}

	const currentLocation = {
		lat: locationState.latitude || 0,
		lng: locationState.longitude || 0,
	};

	// Handle Polygon Click: Set the selected polygon and open the drawer
	const handlePolygonClick = (polygon) => {
		setSelectedPolygon(polygon);
		setEditData(polygon);
		setOpen(true);
	};

	const handleEditPolygon = () => {
		const newDataSet = polygons.map((polygon) => {
			if (polygon.name === selectedPolygon.name) {
				return {
					...editData,
					coordinates: polygon.coordinates,
				};
			}
			return polygon;
		});

		editPolygons(newDataSet);
		toast({
			title: "Polygon Edited",
			description: "The polygon was successfully edited.",
		});

		setOpen(false);
		setEdit(false);
	};

	return (
		<div className="w-full h-screen py-4 space-y-4 overflow-hidden">
			<div className="w-[90%] mx-auto flex items-center justify-end gap-4">
				<Button onClick={() => navigate("/add-polygon")}>
					<PlusIcon />
					Add Polygon
				</Button>
			</div>

			<Card className="w-[90%] h-[90%] mx-auto rounded-md">
				<CardHeader>
					<CardTitle>Google Maps</CardTitle>
					<CardDescription>
						Rendering current location with marker
					</CardDescription>
				</CardHeader>
				<CardContent>
					<APIProvider apiKey={GOOGLE_MAPS_KEY}>
						<GoogleMap
							className="w-full h-[65vh]"
							defaultCenter={currentLocation}
							defaultZoom={13}
							gestureHandling={"greedy"}
							disableDefaultUI={true}
						>
							<Marker position={currentLocation} />

							{polygons.map((polygon) => (
								<Polygon
									key={polygon.id}
									// coordinates={polygon.coordinates}
									name={polygon.name}
									price={polygon.price}
									onClick={() => handlePolygonClick(polygon)} // Handle polygon click
									strokeColor={polygon.color}
									fillColor={polygon.color}
									fillOpacity={0.35}
									paths={polygon.coordinates}
								/>
							))}
						</GoogleMap>
					</APIProvider>

					<div className="flex items-center justify-center w-full gap-4 p-2 bg-white rounded">
						<Button variant="destructive" onClick={clearAllPolygons}>
							Clear All Polygons
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Drawer to show polygon details */}
			{/* <Drawer open={open} onOpenChange={setOpen}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>{selectedPolygon?.name}</DrawerTitle>
						<DrawerDescription>
							Price: ${selectedPolygon?.price}
						</DrawerDescription>
					</DrawerHeader>
				</DrawerContent>
			</Drawer> */}

			<Sheet open={open} onOpenChange={setOpen}>
				{/* <SheetTrigger>Open</SheetTrigger> */}

				<SheetContent className="space-y-4">
					<SheetHeader>
						<SheetTitle>{selectedPolygon?.name}</SheetTitle>
						<SheetDescription>
							Price: ${selectedPolygon?.price}
						</SheetDescription>
					</SheetHeader>
					{edit ? (
						<div className="space-y-4">
							<div>
								<Label>Name</Label>
								<Input
									value={editData.name}
									onChange={(e) =>
										setEditData({ ...editData, name: e.target.value })
									}
								/>
							</div>
							<div>
								<Label>Price</Label>
								<Input
									value={editData.price}
									onChange={(e) =>
										setEditData({ ...editData, price: Number(e.target.value) })
									}
								/>
							</div>
							<div className="space-x-4">
								<Button onClick={handleEditPolygon}>Save</Button>
								<Button
									variant={"outline"}
									onClick={() => {
										setEdit(!edit);
										// setEditData({
										// 	name: "",
										// 	price: 0,
										// });
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					) : (
						<div className="space-x-4">
							<Button onClick={() => setEdit(!edit)}>Edit</Button>
							<Button
								variant={"destructive"}
								onClick={() => {
									deletePolygon(selectedPolygon);
									setOpen(false);
									toast({
										title: "Polygon Deleted",
										description: "The polygon was successfully deleted.",
									});
								}}
							>
								Delete Polygon
							</Button>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default Home;
