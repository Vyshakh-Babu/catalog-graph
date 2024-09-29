import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { usePrice } from "../context/PriceContext";
import { AddCircleOutline } from "@mui/icons-material";
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement, Filler } from "chart.js";
import styles from './ChartComponent.module.css';

const PRIMARY_COLOR = "#4940e5";

const dottedLinePlugin = {
  id: 'dottedLinePlugin',
  afterDraw: ({ tooltip, ctx, chartArea }) => {
    const activePoints = tooltip._active;

    if (activePoints?.length) {
      const { x, y } = activePoints[0].element;

      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';

      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    }
  },
};

ChartJS.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement, Filler, dottedLinePlugin);

const ChartComponent = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const chartRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastPointPosition, setLastPointPosition] = useState({ x: 0, y: 0 });
  const [lastPointValue, setLastPointValue] = useState(null);
  const { setPrice } = usePrice();

  const fetchData = async (days) => {
    try {
      const { data } = await axios.get("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart", {
        params: { vs_currency: "usd", days, interval: "daily" }
      });
      const prices = data.prices.map(item => item[1]);
      const labels = data.prices.map(item => new Date(item[0]).toLocaleDateString());
      const todayPrice = prices.at(-1);
      const yesterdayPrice = prices.at(-2);
      setPrice({ amount: todayPrice, difference: todayPrice - yesterdayPrice });

      setChartData({
        labels,
        datasets: [{
          data: prices,
          fill: true,
          borderColor: PRIMARY_COLOR,
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return "rgba(73, 64, 229, 0.356)";
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(141, 136, 235, 0.356)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0.5)");
            return gradient;
          },
          borderWidth: 2,
          tension: 0,
          pointRadius: 0,
        }],
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chart data", error);
    }
  };

  useEffect(() => {
    fetchData(days);
  }, [days]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        intersect: false,
        mode: "nearest",
        position: "nearest",
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { display: false } },
      y: { grid: { display: false }, ticks: { display: false }, beginAtZero: false },
    },
  }), []);

  const handleFullscreen = () => {
    const element = document.getElementById("chart-container");
    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.log(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const renderButton = useCallback((label, value) => (
    <Button
      onClick={() => {
        setDays(value);
        fetchData(value);
      }}
      sx={{ bgcolor: days === value ? PRIMARY_COLOR : "transparent", color: days === value ? "white" : "inherit", textTransform: 'none', px: 1, "&:hover": { bgcolor: PRIMARY_COLOR, color: "white" } }}>
      {label}
    </Button>
  ), [days, fetchData]);

  useEffect(() => {
    if (chartData.labels && chartData.datasets) {
      const lastIndex = chartData.labels.length - 1;
      const lastValue = chartData.datasets[0].data[lastIndex];
      const lastPointX = chartRef.current.scales.x.getPixelForValue(lastIndex);
      const lastPointY = chartRef.current.scales.y.getPixelForValue(lastValue);
      setLastPointPosition({ x: lastPointX, y: lastPointY });
      setLastPointValue(new Intl.NumberFormat().format(lastValue?.toFixed(2)));
    }
  }, [chartData]);

  return (
    <Box mt={4} id="chart-container" className={`${isFullscreen ? styles.fullscreen : ""} ${styles.chartContainer}`}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center">
          <IconButton color="default" onClick={handleFullscreen} title="Fullscreen">
            {isFullscreen ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
          </IconButton>
          <Typography variant="body1" color="textPrimary" ml={1} onClick={handleFullscreen} style={{ cursor: "pointer" }}>
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </Typography>
          <IconButton color="default" title="Compare" sx={{ ml: 2 }}>
            <AddCircleOutline />
          </IconButton>
          <Typography variant="body1" color="textPrimary" ml={1} style={{ cursor: "pointer" }}>
            Compare
          </Typography>
        </Box>
        <Box display="flex">
          {renderButton("1d", 1)}
          {renderButton("3d", 3)}
          {renderButton("1w", 7)}
          {renderButton("1m", 30)}
          {renderButton("6m", 180)}
          {renderButton("1y", 365)}
          {renderButton("max", "max")}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" style={{ height: '100%' }}>
          <Typography variant="body1">Loading chart...</Typography>
        </Box>
      ) : (
        <Box position="relative" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : 'auto', backgroundColor: "white" }}>
          <Line ref={chartRef} data={chartData} options={options} />
          {!isFullscreen && lastPointValue && (
            <Typography
              variant="body2"
              className={styles.tooltip}
              style={{ left: lastPointPosition.x, top: lastPointPosition.y - 20 }}
            >
              {lastPointValue}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ChartComponent;
