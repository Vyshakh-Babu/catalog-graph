import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { usePrice } from "../context/PriceContext";

const PriceDisplay = () => {
	const { price } = usePrice();
	const percentChange = ((price.difference / (price.amount - price.difference)) * 100).toFixed(2);
	const icon = price.difference >= 0 ? "+" : "-";

	return (
		<Box mt={4} textAlign="left" sx={{ padding: "0 20px" }}>
			<Grid container direction="column" alignItems="flex-start">
				<Grid item>
					<Typography variant="h3" style={{ fontWeight: 700 }}>
						{new Intl.NumberFormat().format(price.amount.toFixed(2))}
						<span style={{ fontSize: "18px", verticalAlign: "super", color: "#808080" }}> USD</span>
					</Typography>
					<Typography variant="subtitle1" style={{ color: price.difference >= 0 ? "#28a745" : "#dc3545", marginTop: "5px" }}>
						{icon} {Math.abs(price.difference).toFixed(2)} ({percentChange}%)
					</Typography>
				</Grid>
			</Grid>
		</Box>
	);
};

export default PriceDisplay;
