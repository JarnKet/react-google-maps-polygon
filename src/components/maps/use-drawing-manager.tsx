// import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
// import { useEffect, useState } from "react";

// import { usePolygonStore } from "@/store/usePolygonStore";

// export function useDrawingManager(
// 	initialValue: google.maps.drawing.DrawingManager | null = null,
// ) {
// 	const map = useMap();
// 	const drawing = useMapsLibrary("drawing");
// 	const savePolygon = usePolygonStore((state) => state.savePolygon);

// 	const [drawingManager, setDrawingManager] =
// 		useState<google.maps.drawing.DrawingManager | null>(initialValue);

// 	useEffect(() => {
// 		if (!map || !drawing) return;

// 		// https://developers.google.com/maps/documentation/javascript/reference/drawing
// 		// const newDrawingManager = new drawing.DrawingManager({
// 		// 	map,
// 		// 	drawingMode: google.maps.drawing.OverlayType.CIRCLE,
// 		// 	drawingControl: true,
// 		// 	drawingControlOptions: {
// 		// 		position: google.maps.ControlPosition.TOP_CENTER,
// 		// 		drawingModes: [
// 		// 			google.maps.drawing.OverlayType.MARKER,
// 		// 			google.maps.drawing.OverlayType.CIRCLE,
// 		// 			google.maps.drawing.OverlayType.POLYGON,
// 		// 			google.maps.drawing.OverlayType.POLYLINE,
// 		// 			google.maps.drawing.OverlayType.RECTANGLE,
// 		// 		],
// 		// 	},
// 		// 	markerOptions: {
// 		// 		draggable: true,
// 		// 	},
// 		// 	circleOptions: {
// 		// 		editable: true,
// 		// 	},
// 		// 	polygonOptions: {
// 		// 		editable: true,
// 		// 		draggable: true,
// 		// 	},
// 		// 	rectangleOptions: {
// 		// 		editable: true,
// 		// 		draggable: true,
// 		// 	},
// 		// 	polylineOptions: {
// 		// 		editable: true,
// 		// 		draggable: true,
// 		// 	},
// 		// });

// 		const newDrawingManager = new drawing.DrawingManager({
// 			map,
// 			drawingMode: google.maps.drawing.OverlayType.POLYGON, // Allow polygon drawing
// 			drawingControl: true,
// 			drawingControlOptions: {
// 				position: google.maps.ControlPosition.TOP_CENTER,
// 				drawingModes: [
// 					google.maps.drawing.OverlayType.POLYGON, // Only allow polygon drawing
// 				],
// 			},
// 			polygonOptions: {
// 				editable: true,
// 				draggable: true,
// 			},
// 		});

// 		google.maps.event.addListener(
// 			newDrawingManager,
// 			"polygoncomplete",
// 			(polygon) => {
// 				// Get the polygon's path (coordinates)

// 				const path = polygon.getPath();
// 				const coordinates = path.getArray().map((latLng) => ({
// 					lat: latLng.lat(),
// 					lng: latLng.lng(),
// 				}));

// 				console.log("Polygon coordinates:", coordinates);

// 				// Save the coordinates to Zustand store
// 				// savePolygon({ name: `Polygon ${Date.now()}`, coordinates });

// 				// Optionally stop drawing mode after one polygon is drawn
// 				newDrawingManager.setDrawingMode(null);
// 			},
// 		);

// 		setDrawingManager(newDrawingManager);

// 		return () => {
// 			newDrawingManager.setMap(null);
// 		};
// 	}, [drawing, map]);

// 	return drawingManager;
// }

import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState, useCallback } from "react";

export function useDrawingManager(
	{ onPolygonComplete }: { onPolygonComplete?: (polygonData: any) => void }, // Accept a callback for polygon completion
	initialValue: google.maps.drawing.DrawingManager | null = null,
) {
	const map = useMap();
	const drawing = useMapsLibrary("drawing");

	const [drawingManager, setDrawingManager] =
		useState<google.maps.drawing.DrawingManager | null>(initialValue);

	useEffect(() => {
		if (!map || !drawing) return;

		// Initialize the drawing manager only once
		const newDrawingManager = new drawing.DrawingManager({
			map,
			drawingMode: google.maps.drawing.OverlayType.POLYGON,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					google.maps.drawing.OverlayType.POLYGON,
					google.maps.drawing.OverlayType.MARKER,
				],
			},
			polygonOptions: {
				editable: true,
				draggable: true,
			},
		});

		// Listen for polygon complete event
		const listener = google.maps.event.addListener(
			newDrawingManager,
			"polygoncomplete",
			(polygon) => {
				const path = polygon.getPath();
				const coordinates = path.getArray().map((latLng) => ({
					lat: latLng.lat(),
					lng: latLng.lng(),
				}));

				// If a callback was provided, call it with the polygon data
				if (onPolygonComplete) {
					onPolygonComplete({ coordinates, polygon });
				}

				// Optionally stop drawing mode after one polygon is drawn
				newDrawingManager.setDrawingMode(null);
			},
		);

		// Listen for marker complete event
		const markerListener = google.maps.event.addListener(
			newDrawingManager,
			"markercomplete",
			(marker) => {
				// If a callback was provided, call it with the marker data
				// if (onPolygonComplete) {
				// 	onPolygonComplete({ marker });
				// }

				const position = marker.getPosition();

				const lat = position.lat();
				const lng = position.lng();

				console.log("Marked", marker);
				console.log("Position Lat Lng:", lat, lng);
			},
		);

		setDrawingManager(newDrawingManager);

		return () => {
			// Cleanup: remove the event listener and unset the map
			google.maps.event.removeListener(listener);
			google.maps.event.removeListener(markerListener);
			newDrawingManager.setMap(null);
		};
	}, [drawing, map]); // Only run when `drawing` or `map` changes

	return drawingManager;
}
