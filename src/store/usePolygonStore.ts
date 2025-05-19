import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LatLng {
	lat: number;
	lng: number;
}

export interface Polygon {
	id: string;
	name: string;
	price: number;
	coordinates: LatLng[];
	color: string;
}

interface PolygonStore {
	polygons: Polygon[];
	savePolygon: (newPolygon: Polygon) => void;
	clearAllPolygons: () => void;
	editPolygons: (editPolygons: Polygon[]) => void;
	deletePolygon: (deletePolygon: Polygon) => void;
}

export const usePolygonStore = create<PolygonStore>()(
	persist(
		(set) => ({
			polygons: [],

			savePolygon: (newPolygon: Polygon) =>
				set((state) => ({
					polygons: [...state.polygons, newPolygon],
				})),

			clearAllPolygons: () => set({ polygons: [] }),

			editPolygons: (editPolygons: Polygon[]) =>
				set({ polygons: editPolygons }),

			deletePolygon: (deletePolygon: Polygon) =>
				set((state) => ({
					polygons: state.polygons.filter(
						(polygon) => polygon.name !== deletePolygon.name,
					),
				})),
		}),
		{
			name: "polygon-storage",
		},
	),
);
