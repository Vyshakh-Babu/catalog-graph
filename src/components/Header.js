import React from "react";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
	const tabStyles = { fontWeight: 'bold', textTransform: 'none' }; // Adjust padding here
	const location = useLocation(); // Get the current location

	const value = location.pathname;

	return (
		<Box sx={{ width: "75%", margin: "0", textAlign: "left", mt: 2 }}>
			<AppBar position="static" color="transparent" elevation={0}>
				<Tabs value={value} indicatorColor="primary" textColor="inherit" variant="fullWidth" >
					<Tab label="Summary" sx={tabStyles} component={Link} to="/summary" value="/summary" />
					<Tab label="Chart" sx={{ ...tabStyles, color: '#000000' }} component={Link} to="/chart" value="/chart" />
					<Tab label="Statistics" sx={tabStyles} component={Link} to="/statistics" value="/statistics" />
					<Tab label="Analysis" sx={tabStyles} component={Link} to="/analysis" value="/analysis" />
					<Tab label="Settings" sx={tabStyles} component={Link} to="/settings" value="/settings" />
				</Tabs>
			</AppBar>
		</Box>
	);
};

export default Header;
