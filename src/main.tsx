import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/toaster.tsx";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

//  Pages
import Home from "./routes/Home.tsx";
import AddPolygon from "./routes/AddPolygon.tsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/add-polygon",
		element: <AddPolygon />,
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
		<Toaster />
	</StrictMode>,
);
