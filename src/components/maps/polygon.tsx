// /* eslint-disable complexity */
// import {
// 	forwardRef,
// 	useContext,
// 	useEffect,
// 	useImperativeHandle,
// 	useMemo,
// 	useRef,
// } from "react";
// import { GoogleMapsContext, useMapsLibrary } from "@vis.gl/react-google-maps";

// import type { Ref } from "react";

// type PolygonEventProps = {
// 	onClick?: (e: google.maps.MapMouseEvent) => void;
// 	onDrag?: (e: google.maps.MapMouseEvent) => void;
// 	onDragStart?: (e: google.maps.MapMouseEvent) => void;
// 	onDragEnd?: (e: google.maps.MapMouseEvent) => void;
// 	onMouseOver?: (e: google.maps.MapMouseEvent) => void;
// 	onMouseOut?: (e: google.maps.MapMouseEvent) => void;
// };

// type PolygonCustomProps = {
// 	encodedPaths?: string[];
// 	name?: string; // Add name for the polygon
// 	price?: number; // Add price for the polygon
// };

// export type PolygonProps = google.maps.PolygonOptions &
// 	PolygonEventProps &
// 	PolygonCustomProps;

// export type PolygonRef = Ref<google.maps.Polygon | null>;

// function usePolygon(props: PolygonProps) {
// 	const {
// 		onClick,
// 		onDrag,
// 		onDragStart,
// 		onDragEnd,
// 		onMouseOver,
// 		onMouseOut,
// 		encodedPaths,
// 		name, // Name of the polygon
// 		price, // Price of the polygon
// 		...polygonOptions
// 	} = props;

// 	const callbacks = useRef<Record<string, (e: unknown) => void>>({});
// 	Object.assign(callbacks.current, {
// 		onClick,
// 		onDrag,
// 		onDragStart,
// 		onDragEnd,
// 		onMouseOver,
// 		onMouseOut,
// 	});

// 	const geometryLibrary = useMapsLibrary("geometry");
// 	const polygon = useRef(new google.maps.Polygon()).current;
// 	const infoWindowRef = useRef<google.maps.InfoWindow | null>(null); // Ref for InfoWindow

// 	// Update polygon options
// 	useMemo(() => {
// 		polygon.setOptions(polygonOptions);
// 	}, [polygon, polygonOptions]);

// 	const map = useContext(GoogleMapsContext)?.map;

// 	// Update the path with the encodedPath if provided
// 	useMemo(() => {
// 		if (!encodedPaths || !geometryLibrary) return;
// 		const paths = encodedPaths.map((path) =>
// 			geometryLibrary.encoding.decodePath(path),
// 		);
// 		polygon.setPaths(paths);
// 	}, [polygon, encodedPaths, geometryLibrary]);

// 	// Create polygon and InfoWindow when map is available
// 	useEffect(() => {
// 		if (!map) {
// 			if (map === undefined)
// 				console.error("<Polygon> must be inside a Map component.");
// 			return;
// 		}

// 		// Set polygon on map
// 		polygon.setMap(map);

// 		// Attach the click event listener
// 		if (onClick) {
// 			google.maps.event.addListener(
// 				polygon,
// 				"click",
// 				(e: google.maps.MapMouseEvent) => {
// 					// Create InfoWindow only on polygon click
// 					if (!infoWindowRef.current) {
// 						const bounds = new google.maps.LatLngBounds();
// 						polygon.getPath().forEach((latLng) => bounds.extend(latLng));
// 						const center = bounds.getCenter();

// 						// Create a new InfoWindow and set its content
// 						const infoWindow = new google.maps.InfoWindow({
// 							content: `<div><strong>${name}</strong><br>Price: $${price}</div>`,
// 							position: center,
// 						});

// 						// Open the InfoWindow on the map
// 						infoWindow.open(map);
// 						infoWindowRef.current = infoWindow;

// 						// Close the InfoWindow if it's clicked again or when the polygon is clicked elsewhere
// 						google.maps.event.addListener(infoWindow, "closeclick", () => {
// 							infoWindowRef.current = null; // Reset the reference
// 						});
// 					}
// 				},
// 			);
// 		}

// 		return () => {
// 			polygon.setMap(null); // Clean up the polygon from the map
// 			if (infoWindowRef.current) {
// 				infoWindowRef.current.close(); // Close the InfoWindow on cleanup
// 			}
// 		};
// 	}, [map, polygon, name, price, onClick]);

// 	// Attach event listeners to the polygon for drag, mouseover, etc.
// 	useEffect(() => {
// 		if (!polygon) return;

// 		const gme = google.maps.event;
// 		[
// 			["click", "onClick"],
// 			["drag", "onDrag"],
// 			["dragstart", "onDragStart"],
// 			["dragend", "onDragEnd"],
// 			["mouseover", "onMouseOver"],
// 			["mouseout", "onMouseOut"],
// 		].forEach(([eventName, eventCallback]) => {
// 			gme.addListener(polygon, eventName, (e: google.maps.MapMouseEvent) => {
// 				const callback = callbacks.current[eventCallback];
// 				if (callback) callback(e);
// 			});
// 		});

// 		return () => {
// 			gme.clearInstanceListeners(polygon); // Clean up event listeners
// 		};
// 	}, [polygon]);

// 	return polygon;
// }

// /**
//  * Component to render a polygon on a map with an InfoWindow displaying name and price on click
//  */
// export const Polygon = forwardRef((props: PolygonProps, ref: PolygonRef) => {
// 	const polygon = usePolygon(props);

// 	useImperativeHandle(ref, () => polygon, []);

// 	return null;
// });

