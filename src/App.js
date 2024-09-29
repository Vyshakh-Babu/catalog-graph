import React from "react";
import { Container } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PriceProvider } from "./context/PriceContext";
import Header from "./components/Header";
import PriceDisplay from "./components/PriceDisplay";
import ChartComponent from "./components/ChartComponent";

function App() {
	return (
		<PriceProvider>
			<Router>
				<Container maxWidth="lg" style={{ width: "65%", margin: "0 auto" }}>
					<PriceDisplay />
					<Header />
					<Routes>
						<Route path="/" element={<ChartComponent />} />
						<Route path="/chart" element={<ChartComponent />} />
						<Route path="/summary" />
						<Route path="/statistics" />
						<Route path="/analysis" />
						<Route path="/settings" />
					</Routes>
				</Container>
			</Router>
		</PriceProvider>
	);
}

export default App;
