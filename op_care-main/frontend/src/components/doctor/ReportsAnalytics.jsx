import React, { useEffect, useState } from "react";

export default function ReportsAnalytics() {
  const [data, setData] = useState({
    appointmentTrends: [],
    hospitalUsage: [],
    topDoctors: [],
  });
  const [filters, setFilters] = useState({
    trendsPeriod: "week",
    trendsHospital: "",
    trendsDoctor: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch appointment trends with filters
      const trendsParams = new URLSearchParams({
        period: filters.trendsPeriod,
        limit: "12",
      });
      if (filters.trendsHospital)
        trendsParams.append("hospital", filters.trendsHospital);
      if (filters.trendsDoctor)
        trendsParams.append("doctor", filters.trendsDoctor);

      const [trendsRes, usageRes, performanceRes] = await Promise.all([
        fetch(`/api/analytics/appointment-trends?${trendsParams.toString()}`),
        fetch("/api/analytics/hospital-usage"),
        fetch("/api/analytics/doctor-performance?limit=15"),
      ]);

      const [trends, usage, performance] = await Promise.all([
        trendsRes.json(),
        usageRes.json(),
        performanceRes.json(),
      ]);

      setData({
        appointmentTrends: trends.trends || [],
        hospitalUsage: usage.hospitalUsage || [],
        topDoctors: performance.doctorPerformance || [],
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  // Simple line chart component
  const LineChart = ({
    data,
    title,
    xKey,
    yKey,
    width = 600,
    height = 300,
  }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
          No data available
        </div>
      );
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxY = Math.max(...data.map((d) => d[yKey]));
    const minY = 0;

    const points = data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * chartWidth;
        const y =
          chartHeight - ((d[yKey] - minY) / (maxY - minY)) * chartHeight;
        return `${x + margin.left},${y + margin.top}`;
      })
      .join(" ");

    return (
      <div>
        <h4 style={{ margin: "0 0 10px 0", textAlign: "center" }}>{title}</h4>
        <svg
          width={width}
          height={height}
          style={{ border: "1px solid #e0e0e0" }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = margin.top + (i * chartHeight) / 4;
            return (
              <line
                key={i}
                x1={margin.left}
                y1={y}
                x2={width - margin.right}
                y2={y}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            );
          })}

          {/* Data line */}
          <polyline
            points={points}
            fill="none"
            stroke="#007bff"
            strokeWidth="2"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * chartWidth + margin.left;
            const y =
              chartHeight -
              ((d[yKey] - minY) / (maxY - minY)) * chartHeight +
              margin.top;
            return <circle key={i} cx={x} cy={y} r="4" fill="#007bff" />;
          })}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const value = Math.round((maxY / 4) * i);
            const y = margin.top + chartHeight - (i * chartHeight) / 4;
            return (
              <text
                key={i}
                x={margin.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {value}
              </text>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 6) === 0) {
              const x = (i / (data.length - 1)) * chartWidth + margin.left;
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {d[xKey].slice(-5)}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    );
  };

  // Simple bar chart component
  const BarChart = ({ data, title, xKey, yKey, width = 600, height = 300 }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
          No data available
        </div>
      );
    }

    const margin = { top: 20, right: 30, bottom: 60, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxY = Math.max(...data.map((d) => d[yKey]));
    const barWidth = (chartWidth / data.length) * 0.8;
    const barSpacing = chartWidth / data.length;

    return (
      <div>
        <h4 style={{ margin: "0 0 10px 0", textAlign: "center" }}>{title}</h4>
        <svg
          width={width}
          height={height}
          style={{ border: "1px solid #e0e0e0" }}
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = margin.top + (i * chartHeight) / 4;
            return (
              <line
                key={i}
                x1={margin.left}
                y1={y}
                x2={width - margin.right}
                y2={y}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            );
          })}

          {/* Bars */}
          {data.slice(0, 10).map((d, i) => {
            const barHeight = (d[yKey] / maxY) * chartHeight;
            const x =
              margin.left + i * barSpacing + (barSpacing - barWidth) / 2;
            const y = margin.top + chartHeight - barHeight;

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#28a745"
                  opacity="0.8"
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 30}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                  transform={`rotate(-45, ${x + barWidth / 2}, ${height - 30})`}
                >
                  {d[xKey].slice(0, 12)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#333"
                >
                  {d[yKey]}
                </text>
              </g>
            );
          })}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const value = Math.round((maxY / 4) * i);
            const y = margin.top + chartHeight - (i * chartHeight) / 4;
            return (
              <text
                key={i}
                x={margin.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {value}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Reports & Analytics</h2>

      {loading && (
        <div style={{ textAlign: "center", padding: 20, color: "#666" }}>
          Loading analytics data...
        </div>
      )}

      {/* Appointment Trends Section */}
      <div
        style={{
          marginBottom: 40,
          padding: 20,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>📈 Appointment Trends</h3>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <select
            value={filters.trendsPeriod}
            onChange={(e) =>
              setFilters({ ...filters, trendsPeriod: e.target.value })
            }
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <input
            type="text"
            placeholder="Hospital ID (optional)"
            value={filters.trendsHospital}
            onChange={(e) =>
              setFilters({ ...filters, trendsHospital: e.target.value })
            }
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          />
          <input
            type="text"
            placeholder="Doctor ID (optional)"
            value={filters.trendsDoctor}
            onChange={(e) =>
              setFilters({ ...filters, trendsDoctor: e.target.value })
            }
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          />
        </div>

        <LineChart
          data={data.appointmentTrends}
          title={`Appointments per ${filters.trendsPeriod}`}
          xKey="period"
          yKey="count"
          width={800}
          height={300}
        />
      </div>

      {/* Hospital Usage Section */}
      <div
        style={{
          marginBottom: 40,
          padding: 20,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>🏥 Hospital Usage Comparison</h3>
        <BarChart
          data={data.hospitalUsage}
          title="Total Appointments per Hospital"
          xKey="hospitalName"
          yKey="totalAppointments"
          width={800}
          height={350}
        />

        {/* Hospital details table */}
        <div style={{ marginTop: 20, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: 12,
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  Hospital
                </th>
                <th
                  style={{
                    padding: 12,
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}
                >
                  City
                </th>
                <th
                  style={{
                    padding: 12,
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  Total Appointments
                </th>
                <th
                  style={{
                    padding: 12,
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  Completed
                </th>
                <th
                  style={{
                    padding: 12,
                    border: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  Utilization %
                </th>
              </tr>
            </thead>
            <tbody>
              {data.hospitalUsage.slice(0, 10).map((hospital) => (
                <tr key={hospital.hospitalId}>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>
                    {hospital.hospitalName}
                  </td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>
                    {hospital.city}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {hospital.totalAppointments}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {hospital.completedAppointments}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        backgroundColor:
                          hospital.utilizationPercent > 70
                            ? "#dc3545"
                            : hospital.utilizationPercent > 40
                            ? "#ffc107"
                            : "#28a745",
                        color: "white",
                        fontSize: "0.9em",
                      }}
                    >
                      {hospital.utilizationPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Performance Section */}
      <div
        style={{
          padding: 20,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>👨‍⚕️ Doctor Performance Ranking</h3>

        <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
          {/* Top 3 doctors cards */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <h4>🏆 Top Performers</h4>
            {data.topDoctors.slice(0, 3).map((doctor, index) => (
              <div
                key={doctor.doctorId}
                style={{
                  padding: 16,
                  marginBottom: 12,
                  border: "2px solid",
                  borderColor:
                    index === 0
                      ? "#ffd700"
                      : index === 1
                      ? "#c0c0c0"
                      : "#cd7f32",
                  borderRadius: 8,
                  backgroundColor: "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor:
                        index === 0
                          ? "#ffd700"
                          : index === 1
                          ? "#c0c0c0"
                          : "#cd7f32",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "bold" }}>
                      {doctor.doctorName}
                    </div>
                    <div style={{ fontSize: "0.9em", color: "#666" }}>
                      {doctor.specialization} • {doctor.experience} years
                    </div>
                    <div style={{ fontSize: "0.9em", marginTop: 4 }}>
                      <span style={{ color: "#28a745", fontWeight: "bold" }}>
                        {doctor.successRate}% success rate
                      </span>
                      <span style={{ marginLeft: 12, color: "#666" }}>
                        {doctor.totalAppointments} total appointments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full ranking table */}
          <div style={{ flex: 2, minWidth: 400 }}>
            <h4>📋 Complete Ranking</h4>
            <div
              style={{
                maxHeight: 400,
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: 8,
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Rank
                    </th>
                    <th
                      style={{
                        padding: 8,
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Doctor
                    </th>
                    <th
                      style={{
                        padding: 8,
                        border: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      Success Rate
                    </th>
                    <th
                      style={{
                        padding: 8,
                        border: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      Appointments
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topDoctors.map((doctor, index) => (
                    <tr
                      key={doctor.doctorId}
                      style={{
                        backgroundColor: index < 3 ? "#fff8f0" : "white",
                      }}
                    >
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        #{index + 1}
                      </td>
                      <td style={{ padding: 8, border: "1px solid #ddd" }}>
                        <div
                          style={{ fontWeight: index < 3 ? "bold" : "normal" }}
                        >
                          {doctor.doctorName}
                        </div>
                        <div style={{ fontSize: "0.8em", color: "#666" }}>
                          {doctor.specialization}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: 4,
                            backgroundColor:
                              doctor.successRate >= 90
                                ? "#28a745"
                                : doctor.successRate >= 75
                                ? "#17a2b8"
                                : doctor.successRate >= 60
                                ? "#ffc107"
                                : "#dc3545",
                            color: "white",
                            fontSize: "0.8em",
                          }}
                        >
                          {doctor.successRate}%
                        </span>
                      </td>
                      <td
                        style={{
                          padding: 8,
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        {doctor.totalAppointments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