import {
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { GoogleMapsContext, useMapsLibrary } from "@vis.gl/react-google-maps";

type PolygonEventProps = {
	onClick?: (e: google.maps.MapMouseEvent) => void;
	onDrag?: (e: google.maps.MapMouseEvent) => void;
	onDragStart?: (e: google.maps.MapMouseEvent) => void;
	onDragEnd?: (e: google.maps.MapMouseEvent) => void;
	onMouseOver?: (e: google.maps.MapMouseEvent) => void;
	onMouseOut?: (e: google.maps.MapMouseEvent) => void;
};

type PolygonCustomProps = {
	encodedPaths?: string[];
	name?: string;
	price?: number;
};

export type PolygonProps = google.maps.PolygonOptions &
	PolygonEventProps &
	PolygonCustomProps;
export type PolygonRef = Ref<google.maps.Polygon | null>;

function usePolygon(props: PolygonProps) {
	const {
		onClick,
		onDrag,
		onDragStart,
		onDragEnd,
		onMouseOver,
		onMouseOut,
		encodedPaths,
		name,
		price,
		...polygonOptions
	} = props;

	const callbacks = useRef<Record<string, (e: unknown) => void>>({});
	Object.assign(callbacks.current, {
		onClick,
		onDrag,
		onDragStart,
		onDragEnd,
		onMouseOver,
		onMouseOut,
	});

	const geometryLibrary = useMapsLibrary("geometry");
	const polygon = useRef(new google.maps.Polygon()).current;
	const labelRef = useRef<google.maps.OverlayView | null>(null);

	// Custom OverlayView for the label
	class LabelOverlay extends google.maps.OverlayView {
		private position: google.maps.LatLng;
		private content: string;
		private div: HTMLDivElement | null = null;

		constructor(position: google.maps.LatLng, content: string) {
			super();
			this.position = position;
			this.content = content;
		}

		onAdd() {
			const div = document.createElement("div");
			div.style.position = "absolute";
			div.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
			div.style.padding = "8px";
			div.style.borderRadius = "4px";
			div.style.fontSize = "14px";
			div.style.fontWeight = "bold";
			div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
			div.style.transform = "translate(-50%, -50%)"; // Center the label
			div.style.zIndex = "1000"; // Ensure high z-index
			div.style.pointerEvents = "none"; // Allow clicks to pass through
			div.innerHTML = this.content;
			this.div = div;

			// Use overlayMouseTarget pane to ensure the label appears above the polygon
			const panes = this.getPanes();
			panes?.overlayMouseTarget.appendChild(div);
		}

		draw() {
			if (!this.div) return;

			const overlayProjection = this.getProjection();
			const position = overlayProjection.fromLatLngToDivPixel(this.position);

			if (position) {
				this.div.style.left = position.x + "px";
				this.div.style.top = position.y + "px";
			}
		}

		onRemove() {
			if (this.div) {
				this.div.parentNode?.removeChild(this.div);
				this.div = null;
			}
		}
	}

	// Update polygon options
	useMemo(() => {
		polygon.setOptions({
			...polygonOptions,
			clickable: true,
			zIndex: 1, // Ensure polygon has a lower z-index than labels
		});
	}, [polygon, polygonOptions]);

	const map = useContext(GoogleMapsContext)?.map;

	// Update the path with the encodedPath if provided
	useMemo(() => {
		if (!encodedPaths || !geometryLibrary) return;
		const paths = encodedPaths.map((path) =>
			geometryLibrary.encoding.decodePath(path),
		);
		polygon.setPaths(paths);
	}, [polygon, encodedPaths, geometryLibrary]);

	// Create polygon and label when map is available
	useEffect(() => {
		if (!map) {
			if (map === undefined) {
				console.error("<Polygon> must be inside a Map component.");
			}
			return;
		}

		polygon.setMap(map);

		// Calculate center of polygon and create label
		const updateLabel = () => {
			if (labelRef.current) {
				labelRef.current.setMap(null);
			}

			const bounds = new google.maps.LatLngBounds();
			polygon.getPath().forEach((latLng) => bounds.extend(latLng));
			const center = bounds.getCenter();

			const formattedPrice = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			}).format(price || 0);

			const content = `
        <div>
          <div style="color: #1a1a1a">${name || ""}</div>
          <div style="color: #2563eb">${formattedPrice}</div>
        </div>
      `;

			const label = new LabelOverlay(center, content);
			label.setMap(map);
			labelRef.current = label;
		};

		// Update label on polygon changes
		google.maps.event.addListener(polygon.getPath(), "set_at", updateLabel);
		google.maps.event.addListener(polygon.getPath(), "insert_at", updateLabel);
		google.maps.event.addListener(polygon.getPath(), "remove_at", updateLabel);

		// Initial label creation
		updateLabel();

		return () => {
			polygon.setMap(null);
			if (labelRef.current) {
				labelRef.current.setMap(null);
			}
		};
	}, [map, polygon, name, price]);

	// Attach event listeners to the polygon
	useEffect(() => {
		if (!polygon) return;

		const gme = google.maps.event;
		[
			["click", "onClick"],
			["drag", "onDrag"],
			["dragstart", "onDragStart"],
			["dragend", "onDragEnd"],
			["mouseover", "onMouseOver"],
			["mouseout", "onMouseOut"],
		].forEach(([eventName, eventCallback]) => {
			gme.addListener(polygon, eventName, (e: google.maps.MapMouseEvent) => {
				const callback = callbacks.current[eventCallback];
				if (callback) callback(e);
			});
		});

		return () => {
			gme.clearInstanceListeners(polygon);
		};
	}, [polygon]);

	return polygon;
}

export const Polygon = forwardRef((props: PolygonProps, ref: PolygonRef) => {
	const polygon = usePolygon(props);
	useImperativeHandle(ref, () => polygon, []);
	return null;
});
